// import express framework
const express = require('express');

// import CORS to make requests
const cors = require('cors');

// Import node-fetch to be able to use fetch()
const fetch = require('node-fetch');

const { createClient } = require('@supabase/supabase-js');

// create my Express application
const app = express();

// manully set port to 3001 but when i add vercel i will make it check for environment variable 
const PORT = 3001;

// Turns on CORS for all route 
app.use(cors());

// parses incoming JSON request bodies 
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Base URL for the API
const CROSSREF_BASE = 'https://api.crossref.org';

const MAILTO = 'scholarvault@example.com';


// This helper function takes in raw CrossRef response object and transforms it into a clean, flat object for frontend
function cleanPaper(item) {
    return {
      // Gets the DOI if the DOI is undefined then doi becomes null
      doi: item.DOI || null,
      // A crossref response has the title in a array, so we access the first element or Untitled if none given
      title: item.title?.[0] || 'Untitled',

      // checks if item.authors exists, if it does i loop through each author object,
      // combing first and last name also trimming white space and joining them witha comma 
      // if no authors then returns Unknown Author
      authors: item.author
        ? item.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()).join(', ')
        : 'Unknown Author',

      // grab index 0 using bracket notation 
      journal: item['container-title']?.[0] || 'Unknown Journal',

      // crossref returns a nested ds so need to use [0].[0] to get year
      // use ? just in case any level is missing 
      year: item.published?.['date-parts']?.[0]?.[0] || null,

      // returns 0 ONLY if null or undefined 
      citations: item['is-referenced-by-count'] ?? 0,

      // returns the item type of the object 
      type: item.type || null,

      // retrieve the publisher 
      publisher: item.publisher || null,
      // retrieve the volume 
      volume: item.volume || null,
      // retrieve the issue 
      issue: item.issue || null,
      // retrieve the page 
      page: item.page || null,

      // abstract returns wrapped in XML tags, so i use regex to strip all the XML tags
      // leaving plain text
      abstract: item.abstract
        ? item.abstract.replace(/<[^>]*>/g, '').trim()
        : null,

      // if any license entries contains creative commons then the paper is open access 
      openAccess: item.license?.some(l =>
        l.URL?.includes('creativecommons')
      ) || false,


      url: item.DOI ? `https://doi.org/${item.DOI}` : null,
      references: item.reference || [],
  };
}

// GET /api/search - keyword search with filters
app.get('/api/search', async (req, res) => {
  try {
    // destructure all the query params from the URL 
    const {
      q ='',
      page = 1,
      rows = 10,
      type,
      fromYear, 
      toYear,
      sort,
      order = 'desc',
      openAccess,
    } = req.query;

    // if no search term provided sends back a 400 error, a bad request 
    // stops function from continuing 
    if (!q.trim()) {
      return res.status(400).json({ error: 'Query param q is required' });
    }


    // convert page number to an int then subtract by one and multiply by how many pages i want to skip which is 10
    // so for page 1 -> 1 - 1 * 10 which is 0 i will skip none.
    const offset = (parseInt(page) - 1) * parseInt(rows);

    const params = new URLSearchParams({
      query: q,
      rows: rows,
      offset: offset,
      mailto: MAILTO,
      select: 'title,author,DOI,published,container-title,is-referenced-by-count,type,license,publisher',
    });


    // building filter string 
    const filters = [];
    if (type) filters.push(`type:${type}`);
    if (fromYear) filters.push(`from-pub-date:${fromYear}-01-01`);
    if (toYear) filters.push(`until-pub-date:${toYear}-12-31`);
    if (openAccess === 'true') filters.push('has-license:true');
    // now params appends the filters with a comma
    if (filters.length > 0) params.append('filter', filters.join(','));

    // sort 
    if (sort) {
      params.append('sort', sort);
      params.append('order', order);
    }

    // build final crossref url to fetch 
    const url = `${CROSSREF_BASE}/works?${params.toString()}`;

    // fetching 
    const response = await fetch(url);

    // parses the JSON response
    const data = await response.json();

    // pulls out items array 
    const items = data.message?.items || [];

    // and total count 
    // i use ? to protect against any malformed responses 
    const total = data.message?.['total-results'] || 0;

    // send the cleaned response back 
    res.json({
      total,
      page: parseInt(page),
      rows: parseInt(rows),
      totalPages: Math.ceil(total / parseInt(rows)),
      results: items.map(cleanPaper),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from CrossRef' });
  }
});

// GET /api/paper/* - single paper by DOI, needed to downgrade to express 4
app.get('/api/paper/*', async (req, res) => {
  try {
    const doi = req.params[0];
    if (!doi) {
      return res.status(400).json({ error: 'DOI is required' });
    }

    const url = `${CROSSREF_BASE}/works/${doi}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    const data = await response.json();
    const paper = cleanPaper(data.message);

    res.json(paper);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch paper.' });
  }
});


// supabase routes 
// when frontend loads saved page this is called to retrieve all saved papers
app.get('/api/saved', async (req, res) => {
  try {
    // tell supabase to look into saved_tables table i created
    const { data, error } = await supabase
      .from('saved_papers')
      // select all 
      .select('*')
      // sort by newest 
      .order('saved_at', { ascending: false });

    // if returns error pass it to catch block
    if (error) throw error;

    // if not send the array of papers back to frontend as json
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch saved papers' });
  }
});

// POST route to save a paper 
app.post('/api/saved', async (req, res) => {
  try {
    // grabs paper which frontend sends in request body
    const paper = req.body;

    // checks if paper is already saved 
    const { data: existing } = await supabase
      .from('saved_papers')
      .select('id')
      // checks if doi matches doi in database
      .eq('doi', paper.doi)
      // return one row 
      .single()

    // if found return 409, as a duplicate is found 
    if (existing) {
      return res.status(409).json({ error: 'paper saved already' })
    }

    // insert a new row into the saved_papers table
    const { data, error } = await supabase
      .from('saved_papers')
      .insert([{
        doi: paper.doi,
        title: paper.title,
        authors: paper.authors,
        journal: paper.journal,
        year: paper.year,
        citations: paper.citations,
        type: paper.type,
        open_access: paper.openAccess,
        notes: ''
      }])
      // retrieve new row back 
      .select()
      .single();

    if (error) throw error;

    // send new row back to frontend
    res.json(data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to saved paper'})
  }
});

// DELETE route
app.delete('/api/saved/:doi', async (req, res) => {
  try {

    // reads doi from url and decodes it 
    const doi = decodeURIComponent(decodeURIComponent(req.params.doi));

    // delete row where doi matches
    const { error } = await supabase
      .from('saved_papers')
      .delete()
      .eq('doi', doi);

    if (error) throw error;

    // send back a success confirmation
    res.json({ success: true })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove paper' })
  }
});


// PUT route for updating notes
app.put('/api/saved/:doi/notes', async (req, res) => {
  try {

    // get doi from url 
    const doi = decodeURIComponent(decodeURIComponent(req.params.doi));

    // get notes from request body
    const { notes } = req.body;

    // update notes columns which has the same doi 
    const { error } = await supabase
      .from('saved_papers')
      .update({ notes })
      .eq('doi', doi)

    if (error) throw error;

    // send back success confirmation
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});


// check api health 
app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('saved_papers').select('id').limit(1);
  res.json({
    status: 'ok',
    supabase: error ? 'disconnected' : 'connected',
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`ScholarVault backend running on http://localhost:${PORT}`)
  })
}

module.exports = app;