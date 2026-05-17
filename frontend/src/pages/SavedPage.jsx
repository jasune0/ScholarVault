import { useState } from "react";
import { useSaved } from "../context/SavedContext";
import { useNavigate } from 'react-router-dom';
import '../styles/SavedPage.css'


export default function Saved() {
    const { saved, removePaper } = useSaved();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    
    // runs everytime when search state changes 
    const filtered = saved.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.authors?.toLowerCase().includes(search.toLowerCase()) || 
        p.journal?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="saved-wrap fade-in">
            <div className="saved-header">
                <div>
                    <div className="page-eyebrow">Your Library</div>
                    <h1 className="page-title">Saved Papers</h1>
                </div>
                <span className="saved-count">{saved.length} paper{saved.length !== 1 ? 's' : ''}</span>
            </div>

            {/* if no saved papers tell user their library is empty */}
            {saved.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><span className="material-symbols-outlined">library_books</span></div>
                    <h2>Your library is empty</h2>
                    <p>Search for papers and click "+ Save" to add them.</p>
                    <button className="go-search-btn" onClick={() => navigate('/')}>Start Searching</button>
                </div>
            ) : (
                <>
                {/* Allows to search through saved papers */}
                {/* Once search state is changed triggers re-render for filtered */}
                    <div className="saved-search-bar">
                        <input 
                            type="text" 
                            placeholder="Filter your saved papers"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="saved-search-input"
                        />
                    </div>

                    {/* if search doesnt match and results shows no-results div */}
                    {filtered.length === 0 ? (
                        <div className="no-results">No saved papers match your filter.</div>
                    ) : (
                        <div className="saved-grid">
                            {/* renders each filtered paper */}
                            {filtered.map(paper => (
                                <div 
                                    className="saved-card"
                                    key={paper.doi}
                                    onClick={() => navigate(`/paper/${encodeURIComponent(paper.doi)}`)}
                                >
                                    {/* only shows if paper is peer reviewed or open access */}
                                    <div className="saved-card-tags">
                                        {paper.type === 'journal-article' && <span className="tag tag-peer">Peer-Reviewed</span>}
                                        {paper.openAccess && <span className="tag tag-open">Open Access</span>}
                                    </div>

                                    <h3 className="saved-card-title">{paper.title}</h3>
                                    <div className="saved-card-meta">
                                        {/* split authors string into an array with comma, then slices the first 2 authors, then joins them with comma  */}
                                        {/* if more than 2 authors add et al. */}
                                        {paper.authors && <span>{paper.authors.split(',').slice(0, 2).join(',')}{paper.authors.split(',').length > 2 ? ' et al.' : ''}</span>}
                                        {paper.journal && <span>· {paper.journal}</span>}
                                        {paper.year && <span>· {paper.year}</span>}
                                    </div>

                                    {/* renders any notes added to paper */}
                                    {paper.notes && (
                                        <div className="saved-card-notes">
                                            <span className="notes-label">Notes:</span> {paper.notes}
                                        </div>
                                    )}
                                    <div className="saved-card-footer">
                                        <span className="saved-cite">{paper.citations?.toLocaleString()} citations</span>

                                        <button 
                                            className="remove-btn"
                                            onClick={e => { e.stopPropagation(); removePaper(paper.doi); }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}