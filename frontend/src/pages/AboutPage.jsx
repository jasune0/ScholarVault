import '../styles/AboutPage.css'

export default function About() {
    return (
        <div className="about fade-in">
            <div className="about-hero">
                <div className="page-eyebrow">The Problem We're Solving</div>
                <h1>Academic research shouldn't feel like a scavenger hunt.</h1>
                <p>Students spend hours bouncing between Google Scholar, library portals, and random PDFs, with no easy way to know if a source is credible, current, or peer-reviewed. ScholarVault fixes that</p>
            </div>

            <div className="about-content">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-red"><span className="material-symbols-outlined">search</span></div>
                        <h3>Unified Search</h3>
                        <p>One search bar queries 150M+ works through the CrossRef API.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-blue"><span className="material-symbols-outlined">check</span></div>
                        <h3>Credibility Signals</h3>
                        <p>Every result shows peer-review status, citation count, open access availability, and publisher info upfront.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon icon-green"><span className="material-symbols-outlined">shelves</span></div>
                        <h3>Personal Library</h3>
                         <p>Save papers, attach personal notes, and build a reading list, all stored in a database.</p>
                    </div>
                </div>

                <div className="stakeholders">
                    <h2>Who Is This Is For</h2>
                    <div className="stakeholder-row">
                        {[
                        'Students writing research papers', 
                        'Librarians helping patrons', 
                        'Academic researchers', 
                        "Instructors & TA's"].map(s => (
                            <div className="stakeholder-pill" key={s}>{s}</div>
                        ))}
                    </div>
                </div>


                <div className="tech-section">
                    <h2>How It Was Built</h2>
                    <div className="tech-grid">
                        <div className="tech-card">
                            <div className="tech-label">Data Source</div>
                            <div className="tech-name">CrossRef REST API</div>
                            <p>Free, no authentication required. Provides scholarly metadata for 150M+ works including titles, authors, DOIs, journals, citation counts, and abstracts.</p>
                        </div>

                        <div className="tech-card">
                            <div className="tech-label">Tech Stack</div>
                            <div className="stack-list">
                                <div className="stack-item"><strong>React</strong> - Frontend UI</div>
                                <div className="stack-item"><strong>Node.js + Express</strong> - Backend API</div>
                                <div className="stack-item"><strong>Supabase</strong> - Database</div>
                                <div className="stack-item"><strong>Vercel</strong> - Deployment</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}