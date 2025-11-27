import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from './store';
import type { NoteType } from './types';
import { TagInput } from './TagInput';
import { getBacklinks } from './referenceParser';

const NOTE_TYPE_COLORS = {
    fleeting: { bg: '#FFF9E6', border: '#FFD700', label: 'Fleeting' },
    literature: { bg: '#E6F7FF', border: '#87CEEB', label: 'Literature' },
    permanent: { bg: '#E6FFE6', border: '#90EE90', label: 'Permanent' },
    hub: { bg: '#F5E6FF', border: '#D8BFD8', label: 'Hub' }
};

export const NoteEditor = () => {
    const { notes, editingNoteId, setEditingNoteId, updateNote, deleteNote } = useStore();
    const note = editingNoteId ? notes[editingNoteId] : null;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<NoteType>('fleeting');
    const [tags, setTags] = useState<string[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompletePosition, setAutocompletePosition] = useState(0);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const [detectedTitles, setDetectedTitles] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const allTags = Array.from(new Set(Object.values(notes).flatMap(n => n.tags || [])));
    const noteTitles = useMemo(() => Array.from(new Set(
        Object.values(notes)
            .filter(n => n.id !== note?.id)
            .map(n => n.title)
    )), [notes, note?.id]);

    const suggestions = autocompleteQuery
        ? noteTitles.filter(title => title.toLowerCase().includes(autocompleteQuery.toLowerCase())).slice(0, 5)
        : noteTitles.slice(0, 5);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setType(note.type);
            setTags(note.tags || []);
        }
    }, [note]);

    useEffect(() => {
        if (!content) {
            setDetectedTitles([]);
            return;
        }
        const detected: string[] = [];
        const contentLower = content.toLowerCase();
        noteTitles.forEach(title => {
            if (title.length < 3) return;
            const titleLower = title.toLowerCase();
            const index = contentLower.indexOf(titleLower);
            if (index !== -1) {
                const before = content.substring(Math.max(0, index - 2), index);
                const after = content.substring(index + title.length, index + title.length + 2);
                if (before !== '[[' && after !== ']]') {
                    detected.push(title);
                }
            }
        });
        setDetectedTitles(detected.slice(0, 3));
    }, [content, noteTitles]);

    if (!editingNoteId || !note) return null;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const cursorPos = e.target.selectionStart;
        setContent(newContent);

        const textBeforeCursor = newContent.substring(0, cursorPos);
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');

        if (lastDoubleBracket !== -1) {
            const textAfterBracket = textBeforeCursor.substring(lastDoubleBracket + 2);
            const hasClosingBracket = textAfterBracket.includes(']]');
            if (!hasClosingBracket) {
                setShowAutocomplete(true);
                setAutocompleteQuery(textAfterBracket);
                setAutocompletePosition(lastDoubleBracket);
                setSelectedSuggestionIndex(0);
                return;
            }
        }
        setShowAutocomplete(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        if (showAutocomplete && suggestions.length > 0 && e.currentTarget.tagName === 'TEXTAREA') {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                return;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
                return;
            } else if (e.key === 'Enter') {
                e.preventDefault();
                insertSuggestion(suggestions[selectedSuggestionIndex]);
                return;
            } else if (e.key === 'Escape') {
                setShowAutocomplete(false);
                e.stopPropagation();
                return;
            }
        }

        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditingNoteId(null);
        }
    };

    const insertSuggestion = (suggestion: string) => {
        if (!textareaRef.current) return;
        const cursorPos = textareaRef.current.selectionStart;
        const beforeCursor = content.substring(0, autocompletePosition);
        const afterCursor = content.substring(cursorPos);
        const newContent = `${beforeCursor}[[${suggestion}]]${afterCursor}`;
        setContent(newContent);
        setShowAutocomplete(false);
        setTimeout(() => {
            const newPos = autocompletePosition + suggestion.length + 4;
            textareaRef.current?.setSelectionRange(newPos, newPos);
            textareaRef.current?.focus();
        }, 0);
    };

    const wrapWithReference = (title: string) => {
        const index = content.toLowerCase().indexOf(title.toLowerCase());
        if (index === -1) return;
        const newContent = content.substring(0, index) + `[[${content.substring(index, index + title.length)}]]` + content.substring(index + title.length);
        setContent(newContent);
        setDetectedTitles(prev => prev.filter(t => t !== title));
    };

    const handleSave = () => {
        if (!note) return;
        updateNote(note.id, { title, content, type, tags });
        setEditingNoteId(null);
    };

    const handleDelete = () => {
        if (!note || !confirm(`Delete "${note.title}"?`)) return;
        deleteNote(note.id);
        setEditingNoteId(null);
    };

    const backlinks = getBacklinks(note.id, notes);
    const typeInfo = NOTE_TYPE_COLORS[type];

    return (
        <div className="fade-in" style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '450px',
            maxWidth: '100vw',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-modal)',
            display: 'flex',
            justifyContent: 'flex-end'
        }}
            onClick={() => setEditingNoteId(null)}
        >
            <div className="glass slide-in-right" style={{
                width: '450px',
                maxWidth: '100%',
                height: '100%',
                backgroundColor: 'var(--glass-bg)',
                boxShadow: 'var(--shadow-2xl)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-6)',
                    borderBottom: '1px solid var(--neutral-200)',
                    backgroundColor: typeInfo.bg,
                    borderLeft: `4px solid ${typeInfo.border}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as NoteType)}
                                className="input"
                                style={{
                                    padding: 'var(--spacing-1) var(--spacing-2)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 600,
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: 'var(--neutral-800)',
                                    cursor: 'pointer'
                                }}
                            >
                                {Object.entries(NOTE_TYPE_COLORS).map(([value, info]) => (
                                    <option key={value} value={value}>{info.label}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setEditingNoteId(null)}
                            className="button-secondary"
                            style={{
                                padding: 'var(--spacing-2)',
                                minWidth: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-full)'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Title */}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Note title..."
                        className="input"
                        style={{
                            fontSize: 'var(--text-xl)',
                            fontWeight: 600,
                            border: 'none',
                            backgroundColor: 'white',
                            marginBottom: 'var(--spacing-3)'
                        }}
                        autoFocus
                    />
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: 'var(--spacing-6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-6)'
                }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--neutral-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Content
                        </label>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Write your thoughts... Use [[Note Title]] to link notes"
                            className="input textarea"
                            style={{
                                minHeight: '200px',
                                fontFamily: 'var(--font-sans)',
                                lineHeight: 1.6,
                                resize: 'vertical'
                            }}
                        />

                        {/* Autocomplete */}
                        {showAutocomplete && suggestions.length > 0 && (
                            <div className="glass scale-in" style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: 'var(--spacing-2)',
                                backgroundColor: 'white',
                                borderRadius: 'var(--radius-lg)',
                                boxShadow: 'var(--shadow-xl)',
                                overflow: 'hidden',
                                zIndex: 'var(--z-popover)',
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={suggestion}
                                        onClick={() => insertSuggestion(suggestion)}
                                        style={{
                                            padding: 'var(--spacing-3)',
                                            cursor: 'pointer',
                                            backgroundColor: index === selectedSuggestionIndex ? 'var(--primary-50)' : 'transparent',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--neutral-900)',
                                            transition: 'background-color var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (index !== selectedSuggestionIndex) {
                                                e.currentTarget.style.backgroundColor = 'var(--neutral-100)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (index !== selectedSuggestionIndex) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        [[{suggestion}]]
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Smart References */}
                    {detectedTitles.length > 0 && (
                        <div className="glass fade-in" style={{
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-lg)',
                            borderLeft: '3px solid var(--warning)'
                        }}>
                            <div style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                color: 'var(--neutral-700)',
                                marginBottom: 'var(--spacing-3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                Detected References
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                {detectedTitles.map(title => (
                                    <button
                                        key={title}
                                        onClick={() => wrapWithReference(title)}
                                        className="button-secondary"
                                        style={{
                                            justifyContent: 'flex-start',
                                            fontSize: 'var(--text-sm)',
                                            textAlign: 'left'
                                        }}
                                    >
                                        Link "{title}"
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--neutral-700)',
                            marginBottom: 'var(--spacing-2)'
                        }}>
                            Tags
                        </label>
                        <TagInput tags={tags} setTags={setTags} allTags={allTags} />
                    </div>

                    {/* Backlinks */}
                    {backlinks.length > 0 && (
                        <div className="glass" style={{
                            padding: 'var(--spacing-4)',
                            borderRadius: 'var(--radius-lg)',
                            borderLeft: '3px solid var(--info)'
                        }}>
                            <div style={{
                                fontSize: 'var(--text-sm)',
                                fontWeight: 600,
                                color: 'var(--neutral-700)',
                                marginBottom: 'var(--spacing-3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)'
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 10 4 15 9 20" />
                                    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                                </svg>
                                Backlinks ({backlinks.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                {backlinks.map(backlink => (
                                    <div
                                        key={backlink.id}
                                        onClick={() => setEditingNoteId(backlink.id)}
                                        style={{
                                            padding: 'var(--spacing-2)',
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            fontSize: 'var(--text-sm)',
                                            color: 'var(--neutral-700)',
                                            transition: 'background-color var(--transition-fast)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-100)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        → {backlink.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: 'var(--spacing-6)',
                    borderTop: '1px solid var(--neutral-200)',
                    display: 'flex',
                    gap: 'var(--spacing-3)',
                    justifyContent: 'space-between'
                }}>
                    <button
                        onClick={handleDelete}
                        className="button button-danger"
                    >
                        Delete
                    </button>
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <button
                            onClick={() => setEditingNoteId(null)}
                            className="button button-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="button button-primary"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
