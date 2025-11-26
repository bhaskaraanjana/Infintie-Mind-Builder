import React, { useState, type KeyboardEvent, type ChangeEvent } from 'react';

interface Props {
    tags: string[];
    onChange: (tags: string[]) => void;
    existingTags?: string[];
}

export const TagInput: React.FC<Props> = ({ tags, onChange, existingTags = [] }) => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);

        // Show suggestions based on existing tags
        if (value.trim()) {
            const matches = existingTags.filter(tag =>
                tag.toLowerCase().includes(value.toLowerCase()) &&
                !tags.includes(tag)
            );
            setSuggestions(matches.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const addTag = (tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInput('');
        setSuggestions([]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(input);
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            // Remove last tag on backspace if input is empty
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '6px',
                minHeight: '40px',
                alignItems: 'center'
            }}>
                {tags.map(tag => (
                    <div
                        key={tag}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: '#4a9eff',
                            color: '#fff',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}
                    >
                        <span>#{tag}</span>
                        <button
                            onClick={() => removeTag(tag)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                padding: '0',
                                fontSize: '14px',
                                lineHeight: '1',
                                opacity: 0.8
                            }}
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? "Add tags (press Enter or comma)" : ""}
                    style={{
                        flex: '1',
                        minWidth: '120px',
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '4px'
                    }}
                />
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    maxHeight: '150px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map(suggestion => (
                        <div
                            key={suggestion}
                            onClick={() => addTag(suggestion)}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#ccc',
                                borderBottom: '1px solid #333'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a3a3a'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            #{suggestion}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
