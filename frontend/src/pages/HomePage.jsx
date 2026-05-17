
import { useState, useCallback }from 'react';
import "../styles/HomePage.css";
import PaperCard from "../components/PaperCard";

const FIELD_FILTERS = [
    { label: 'All Types', value: '' },
    { label: 'Journal Articles', value: 'journal-article' },
    { label: 'Conference Papers', value: 'proceedings-article' },
    { label: 'Book Chapters', value: 'book-chapter' },
];

const SORT_OPTIONS = [
    { label: 'Most Relevant', value: '' },
    { label: 'Most Cited', value: 'is-referenced-by-count' },
    { label: 'Newest First', value: 'published' },
];

const YEAR_OPTIONS = [
  { label: 'Any Year', from: '', to: '' },
  { label: '2024–2025', from: '2024', to: '2025' },
  { label: '2020–2023', from: '2020', to: '2023' },
  { label: '2015–2019', from: '2015', to: '2019' },
  { label: 'Before 2015', from: '', to: '2014' },
];
 

export default function HomePage() {
    // stores the submitted search terms
    const [query, setQuery] = useState('');

    // Stores what use is typing
    const [inputVal, setInputVal] = useState('');

    // Array of paper objects which retrieved from backend 
    const [results, setResults] = useState([]);

    // Total number of matching results
    const [total, setTotal] = useState(0);

    // Total pages that is 
    const [totalPages, setTotalPages] = useState(0);

    // Page currently on
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState(null);

    const [hasSearched, setHasSearched] = useState(false);


    // Filters
    const [typeFilter, setTypeFilter] = useState('');
    const [yearFilter, setYearFilter] = useState(0);
    const [sortBy, setSortBy] = useState('');
    const [openAccessOnly, setOpenAccessOnly] = useState(false);


    // function which calls my backend, takes query string page number and filters obj
    const doSearch = useCallback (async (q, pg = 1, filters = {}) => {
        
        // nothing happens if query is empty
        if (!q.trim()) return;

        // show spinner
        setLoading(true);

        // clears prev errors 
        setError(null);

        try {
            // build URL query string 
            const params = new URLSearchParams({
                q,
                page: pg,
                rows: 10,
                ...(filters.type && { type: filters.type }),
                ...(filters.fromYear && { fromYear: filters.fromYear }),
                ...(filters.toYear && { toYear: filters.toYear }),
                ...(filters.sort && { sort: filters.sort }),
                ...(filters.openAccess && { openAccess: 'true' }),
            });

            // call backend 
            const res = await fetch(`/api/search?${params}`)
            if(!res.ok) throw new Error("Search failed")
            const data = await res.json();

            // update all my states 
            setResults(data.results);
            setTotal(data.total);
            setTotalPages(data.totalPages);
            setPage(pg);
            setHasSearched(true);
        } catch (err) {
            setError("something went wrong.", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // runs when user clicks a page number 
    const pageChange = (newPage) => {

        // current year filter user selected 
        const year = YEAR_OPTIONS[yearFilter];

        // re-do the search with same query and filter on new page number 
        doSearch(query, newPage, {
            type: typeFilter,
            fromYear: year.from,
            toYear: year.to,
            sort: sortBy,
            openAccess: openAccessOnly,
        });

        // scroll to top of the page smoothly 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const renderPagination = () => {
        // if only page dont show pagination 
        if (totalPages <= 1) return null;
        const pages = [];
        // used to show only 5 page number buttons at a time 
        const maxVisible = 5;

        // this makes variable start at 2 pages behind, but also ensures it doesnt go below 1 
        let start = Math.max(1, page - 2);

        // goes four pages ahead of start while maintaining max visible of 5 pages 
        let end = Math.min(totalPages, start + maxVisible - 1);

        // will end up looking like 3 4 [5] 6 7 

        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

        // if go to page ahead of one, will always show page button 1
        // when there is a gap it will add ...
        if (start > 1) {
            pages.push(<button key='1' className="page-btn" onClick={() => pageChange(1)}>1</button>);
            if (start > 2) pages.push(<span key="e1" className='page-ellip'>...</span>);
        }

        // loop through and render each visible page button, it also highlights the active or current page 
        for (let i = start; i <= end; i++) {
            pages.push(
                <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => pageChange(i)}>{i}</button>
            );
        }

        
        // if not at last page always show the last page button and add ... between last and maxvisible 
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push(<span key="e2" className='page-ellip'>...</span>);

            pages.push(<button key={totalPages} className='page-btn' onClick={() => pageChange(totalPages)}>{totalPages}</button>)
        }
        return <div className="pagination">{pages}</div>;
    };

    const handleSearch = (e) => {
        // stop refreshing when form submitted 
        e.preventDefault();
        setQuery(inputVal);
        const year = YEAR_OPTIONS[yearFilter];

        // calls doSearch function 
        doSearch(inputVal, 1, {
            type: typeFilter,
            fromYear: year.from,
            toYear: year.to,
            sort: sortBy,
            openAccess: openAccessOnly
        });
    };
    

    return ( 
        <div className="home">
            {/* Hero, only show if user hasnt done a search yet  */}
            {!hasSearched && (
                <div className="hero">
                    <div className="hero-eyebrow">Powered by CrossRef · 150M+ scholarly works</div>
                    <h1 className='hero-title'>
                        Find <em>credible</em> sources,<br />not jut any sources.
                    </h1>

                    <p className='hero-sub'>
                        Search peer-reviewed papers, filter by year and field,<br />
                        and save the best ones to your personal reading list.
                    </p>
                </div>
            )}


            {/* Search bar 
                after searching add 'compact' class 
            */}
            <div className={`search-section ${hasSearched ? 'compact' : ''}`}>
                {/*  Once form is submitted it calls handle search that stop page refresh and does search */}
                <form className='search-form' onSubmit={handleSearch}>
                    <div className="search-bar">
                        {/* Every keystroke triggers setInputVal which updates value with inputVal */}
                        <input 
                            type="text" 
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder="Search papers, authors, topics..."
                            className='search-input'
                        />
                        <button className="search-btn" type="submit">Search</button>
                    </div>
                </form>

                {/* Filters */}
                <div className="filters-row">
                    <div className="filter-group">
                        <label className="filter-label">Type</label>
                        <div className="chip-group">
                            {/* Renders in the filter buttons, if one selected adds active class to it, also adds filter once clicked */}
                            {FIELD_FILTERS.map((f, i) => (
                                <button
                                    key={i}
                                    className={`chip ${typeFilter === f.value ? 'active' : ''}`}
                                    onClick={() => setTypeFilter(f.value)}
                                    type='button'
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Year</label>
                        <div className="chip-group">
                            {/* Renders in year button, add active class if selecetd and sets year once clicked  */}
                            {YEAR_OPTIONS.map((y, i) => (
                                <button
                                    key={i}
                                    className={`chip ${yearFilter === i ? 'active' : ''}`}
                                    onClick={() => setYearFilter(i)}
                                    type='button'
                                >
                                    {y.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group filter-row-inline">
                        <div>
                            <label className='filter-label'>Sort</label>
                            <div className="chip-group">
                                {/* Renders in sort buttons and does same as previous mappings */}
                                {SORT_OPTIONS.map((s, i) => (
                                    <button
                                        key={i}
                                        className={`chip ${sortBy === s.value ? 'active' : ''}`}
                                        onClick={() => setSortBy(s.value)}
                                        type="button"
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label className="oa-toggle">
                            {/* If clicked sets openAccessOnly to true otherwise is false */}
                            <input
                                type="checkbox"
                                checked={openAccessOnly}
                                onChange={e => setOpenAccessOnly(e.target.checked)} 
                            />
                            Open Access Only
                        </label>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="results-section">
                {/* shows a spinner which is in global css and error when there is an error */}
                {loading && <div className='spinner' />}

                {error && <div className='error-box'>{error}</div>}

                {/* Shows results when search completed */}
                {!loading && hasSearched && !error && (
                    <>
                        <div className="results-header">
                            <span className="results-count">    
                                {total.toLocaleString()} results for "<strong>{query}</strong>"
                            </span>
                        </div>

                        {/* if result has more than one page render them with papercard component else show no results */}
                        {results.length === 0 ? (
                            <div className='no-results'>No results found.</div>
                        ) : (
                            <>
                                {results.map((paper, i) => (
                                    <PaperCard key={paper.doi || i} paper={paper} />
                                ))}    
                                {renderPagination()}
                            </>
                        )}
                    </>
                )}

                {!hasSearched && !loading && (
                    <div className="suggestions">
                        <p className="suggestions-label">Try searching for:</p>
                        {/* Renders the suggestion buttons and if clicked sets input value to the button clicked and query and does a search */}
                        <div className="suggestion-chips">
                            {['machine learning', 'climate change', 
                              'CRISPR gene editing', 'neural networks', 
                              'quantum computing', 'COVID-19 vaccines'].map(s => (
                                <button
                                    key={s}
                                    className='suggestion-chip'
                                    onClick={() => { setInputVal(s); setQuery(s); doSearch(s); }}
                                >
                                    {s}
                                </button>
                              ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}