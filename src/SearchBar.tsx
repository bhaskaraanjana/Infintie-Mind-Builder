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
            <div className="glass" style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 'var(--z-popover)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
            }}
                onClick={() => setIsOpen(true)}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(-50%)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <span style={{ color: 'var(--neutral-600)', fontSize: 'var(--text-sm)' }}>Search notes...</span>
                <kbd className="badge badge-neutral" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>⌘K</kbd>
            </div>
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
            paddingTop: '100px',
            zIndex: 'var(--z-modal)'
        }}
            onClick={() => setIsOpen(false)}
        >
            <div className="glass scale-in"
                style={{
                    width: '600px',
                    maxWidth: '90vw',
                    maxHeight: '500px',
                    borderRadius: 'var(--radius-2xl)',
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
                    borderBottom: '1px solid var(--neutral-200)'
                }}>
                    <div style={{
                        position: 'relative',
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
                            placeholder="Search notes... (use #tag for tags)"
                            style={{
                                flex: 1,
                                padding: 'var(--spacing-2)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--neutral-900)',
                                fontSize: 'var(--text-base)',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="button-secondary"
                                style={{
                                    padding: 'var(--spacing-1)',
                                    minWidth: '24px',
                                    height: '24px',
                                    borderRadius: 'var(--radius-full)'
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: '400px'
                }}>
                    {results.length === 0 && query.trim() && (
                        <div style={{
                            padding: 'var(--spacing-8)',
                            textAlign: 'center',
                            color: 'var(--neutral-500)'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto var(--spacing-4)' }}>
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <div style={{ fontSize: 'var(--text-sm)' }}>No results found</div>
                        </div>
                    )}
                    {results.length === 0 && !query.trim() && (
                        <div style={{
                            padding: 'var(--spacing-8)',
                            textAlign: 'center',
                            color: 'var(--neutral-500)',
                            fontSize: 'var(--text-sm)'
                        }}>
                            Start typing to search your notes...
                        </div>
                    )}
                    {results.map((result, index) => (
                        <div
                            key={result.item.id}
                            className="slide-in-down"
                            onClick={() => navigateToNote(result.item.id)}
                            style={{
                                padding: 'var(--spacing-4)',
                                borderBottom: index < results.length - 1 ? '1px solid var(--neutral-200)' : 'none',
                                cursor: 'pointer',
                                transition: 'all var(--transition-fast)',
                                animationDelay: `${index * 30}ms`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <div style={{
                                fontWeight: 600,
                                color: 'var(--neutral-900)',
                                marginBottom: 'var(--spacing-1)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                {result.item.title}
                            </div>
                            <div style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--neutral-600)',
                                marginBottom: 'var(--spacing-2)',
                                lineHeight: 1.5
                            }}>
                                {getHighlightedText(result.item.content, result.matches).slice(0, 100)}...
                            </div>
                            {result.item.tags && result.item.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                    {result.item.tags.map(tag => (
                                        <span
                                            key={tag}
                                            className="badge badge-primary"
                                            style={{ fontSize: '11px' }}
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
