import { useNavigate } from 'react-router-dom';
import { useSaved } from "../context/SavedContext"
import '../styles/PaperCard.css'


export default function PaperCard({ paper }) {

    // a navigate function which allows me to call navigate later 
    const navigate = useNavigate();

    // pulls three functions out of savedcontext 
    const { savePaper, removePaper, isSaved } = useSaved();

    // checks if passed paper is already saved by doi 
    const saved = isSaved(paper.doi);

    const handleSave = (e) => {
        // stops the click from bubbling up 
        e.stopPropagation();

        // saves paper if saved it false else removes it 
        saved ? removePaper(paper.doi) : savePaper(paper)
    };

    return (
        <div className="paper-card fade-in" onClick={() => navigate(`/paper/${paper.doi}`)}>
            <div className="paper-card-main">
                <div className="paper-tags">
                    {paper.type === 'journal-article' && <span className='tag tag-peer'>✓ Peer-Reviewed</span>}
                    {paper.openAccess && <span className='tag tag-open'>Open Access</span>}
                </div>

                <h3 className='paper-title'>{paper.title}</h3>
                <div className="paper-meta">
                    {paper.authors && <span>{paper.authors}</span>}
                    {paper.authors && paper.journal && <span className="dot-sep">·</span>}
                    {paper.journal && <span>{paper.journal}</span>}
                    {paper.year && <span className="dot-sep">·</span>}
                    {paper.year && <span>{paper.year}</span>}
                </div>
            </div>

            <div className="paper-card-actions">
                <button
                    className={`btn-save ${saved ? 'saved' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? 'Saved' : '+Save'}
                </button>
                <div className="cite-count">{paper.citations?.toLocaleString()} citations</div>
            </div>
        </div>
    );
}