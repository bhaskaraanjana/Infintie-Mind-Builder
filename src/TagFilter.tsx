import { useState, useRef, useEffect } from 'react';
import { useStore } from './store';

export const TagFilter = () => {
    const { notes, selectedTags, toggleTagFilter, clearTagFilter } = useStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get all unique tags with counts
    const tagCounts = Object.values(notes).reduce((acc, note) => {
        if (note.tags) {
            note.tags.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
        }
        return acc;
    }, {} as Record<string, number>);

    const allTags = Object.keys(tagCounts).sort();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--spacing-2)' }}>
            {/* Filter Button */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="glass button"
                style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    backgroundColor: selectedTags.length > 0 ? 'var(--primary-600)' : 'var(--glass-bg)',
                    color: selectedTags.length > 0 ? 'white' : 'var(--theme-text)',
                    border: selectedTags.length > 0 ? 'none' : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xl)',
                    fontWeight: 500,
                    fontSize: 'var(--text-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)',
                    transition: 'all var(--transition-base)',
                    boxShadow: selectedTags.length > 0 ? 'var(--shadow-md)' : 'none'
                }}
                onMouseEnter={(e) => {
                    if (selectedTags.length === 0) {
                        e.currentTarget.style.backgroundColor = 'var(--theme-bg)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (selectedTags.length === 0) {
                        e.currentTarget.style.backgroundColor = 'var(--glass-bg)';
                    }
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>Filter</span>
                {selectedTags.length > 0 && (
                    <span className="badge" style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 6px'
                    }}>
                        {selectedTags.length}
                    </span>
                )}
            </button>

            {/* Active Tags Pills */}
            {selectedTags.length > 0 && (
                <div className="fade-in" style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-2)',
                    alignItems: 'center'
                }}>
                    {selectedTags.map((tag) => (
                        <div
                            key={tag}
                            className="glass badge slide-in-down"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)',
                                padding: 'var(--spacing-2) var(--spacing-3)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 500,
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--primary-100)',
                                color: 'var(--primary-700)',
                                border: '1px solid var(--primary-200)'
                            }}
                        >
                            <span>#{tag}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTagFilter(tag);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-600)',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '16px',
                                    lineHeight: 1,
                                    transition: 'color var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary-600)'}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={clearTagFilter}
                        className="button-secondary"
                        style={{
                            padding: 'var(--spacing-1) var(--spacing-3)',
                            fontSize: 'var(--text-xs)',
                            borderRadius: 'var(--radius-full)'
                        }}
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* Dropdown */}
            {showDropdown && (
                <div className="glass scale-in" style={{
                    position: 'absolute',
                    top: 'calc(100% + var(--spacing-2))',
                    left: 0,
                    backgroundColor: 'var(--theme-canvas-bg)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    minWidth: '280px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 'var(--z-dropdown)',
                    border: '1px solid var(--glass-border)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: 'var(--spacing-4)',
                        borderBottom: '1px solid var(--neutral-200)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'var(--theme-canvas-bg)',
                        backdropFilter: 'blur(var(--glass-blur))',
                        zIndex: 1
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-2)'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                            <span style={{
                                fontWeight: 600,
                                fontSize: 'var(--text-sm)',
                                color: 'var(--theme-text)'
                            }}>
                                Filter by Tags
                            </span>
                        </div>
                        {selectedTags.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearTagFilter();
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--primary-600)',
                                    fontSize: 'var(--text-xs)',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    padding: 'var(--spacing-1) var(--spacing-2)',
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'all var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Tag List */}
                    <div style={{ padding: 'var(--spacing-2)' }}>
                        {allTags.length === 0 ? (
                            <div style={{
                                padding: 'var(--spacing-6)',
                                textAlign: 'center',
                                color: 'var(--theme-text-secondary)',
                                fontSize: 'var(--text-sm)'
                            }}>
                                No tags found. Add tags to your notes to filter them.
                            </div>
                        ) : (
                            allTags.map((tag, index) => (
                                <label
                                    key={tag}
                                    className="slide-in-down"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--spacing-3)',
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                        animationDelay: `${index * 20}ms`
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    {/* Custom Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => toggleTagFilter(tag)}
                                        style={{ display: 'none' }}
                                    />
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: `2px solid ${selectedTags.includes(tag) ? 'var(--primary-600)' : 'var(--neutral-400)'}`,
                                        backgroundColor: selectedTags.includes(tag) ? 'var(--primary-600)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all var(--transition-fast)',
                                        flexShrink: 0
                                    }}>
                                        {selectedTags.includes(tag) && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Tag Name */}
                                    <span style={{
                                        flex: 1,
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--theme-text)',
                                        fontWeight: selectedTags.includes(tag) ? 500 : 400
                                    }}>
                                        #{tag}
                                    </span>

                                    {/* Count Badge */}
                                    <span className="badge badge-neutral" style={{
                                        fontSize: '11px',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        {tagCounts[tag]}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
