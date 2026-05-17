import '../styles/HelpPage.css'

const STEPS = [
  { num: '1', title: 'Search for Papers', body: 'Type any keyword, author name, or topic into the search bar on the home page. Results are pulled live from the CrossRef database covering 150M+ scholarly works.', tip: 'Use specific terms for better results — "deep learning radiology 2022" works better than just "AI medicine". Combining 2–4 keywords is ideal.' },
  { num: '2', title: 'Use Filters', body: 'After searching, use the filter chips below the search bar to narrow results by type (journal articles, conference papers), year range, or open access availability. Combine multiple filters at once.' },
  { num: '3', title: 'View Paper Details', body: 'Click any result card to open the full paper detail page. You\'ll see the abstract, full author list, citation count, DOI, journal info, and a list of references.' },
  { num: '4', title: 'Save Papers', body: 'Click "+ Save" on any result card or "+ Save to Library" on the detail page to add a paper to your saved library. Access all saved papers from the "Saved" tab in the navigation.' },
  { num: '5', title: 'Take Notes', body: 'On the Paper Detail page, scroll down to the Notes area. Write anything relevant: quotes, critique, connections to other sources. Click "Save Notes" to store them with the paper.', tip: 'You must save the paper first before notes can be stored.' },
  { num: '6', title: 'Open the Full Paper', body: 'Use the "Open Full Paper" button on the detail page to follow the DOI link directly to the publisher\'s website. Open access papers can be read for free.' },
]

export default function Help() {
    return (
        // wraps whole page, this allows fade-in css animation from global styles
        <div className="help-wrap fade-in">
            {/* Container for header section */}
            <div className="help-header">
                <div className="page-eyebrow">Documentation</div>
                <h1 className="page-title">How to Use ScholarVault</h1>
                <p className="help-sub">Everything you need to get the most out of your research</p>
            </div>

            {/* Container for table of contents */}
            <div className="help-layout">
                <aside className="help-toc">
                    <div className="toc-label">On This Page</div>
                    <a href="#getting-started" className="toc-link">Getting Started</a>
                </aside>

                {/* Container which is used to make grid */}
                <div className="help-content">
                    <div id="getting-started">
                        {/* map each step onto the site */}
                        {STEPS.map(step => (
                            <div key={step.num} className="help-step">
                                <div className="step-num">{step.num}</div>
                                <div className="step-body">
                                    <h3>{step.title}</h3>
                                    <p>{step.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}