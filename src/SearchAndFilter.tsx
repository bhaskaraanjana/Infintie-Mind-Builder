import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from './store';
import { searchNotes, searchClusters, getSearchSnippet } from './searchUtils';
import { Search, Filter, X, Tag, Box } from 'lucide-react';

export const SearchAndFilter: React.FC = () => {
    const { notes, clusters, setViewport, selectedTags, setSelectedTags } = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    // Unified result type
    type CombinedResult =
        | { type: 'note', item: ReturnType<typeof searchNotes>[0]['item'], matches?: any, score: number }
        | { type: 'cluster', item: ReturnType<typeof searchClusters>[0]['item'], matches?: any, score: number };

    const [results, setResults] = useState<CombinedResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [history, setHistory] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('search-history') || '[]');
        } catch { return []; }
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    // Get all unique tags from notes
    const allTags = useMemo(() => Array.from(new Set(
        Object.values(notes).flatMap(note => note.tags || [])
    )).sort(), [notes]);

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

    // Search Logic (Debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            let noteArray = Object.values(notes);
            const clusterArray = Object.values(clusters);

            // 1. Filter by Active Tags first (Clusters don't have tags usually, so we only filter notes)
            // But if tags are active, we might want to exclude clusters or include them?
            // Decision: If specific tags are selected, we assume specific intent and effectively hide non-tagged clusters
            // unless we decide that active tags shouldn't filter clusters.
            // For now: Tags filter notes. Clusters are only shown if no tags, OR if we decide tags shouldn't apply to clusters.
            // To be safe: If tags are active, we only show notes that match. Cluster search is disabled.
            if (selectedTags.length > 0) {
                noteArray = noteArray.filter(note =>
                    selectedTags.every(tag => note.tags?.includes(tag))
                );
            }

            // 2. Search by Query
            if (query.trim()) {
                const noteResults = searchNotes(query, noteArray).map(r => ({ type: 'note' as const, ...r }));

                // Only search clusters if no tags are selected (as clusters don't have tags)
                const clusterResults = selectedTags.length === 0
                    ? searchClusters(query, clusterArray).map(r => ({ type: 'cluster' as const, ...r }))
                    : [];

                // Combine and sort by score (Fuse score: lower is better)
                const combined = [...noteResults, ...clusterResults].sort((a, b) => a.score - b.score);

                setResults(combined.slice(0, 15));
                setSelectedIndex(0);
            } else if (selectedTags.length > 0) {
                // Recent tagged notes
                const recentNotes = noteArray
                    .sort((a, b) => b.modified - a.modified)
                    .slice(0, 10)
                    .map(note => ({
                        type: 'note' as const,
                        item: note,
                        matches: [],
                        score: 1
                    }));
                setResults(recentNotes);
                setSelectedIndex(-1);
            } else {
                setResults([]);
                setSelectedIndex(-1);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [query, notes, clusters, selectedTags]);

    const addToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search-history', JSON.stringify(newHistory));
    };

    const navigateToItem = (result: CombinedResult) => {
        if (result.type === 'note') {
            const note = notes[result.item.id];
            if (note) {
                setViewport({ x: -note.x + window.innerWidth / 2, y: -note.y + window.innerHeight / 2, scale: 1 });
            }
        } else {
            const cluster = clusters[result.item.id];
            if (cluster) {
                setViewport({ x: -cluster.x + window.innerWidth / 2, y: -cluster.y + window.innerHeight / 2, scale: 1 });
            }
        }

        setIsOpen(false);
        if (query.trim()) addToHistory(query);
        setQuery('');
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
                navigateToItem(results[selectedIndex]);
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

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    if (!isOpen) {
        return (
            <button
                id="search-trigger"
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
                    color: selectedTags.length > 0 ? 'var(--primary-500)' : 'var(--neutral-600)'
                }}
                onClick={() => setIsOpen(true)}
                title="Search & Filter (Cmd+K)"
            >
                {selectedTags.length > 0 ? (
                    <div className="relative">
                        <Filter size={20} />
                        <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {selectedTags.length}
                        </span>
                    </div>
                ) : (
                    <Search size={20} />
                )}
            </button>
        );
    }

    return (
        <div className="fade-in" style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: 'min(80px, 8vh)',
            zIndex: 'var(--z-modal)',
            touchAction: 'none'
        }}
            onClick={() => setIsOpen(false)}
        >
            <div className="glass scale-in"
                style={{
                    width: '600px',
                    maxWidth: '95vw',
                    maxHeight: '85vh',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-2xl)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--bg)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header: Search Input */}
                <div style={{
                    padding: 'var(--spacing-4)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)'
                }}>
                    <Search size={20} className="text-neutral-400" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search notes and clusters..."
                        style={{
                            flex: 1,
                            padding: 'var(--spacing-2)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            fontSize: '16px',
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
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Bar (Horizontal Scroll) */}
                {allTags.length > 0 && (
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: 'var(--neutral-50)',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        gap: '8px',
                        scrollbarWidth: 'none'
                    }} className="hide-scrollbar">
                        <div id="filter-tags" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '16px' }}>
                            <Filter size={14} className="text-neutral-500" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--neutral-500)' }}>FILTERS:</span>
                        </div>
                        {allTags.map(tag => {
                            const active = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        border: active ? '1px solid var(--primary-500)' : '1px solid var(--neutral-300)',
                                        backgroundColor: active ? 'var(--primary-100)' : 'white',
                                        color: active ? 'var(--primary-700)' : 'var(--neutral-600)',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: active ? 600 : 400,
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    #{tag}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Results Area */}
                <div
                    ref={resultsRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        backgroundColor: 'var(--bg)'
                    }}>

                    {/* Empty State / Query-less + Tagless */}
                    {results.length === 0 && !query.trim() && selectedTags.length === 0 && (
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
                                        Recent Searches
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
                                            <Search size={14} className="text-neutral-400" />
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
                                    Search for notes or clusters...
                                </div>
                            )}
                        </div>
                    )}

                    {/* No Results */}
                    {results.length === 0 && (query.trim() || selectedTags.length > 0) && (
                        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--neutral-500)' }}>
                            No results found.
                        </div>
                    )}

                    {/* Results List */}
                    {results.map((result, index) => {
                        const isNote = result.type === 'note';
                        const isSelected = index === selectedIndex;

                        let snippet = { pre: '', match: '', post: '' };
                        if (isNote) {
                            const item = result.item as import('./types').Note;
                            snippet = result.matches && result.matches.length > 0
                                ? getSearchSnippet(item.content || '', result.matches)
                                : { pre: item.content?.slice(0, 100) || '', match: '', post: '...' };
                        }

                        return (
                            <div
                                key={result.item.id}
                                onClick={() => navigateToItem(result)}
                                style={{
                                    padding: 'var(--spacing-4)',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? 'var(--neutral-100)' : 'transparent',
                                    transition: 'background-color 0.1s',
                                    display: 'flex',
                                    gap: '12px'
                                }}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: isNote ? 'var(--primary-100)' : 'var(--secondary-100)',
                                    color: isNote ? 'var(--primary-600)' : 'var(--secondary-600)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {isNote ? <Search size={16} /> : <Box size={16} />}
                                </div>

                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                                            {result.item.title}
                                            {!isNote && <span style={{
                                                fontSize: '10px',
                                                backgroundColor: 'var(--neutral-200)',
                                                color: 'var(--neutral-600)',
                                                padding: '2px 4px',
                                                borderRadius: '4px',
                                                marginLeft: '8px',
                                                textTransform: 'uppercase'
                                            }}>Cluster</span>}
                                        </div>
                                        <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>
                                            {new Date(result.item.modified).toLocaleDateString()}
                                        </span>
                                    </div>

                                    {isNote && (
                                        <div style={{ fontSize: '14px', color: 'var(--textSecondary)', lineHeight: 1.5 }}>
                                            <span>{snippet.pre}</span>
                                            {snippet.match && (
                                                <span style={{
                                                    fontWeight: '700',
                                                    color: 'var(--primary-600)',
                                                    backgroundColor: 'var(--primary-100)',
                                                    padding: '0 2px',
                                                    borderRadius: '2px'
                                                }}>
                                                    {snippet.match}
                                                </span>
                                            )}
                                            <span>{snippet.post}</span>
                                        </div>
                                    )}

                                    {!isNote && (
                                        <div style={{ fontSize: '13px', color: 'var(--neutral-500)', fontStyle: 'italic' }}>
                                            Contains {(result.item as any).children?.length || 0} notes
                                        </div>
                                    )}

                                    {isNote && (result.item as any).tags && (result.item as any).tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                            {(result.item as any).tags.slice(0, 3).map((tag: string) => (
                                                <span key={tag} className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded text-[10px] text-neutral-600">
                                                    <Tag size={10} /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer / Mobile Hint */}
                <div style={{
                    padding: '8px',
                    borderTop: '1px solid var(--border)',
                    fontSize: '11px',
                    color: 'var(--neutral-500)',
                    textAlign: 'center',
                    backgroundColor: 'var(--neutral-50)'
                }}>
                    {results.length} results • Use <b>↑↓</b> to navigate, <b>Enter</b> to select
                </div>
            </div>

            {/* Inline Style for hiding scrollbar */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};
