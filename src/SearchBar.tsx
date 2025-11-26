import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { searchNotes, getHighlightedText } from './searchUtils';

export const SearchBar: React.FC = () => {
    const { notes, setViewport } = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<ReturnType<typeof searchNotes>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Keyboard shortcut: Cmd/Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                if (!isOpen) {
                    setTimeout(() => inputRef.current?.focus(), 100);
                }
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                const noteArray = Object.values(notes);
                const searchResults = searchNotes(query, noteArray);
                setResults(searchResults.slice(0, 10)); // Limit to 10 results
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, notes]);

    const navigateToNote = (noteId: string) => {
        const note = notes[noteId];
        if (note) {
            // Pan and zoom to note
            setViewport({ x: -note.x + window.innerWidth / 2, y: -note.y + window.innerHeight / 2, scale: 1 });
            setIsOpen(false);
            setQuery('');
        }
    };

    if (!isOpen) {
        return (
            <div style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 50
            }}>
                <div style={{
                    backgroundColor: 'rgba(42, 42, 42, 0.9)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#999',
                    backdropFilter: 'blur(10px)'
                }}>
                    Press <kbd style={{ padding: '2px 6px', backgroundColor: '#555', borderRadius: '3px' }}>⌘K</kbd> to search
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '100px',
            zIndex: 1000
        }}
            onClick={() => setIsOpen(false)}
        >
            <div
                style={{
                    width: '600px',
                    maxHeight: '500px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search input */}
                <div style={{ padding: '16px', borderBottom: '1px solid #444' }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search notes... (use #tag for tags)"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #555',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '16px',
                            outline: 'none'
                        }}
                        autoFocus
                    />
                </div>

                {/* Results */}
                <div style={{
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    {results.length === 0 && query.trim() && (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                            No results found
                        </div>
                    )}
                    {results.map((result) => (
                        <div
                            key={result.item.id}
                            onClick={() => navigateToNote(result.item.id)}
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #333',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
                                {result.item.title}
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                                {getHighlightedText(result.item.content, result.matches)}...
                            </div>
                            {result.item.tags && result.item.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {result.item.tags.map(tag => (
                                        <span
                                            key={tag}
                                            style={{
                                                fontSize: '11px',
                                                padding: '2px 6px',
                                                backgroundColor: '#4a9eff',
                                                color: '#fff',
                                                borderRadius: '8px'
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
