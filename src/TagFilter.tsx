import React, { useState } from 'react';
import { useStore } from './store';
import { Filter } from 'lucide-react';

export const TagFilter: React.FC = () => {
    const { notes, selectedTags, setSelectedTags } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    // Get all unique tags from notes
    const allTags = Array.from(new Set(
        Object.values(notes).flatMap(note => note.tags || [])
    )).sort();

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    if (allTags.length === 0) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`glass ${selectedTags.length > 0 ? 'active' : ''}`}
                style={{
                    position: 'fixed',
                    top: '80px', // Below search button
                    left: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    zIndex: 'var(--z-popover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                    border: selectedTags.length > 0 ? '2px solid var(--primary-500)' : 'none',
                    color: selectedTags.length > 0 ? 'var(--primary-500)' : 'var(--neutral-600)',
                    boxShadow: 'var(--shadow-lg)'
                }}
                title="Filter by tags"
            >
                <Filter size={20} />
                {selectedTags.length > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        backgroundColor: 'var(--primary-500)',
                        color: 'white',
                        fontSize: '10px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {selectedTags.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 'var(--z-modal)' }}
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div
                        className="glass fade-in"
                        style={{
                            position: 'fixed',
                            top: '80px',
                            left: '80px',
                            maxWidth: '300px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-xl)',
                            zIndex: 'var(--z-modal)',
                            boxShadow: 'var(--shadow-xl)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-2)'
                        }}
                    >
                        <div style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            marginBottom: 'var(--spacing-2)',
                            color: 'var(--text)'
                        }}>
                            Filter by Tags
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`badge ${selectedTags.includes(tag) ? 'badge-primary' : 'badge-neutral'}`}
                                    style={{
                                        cursor: 'pointer',
                                        border: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>

                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => setSelectedTags([])}
                                style={{
                                    marginTop: 'var(--spacing-2)',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--neutral-500)',
                                    background: 'none',
                                    border: 'none',
                                    textDecoration: 'underline',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </>
            )}
        </>
    );
};

