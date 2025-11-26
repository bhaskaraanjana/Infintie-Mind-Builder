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

    console.log('TagFilter: notes', notes);
    console.log('TagFilter: tagCounts', tagCounts);

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
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    padding: '8px 16px',
                    backgroundColor: selectedTags.length > 0 ? '#2196F3' : '#fff',
                    color: selectedTags.length > 0 ? '#fff' : '#333',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                🏷️ Filter
                {selectedTags.length > 0 && (
                    <span style={{
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontSize: '12px'
                    }}>
                        {selectedTags.length}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '220px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 1000
                }}>
                    <div style={{
                        padding: '12px',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#666' }}>
                            Filter by Tags
                        </span>
                        {selectedTags.length > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearTagFilter();
                                }}
                                style={{
                                    padding: '4px 8px',
                                    backgroundColor: '#f0f0f0',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    color: '#666'
                                }}
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {allTags.length === 0 ? (
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#999',
                            fontSize: '13px'
                        }}>
                            No tags found
                        </div>
                    ) : (
                        <div style={{ padding: '8px 0' }}>
                            {allTags.map(tag => (
                                <label
                                    key={tag}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        gap: '10px',
                                        fontSize: '13px',
                                        backgroundColor: selectedTags.includes(tag) ? '#e3f2fd' : 'transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!selectedTags.includes(tag)) {
                                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!selectedTags.includes(tag)) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => toggleTagFilter(tag)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span style={{ flex: 1, color: '#333' }}>{tag}</span>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#999',
                                        backgroundColor: '#f0f0f0',
                                        padding: '2px 6px',
                                        borderRadius: '10px'
                                    }}>
                                        {tagCounts[tag]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
