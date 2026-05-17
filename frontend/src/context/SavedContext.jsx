import { createContext, useContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';


// Creates an empty box which will be filled with data and functions, shared across whole app
const SavedContext = createContext();

// wrapper component which is wrapped around whole app to allow every page and component access functions 
export function SavedProvider({ children }) {

    // array of saved paper which starts off empty
    const [saved, setSaved] = useState([]);

    // runs when app first loads 
    useEffect(() => {
        // defined async function to fetch from my backend 
        const fetchSaved = async () => {
            try {
                // call GET route if fails throws an error
                const res = await fetch('/api/saved');
                if (!res.ok) throw new Error('Failed to fetch');
                // convert response to json
                const data = await res.json();

                // Map translates between the two so the rest of the app works
                const mapped = data.map(p => ({
                    doi: p.doi,
                    title: p.title,
                    authors: p.authors,
                    journal: p.journal,
                    year: p.year,
                    citations: p.citations,
                    type: p.type,
                    openAccess: p.open_access,
                    notes: p.notes || '',
                    savedAt: p.saved_at,
                }));

                // Stores the translated paper into state 
                setSaved(mapped);
            } catch (err) {
                console.error('Could not load saved papers:', err);
            }
        };
        fetchSaved();
    }, [])

    const savePaper = async (paper) => {
        // add paper to ui immediately 
        setSaved(prev => {
            if (prev.find(p => p.doi === paper.doi)) return prev;
            return [...prev, { ...paper, notes: '', savedAt: new Date().toISOString() }];
        });

        toast.success('Paper saved to library!');

        try {
            // Sends paper to POST route
            const res = await fetch('/api/saved' , {
                method: 'POST',
                // Tells express body is json
                headers: { 'Content-Type': 'application/json' },
                // converts paper obj to json string 
                body: JSON.stringify(paper),
            });

            if (!res.ok && res.status !== 409) {
                throw new Error('Failed to save');
            }
        } catch (err) {
            console.error('save failed:', err);
            setSaved(prev => prev.filter(p => p.doi !== paper.doi));
        }
    };


    const removePaper = async (doi) => {
        // remove from UI immediately, filter keeps every paper whose doi doesnt match 
        setSaved(prev => prev.filter(p => p.doi !== doi));
        toast.error('Paper removed from library');

        try {
            // call DELETE route 
            const res = await fetch(`/api/saved/${encodeURIComponent(encodeURIComponent(doi))}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to remove");
        } catch (err) {
            console.error('Remove failed:', err);
        }
    };

    const updateNotes = async (doi, notes) => {
        // find matching paper and update its notes by using map 
        setSaved(prev => 
            prev.map(p => p.doi === doi ? {...p, notes} : p)
        );

        try {
            // call PUT route for notes, this updates just the notes 
            const res = await fetch(`/api/saved/${encodeURIComponent(encodeURIComponent(doi))}/notes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes }),
            });

            if (!res.ok) throw new Error('Failed to update notes');
        } catch(err) {
            console.error('Notes update failed:', err);
        }
    }


    // a helper which checks if any paper has the same doi as the passed 
    const isSaved = (doi) => saved.some(p => p.doi === doi);

    return (
        <SavedContext.Provider value={{ saved, savePaper, removePaper, updateNotes, isSaved }}>
            {children}
        </SavedContext.Provider>
    );
}

export const useSaved = () => useContext(SavedContext);