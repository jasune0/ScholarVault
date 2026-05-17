
// import use effect for page loads and use state to store data 
import { useEffect, useState } from 'react';

// import bar chart component from react wrapper
import { Bar } from 'react-chartjs-2';
// import pieces to manually register 
import { Chart as ChartJs, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// activate all the pieces so chart can render 
ChartJs.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// import use params to read DOI from URL, use naviagte allows user to go back previous page
import { useParams, useNavigate } from 'react-router-dom';

// retrieve saved papers from global context 
import { useSaved } from '../context/SavedContext';
import '../styles/PaperDetail.css'


export default function PaperDeatil() {

    // grabbing DOI from URL
    const doi = useParams()['*'];

    // can use navigate function to send user back 
    const navigate = useNavigate();

    // Allows the use of the functions and data needed from SavedContext file
    const { savePaper, removePaper, updateNotes, isSaved, saved } = useSaved();

    // stores the paper data, starts as null
    const [paper, setPaper] = useState(null);

    // used to show spinner while waiting for response from crossref
    const [loading, setLoading] = useState(true);

    // used to store errors 
    const [error, setError] = useState(null);

    // notes state to store whatever user writes
    const [notes, setNotes] = useState('');

    // state to to show a boolean state of note being saved 
    const [notesSaved, setNotesSaved] = useState(false);

    // put the slashes back in the doi 
    const decodedDoi = doi.replace(/__/g, '/');

    // checks if paper is already saved 
    const paperSaved = isSaved(decodedDoi);


    // runs when page loads 
    useEffect(() => {
        const fetchPaper = async () => {
            try {
                // calls my backend with the DOI
                const res = await fetch(`/api/paper/${decodedDoi}`);

                // if response is not a 200 status will throw an error
                if (!res.ok) throw new Error('Not found');

                // Converts response to JSON 
                const data = await res.json();

                // stores into paper state 
                setPaper(data);

                // checks if paper is saved 
                const savedPaper = saved.find(p => p.doi === decodedDoi);

                // if it is pre fill the notes with the notes user previously wrote.
                if (savedPaper) setNotes(savedPaper.notes || ''); 
            } catch {
                setError("Could not load this paper")
            } finally {
                setLoading(false);
            }
        };
        fetchPaper();
        // runs when doi changes 
    }, [decodedDoi]);

    const handleSaveToggle = () => {
        // if papers is saved remove it 
        if (paperSaved) {
            removePaper(decodedDoi);
        } else {
            // if not save it 
            savePaper(paper);
        }
    };

    const handleSaveNotes = () => {
        // save notes 
        updateNotes(decodedDoi, notes);
        // flip to true 
        setNotesSaved(true);
        // flip back to false after 2 seconds 
        setTimeout(() => setNotesSaved(false), 2000);
    }

    if (loading) return <div className='detail-wrap'><div className="spinner" /></div>
    if (error) return <div className="detail-wrap"><div className="error-box">{error}</div></div>;
    if (!paper) return null;


    return (
        <div className="detail-wrap fade-in">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back to results</button>

            <div className="detail-layout">
                {/* Main */}

                <div className="detail-main">
                    <div className="paper-tags" style={{ marginBottom: 14 }}>
                        {paper.type === 'journal-article' && <span className='tag tag-peer'>✓ Peer-Reviewed</span>}
                        {paper.openAccess && <span className='tag tag-open'>Open Access</span>}
                    </div>

                    <h1 className="detail-title">{paper.title}</h1>

                    <div className="detail-linebyline">
                        {paper.authors && <div><strong>Authors:</strong> {paper.authors}</div>}
                        {paper.journal && <div><strong>Journal:</strong> {paper.journal}</div>}
                        {paper.publisher && <div><strong>Publisher:</strong> {paper.publisher}</div>}
                        {paper.year && (
                            <div>
                                <strong>Published:</strong> {paper.year}
                                {paper.volume && `Vol. ${paper.volume}`}
                                {paper.issue && `(${paper.issue})`}
                                {paper.page && `· pp. ${paper.page}`}
                            </div>
                        )}
                        {paper.doi && <div><strong>DOI:</strong> {paper.doi}</div>}
                    </div>

                    {paper.abstract && (
                        <>
                            <div className="section-label">Abstract</div>
                            <div className="abstract-box">
                                <p>{paper.abstract}</p>
                            </div>
                        </>
                    )}

                    {/* if paper has citations render chart */}
                    {paper.citations > 0 && (
                        <>
                            <div className="section-label">Citation Impact</div>
                                <Bar 
                                    data={{ 
                                        // label for the x axis 
                                        labels: ["This Paper", "High Impact (1000+)", "Average (100+)", "Low (10)+"],
                                        datasets: [{
                                            label: 'Citations',
                                            // height of real bar and the rest are fixed numbers 
                                            data: [paper.citations, 1000, 100, 10],
                                            backgroundColor: [
                                                '#c8522a',
                                                '#e8e3d8',
                                                '#e8e3d8',
                                                '#e8e3d8',
                                            ],
                                            borderRadius: 6,
                                        }]
                                    }}
                                    // how it behaves
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false },
                                            // shows the citation count as a title 
                                            title: {
                                                display: true,
                                                text: `${paper.citations.toLocaleString()} total citations`,
                                                font: { size: 13},
                                                color: '#7a7570'
                                            }
                                        },
                                        // makes y start at 0 
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    font: { family: 'DM Mono'}
                                                }
                                            }
                                        }
                                    }}
                                
                                />
                        </>
                    )}


                    <div className="section-label">Your Notes</div>
                    <textarea 
                        className="notes-area"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder='Add personal notes about this paper.'
                    />

                    <div className="notes-actions">
                        <button 
                            className="btn-notes-save"
                            onClick={handleSaveNotes}
                            disabled={!paperSaved}
                            title={!paperSaved ? 'Save the paper first to add notes' : ''}
                        >
                            {notesSaved ? '✓ Saved!' : 'Save Notes'}
                        </button>
                        {!paperSaved && <span className='notes-hint'>Save the paper first to keep notes</span>}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="detail-sidebar">
                    <div className="sidebar-card">
                        <h4>Quick Stats</h4>
                        <div className="stat-row"><span>Citations</span><strong>{paper.citations?.toLocaleString()}</strong></div>
                        <div className="stat-row"><span>Year</span><strong>{paper.year || 'N/A'}</strong></div>
                        {paper.publisher && <div className='stat-row'><span>Publisher</span><strong>{paper.publisher}</strong></div>}
                        {paper.type && <div className='stat-row'><span>Type</span><strong style={{ textTransform: 'capitalize' }}>{paper.type.replace(/-/g, ' ')}</strong></div>}
                        {paper.references?.length > 0 && <div className='stat-row'><span>References</span><strong>{paper.references.length}</strong></div>}
                    </div>

                    {paper.doi && (
                        <div className="sidebar-card">
                            <h4>DOI</h4>
                            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noreferrer" className="doi-link">
                                http://doi.org{paper.doi}
                            </a>
                        </div>
                    )}

                    <div className="sidebar-card">
                        <h4>Actions</h4>
                        <button
                            className={`btn-full ${paperSaved ? 'btn-saved' : 'btn-primary'}`}
                            onClick={handleSaveToggle}
                        >
                            {paperSaved ? '✓ Saved to Library' : '+ Save to Library'}
                        </button>
                        {paper.url && (
                            <a href={paper.url} target="_blank" className="btn-full btn-outline" style={{ display:'block', textAlign: 'center', marginTop: 8, padding: '11px' }}>
                                Open Full Paper
                            </a>
                        )}

                        <button 
                            className="btn-full btn-copy"
                            style={{ marignTop: 8 }}
                            onClick={() => navigator.clipboard.writeText(`${paper.authors} (${paper.year}). ${paper.title}. ${paper.journal}. https://doi.org/${paper.doi}`)}
                        >
                            <span class="material-symbols-outlined">content_copy</span>Copy Citation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}