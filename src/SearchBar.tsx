import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { searchNotes, getSearchSnippet } from './searchUtils';

export const SearchBar: React.FC = () => {
    const { notes, setViewport } = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<ReturnType<typeof searchNotes>>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [history, setHistory] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('search-history') || '[]');
        } catch { return []; }
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Keyboard shortcut: Cmd/Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            } else if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
                setQuery('');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setSelectedIndex(-1);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                const noteArray = Object.values(notes);
                const searchResults = searchNotes(query, noteArray);
                setResults(searchResults.slice(0, 10)); // Limit to 10 results
                setSelectedIndex(0); // Auto-select first result
            } else {
                setResults([]);
                setSelectedIndex(-1);
            }
        }, 150); // Faster debounce

        return () => clearTimeout(timer);
    }, [query, notes]);

    const addToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search-history', JSON.stringify(newHistory));
    };

    const navigateToNote = (noteId: string, saveToHistory = true) => {
        const note = notes[noteId];
        if (note) {
            setViewport({ x: -note.x + window.innerWidth / 2, y: -note.y + window.innerHeight / 2, scale: 1 });
            setIsOpen(false);
            if (saveToHistory) addToHistory(query);
            setQuery(''); // Clear query after nav
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                navigateToNote(results[selectedIndex].item.id);
            }
        }
    };

    // Auto-scroll to selected
    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
            const selectedEl = resultsRef.current.children[selectedIndex] as HTMLElement;
            if (selectedEl) {
                selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) {
        return (
            <button
                className="glass"
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    zIndex: 'var(--z-popover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'all var(--transition-base)',
                    color: 'var(--neutral-600)'
                }}
                onClick={() => setIsOpen(true)}
                title="Search (Cmd+K)"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
            </button>
        );
    }



    return (
        <div className="fade-in" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start', // Align top for mobile keyboard
            paddingTop: 'min(100px, 10vh)',
            zIndex: 'var(--z-modal)',
            touchAction: 'none'
        }}
            onClick={() => setIsOpen(false)}
        >
            <div className="glass scale-in"
                style={{
                    width: '600px',
                    maxWidth: '95vw',
                    maxHeight: '80vh',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-2xl)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div style={{
                    padding: 'var(--spacing-4)',
                    borderBottom: '1px solid var(--neutral-200)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search notes... (use #tag)"
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-2)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'var(--neutral-900)',
                            fontSize: '16px', // Prevent iOS zoom
                            outline: 'none'
                        }}
                        autoComplete="off"
                        autoCapitalize="off"
                    />
                    {query && (
                        <button
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--neutral-400)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Content Area */}
                <div
                    ref={resultsRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overscrollBehavior: 'contain'
                    }}>
                    {/* Empty State / History */}
                    {results.length === 0 && !query.trim() && (
                        <div style={{ padding: 'var(--spacing-4)' }}>
                            {history.length > 0 ? (
                                <>
                                    <div style={{
                                        fontSize: 'var(--text-xs)',
                                        fontWeight: 600,
                                        color: 'var(--neutral-500)',
                                        marginBottom: 'var(--spacing-2)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Recent
                                    </div>
                                    {history.map(term => (
                                        <div
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            style={{
                                                padding: 'var(--spacing-3)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-3)',
                                                color: 'var(--neutral-700)',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-100)'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {term}
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div style={{
                                    padding: 'var(--spacing-8)',
                                    textAlign: 'center',
                                    color: 'var(--neutral-400)',
                                    fontStyle: 'italic'
                                }}>
                                    Type to start searching...
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Results */}
                    {results.length === 0 && query.trim() && (
                        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--neutral-500)' }}>
                            No results found for "{query}"
                        </div>
                    )}

                    {/* Results List */}
                    {results.map((result, index) => {
                        const snippet = getSearchSnippet(result.item.content || '', result.matches);
                        const isSelected = index === selectedIndex;

                        return (
                            <div
                                key={result.item.id}
                                onClick={() => navigateToNote(result.item.id)}
                                style={{
                                    padding: 'var(--spacing-4)',
                                    borderBottom: '1px solid var(--neutral-100)',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? 'var(--neutral-100)' : 'transparent',
                                    transition: 'background-color 0.1s'
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div style={{ fontWeight: 600, color: 'var(--neutral-900)', marginBottom: '4px' }}>
                                    {result.item.title}
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--neutral-600)', lineHeight: 1.5 }}>
                                    <span>{snippet.pre}</span>
                                    <span style={{
                                        fontWeight: '700',
                                        color: '#00a1ff',
                                        backgroundColor: 'rgba(0, 161, 255, 0.1)',
                                        padding: '0 2px',
                                        borderRadius: '2px'
                                    }}>
                                        {snippet.match}
                                    </span>
                                    <span>{snippet.post}</span>
                                </div>
                                {result.item.tags && result.item.tags.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {result.item.tags.slice(0, 3).map(tag => (
                                            <span key={tag} className="badge badge-primary" style={{ fontSize: '10px' }}>#{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Mobile Keyboard Helper (Optional Footer) */}
                <div style={{
                    padding: '8px',
                    borderTop: '1px solid var(--neutral-200)',
                    fontSize: '11px',
                    color: 'var(--neutral-500)',
                    textAlign: 'center',
                    backgroundColor: 'var(--neutral-50)'
                }}>
                    <span>Use <b>↑↓</b> to navigate, <b>Enter</b> to select</span>
                </div>
            </div>
        </div>
    );
};
