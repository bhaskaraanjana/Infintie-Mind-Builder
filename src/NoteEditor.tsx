import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from './store';
import type { NoteType } from './types';
import { TagInput } from './TagInput';
import { getBacklinks } from './referenceParser';

export const NoteEditor = () => {
    const { notes, editingNoteId, setEditingNoteId, updateNote, deleteNote } = useStore();

    const note = editingNoteId ? notes[editingNoteId] : null;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<NoteType>('fleeting');
    const [tags, setTags] = useState<string[]>([]);

    // Autocomplete state
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteQuery, setAutocompleteQuery] = useState('');
    const [autocompletePosition, setAutocompletePosition] = useState(0);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Smart detection state
    const [detectedTitles, setDetectedTitles] = useState<string[]>([]);

    // Quick panel state
    const [showQuickPanel, setShowQuickPanel] = useState(false);
    const [panelSearch, setPanelSearch] = useState('');

    // Get all existing tags for autocomplete
    const allTags = Array.from(new Set(
        Object.values(notes).flatMap(n => n.tags || [])
    ));

    // Get note title suggestions (deduplicated and filtered)
    const noteTitles = useMemo(() => Array.from(new Set(
        Object.values(notes)
            .filter(n => n.id !== note?.id) // Exclude current note
            .map(n => n.title)
    )), [notes, note?.id]);

    // Filter suggestions based on query
    const suggestions = autocompleteQuery
        ? noteTitles.filter(title =>
            title.toLowerCase().includes(autocompleteQuery.toLowerCase())
        ).slice(0, 5) // Limit to 5 suggestions
        : noteTitles.slice(0, 5);

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setType(note.type);
            setTags(note.tags || []);
        }
    }, [note]);

    // Detect title matches in content
    useEffect(() => {
        if (!content) {
            setDetectedTitles([]);
            return;
        }

        const detected: string[] = [];
        const contentLower = content.toLowerCase();

        // Find note titles mentioned in content (not already in [[]])
        noteTitles.forEach(title => {
            if (title.length < 3) return; // Skip very short titles

            const titleLower = title.toLowerCase();
            const index = contentLower.indexOf(titleLower);

            if (index !== -1) {
                // Check if it's already wrapped in [[]]
                const before = content.substring(Math.max(0, index - 2), index);
                const after = content.substring(index + title.length, index + title.length + 2);

                if (before !== '[[' && after !== ']]') {
                    detected.push(title);
                }
            }
        });

        setDetectedTitles(detected.slice(0, 3)); // Limit to 3
    }, [content, noteTitles]);

    if (!editingNoteId || !note) return null;

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        const cursorPos = e.target.selectionStart;

        setContent(newContent);

        // Check if user typed [[
        const textBeforeCursor = newContent.substring(0, cursorPos);
        const lastDoubleBracket = textBeforeCursor.lastIndexOf('[[');

        if (lastDoubleBracket !== -1) {
            const textAfterBracket = textBeforeCursor.substring(lastDoubleBracket + 2);
            const hasClosingBracket = textAfterBracket.includes(']]');

            if (!hasClosingBracket) {
                // We're inside [[...
                setShowAutocomplete(true);
                setAutocompleteQuery(textAfterBracket);
                setAutocompletePosition(lastDoubleBracket);
                setSelectedSuggestionIndex(0);
                return;
            }
        }

        // Hide autocomplete if not inside [[
        setShowAutocomplete(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        // Autocomplete handling (only for textarea)
        if (showAutocomplete && suggestions.length > 0 && e.currentTarget.tagName === 'TEXTAREA') {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
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

        // Global shortcuts
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
        const newCursorPos = autocompletePosition + suggestion.length + 4; // [[]] = 4 chars

        setContent(newContent);
        setShowAutocomplete(false);

        // Set cursor position after React updates
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = newCursorPos;
                textareaRef.current.selectionEnd = newCursorPos;
                textareaRef.current.focus();
            }
        }, 0);
    };

    const convertToReference = (titleToConvert: string) => {
        const newContent = content.replace(
            new RegExp(titleToConvert, 'gi'),
            `[[${titleToConvert}]]`
        );
        setContent(newContent);
        setDetectedTitles(prev => prev.filter(t => t !== titleToConvert));
    };

    const handleSave = () => {
        updateNote(note.id, { title, content, type, tags });
        setEditingNoteId(null);
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this note?')) {
            deleteNote(note.id);
        }
    };

    const insertReferenceAtCursor = (titleToInsert: string) => {
        if (!textareaRef.current) return;

        const cursorPos = textareaRef.current.selectionStart;
        const beforeCursor = content.substring(0, cursorPos);
        const afterCursor = content.substring(cursorPos);

        const newContent = `${beforeCursor}[[${titleToInsert}]]${afterCursor}`;
        setContent(newContent);

        // Set cursor after inserted reference
        const newCursorPos = cursorPos + titleToInsert.length + 4;
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.selectionStart = newCursorPos;
                textareaRef.current.selectionEnd = newCursorPos;
                textareaRef.current.focus();
            }
        }, 0);
    };

    // Quick panel data
    const recentlyEdited = Object.values(notes)
        .filter(n => n.id !== note?.id)
        .sort((a, b) => b.modified - a.modified)
        .slice(0, 5);

    const relatedByTags = Object.values(notes)
        .filter(n => {
            if (n.id === note?.id || !n.tags || !tags.length) return false;
            return n.tags.some(tag => tags.includes(tag));
        })
        .slice(0, 5);

    const filteredNotes = panelSearch
        ? Object.values(notes).filter(n =>
            n.id !== note?.id &&
            n.title.toLowerCase().includes(panelSearch.toLowerCase())
        )
        : Object.values(notes).filter(n => n.id !== note?.id);

    return (
        <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100
        }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setEditingNoteId(null);
                }
            }}
        >
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                width: showQuickPanel ? '800px' : '500px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                color: '#333',
                display: 'flex',
                gap: '20px'
            }}>
                {/* Main Editor Section */}
                <div style={{ flex: '1', overflow: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Edit Note</h2>
                        <button
                            onClick={() => setShowQuickPanel(!showQuickPanel)}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: showQuickPanel ? '#2196F3' : '#f0f0f0',
                                color: showQuickPanel ? '#fff' : '#333',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            {showQuickPanel ? '✕ Quick Panel' : '📎 Quick Panel'}
                        </button>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '16px',
                                backgroundColor: '#f9f9f9',
                                color: '#333'
                            }}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as NoteType)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: '#f9f9f9',
                                color: '#333'
                            }}
                            onKeyDown={handleKeyDown as any}
                        >
                            <option value="fleeting">Fleeting (Gold)</option>
                            <option value="literature">Literature (Blue)</option>
                            <option value="permanent">Permanent (Green)</option>
                            <option value="hub">Hub (Purple)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '15px', position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Content</label>
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type [[ to reference other notes..."
                            style={{
                                width: '100%',
                                height: '150px',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                backgroundColor: '#f9f9f9',
                                color: '#333',
                                resize: 'vertical'
                            }}
                        />

                        {/* Autocomplete Dropdown */}
                        {showAutocomplete && suggestions.length > 0 && (
                            <div key={autocompleteQuery} style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                zIndex: 1000,
                                marginTop: '4px'
                            }}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={`${suggestion}-${index}`}
                                        onClick={() => insertSuggestion(suggestion)}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            backgroundColor: index === selectedSuggestionIndex ? '#e3f2fd' : '#fff',
                                            borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                                            color: '#333'
                                        }}
                                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                                    >
                                        📝 {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Smart Detection Hints */}
                    {detectedTitles.length > 0 && !showAutocomplete && (
                        <div style={{
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '4px',
                            fontSize: '13px'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                                💡 Detected note titles in content:
                            </div>
                            {detectedTitles.map(title => (
                                <div key={title} style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#856404' }}>"{title}"</span>
                                    <button
                                        onClick={() => convertToReference(title)}
                                        style={{
                                            padding: '3px 10px',
                                            backgroundColor: '#ffc107',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 'bold'
                                        }}
                                        title={`Convert all instances of "${title}" to [[${title}]]`}
                                    >
                                        [+] Convert to [[{title}]]
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tags</label>
                        <TagInput
                            tags={tags}
                            onChange={setTags}
                            existingTags={allTags}
                        />
                    </div>

                    {/* Backlinks Section */}
                    {(() => {
                        const backlinks = getBacklinks(note.id, notes);
                        if (backlinks.length > 0) {
                            return (
                                <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                                        Backlinks ({backlinks.length})
                                    </label>
                                    {backlinks.map(backlink => (
                                        <div
                                            key={backlink.id}
                                            onClick={() => setEditingNoteId(backlink.id)}
                                            style={{
                                                padding: '6px 10px',
                                                marginBottom: '4px',
                                                backgroundColor: '#fff',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                border: '1px solid #ddd',
                                                fontSize: '13px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                                        >
                                            ← {backlink.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={handleDelete}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ff4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Delete Note
                        </button>
                        <div>
                            <button
                                onClick={() => setEditingNoteId(null)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#ccc',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    marginRight: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Reference Panel */}
                {showQuickPanel && (
                    <div style={{
                        width: '280px',
                        borderLeft: '1px solid #ddd',
                        paddingLeft: '20px',
                        overflow: 'auto',
                        maxHeight: '80vh'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '16px', marginBottom: '10px' }}>Quick Reference</h3>

                        {/* Recently Edited */}
                        {recentlyEdited.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
                                    🕒 Recently Edited
                                </div>
                                {recentlyEdited.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => insertReferenceAtCursor(n.title)}
                                        style={{
                                            padding: '6px 8px',
                                            marginBottom: '4px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                    >
                                        {n.title}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Related by Tags */}
                        {relatedByTags.length > 0 && (
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
                                    🏷️ Related Notes
                                </div>
                                {relatedByTags.map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => insertReferenceAtCursor(n.title)}
                                        style={{
                                            padding: '6px 8px',
                                            marginBottom: '4px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                    >
                                        {n.title}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* All Notes with Search */}
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>
                                📝 All Notes
                            </div>
                            <input
                                type="text"
                                placeholder="Search notes..."
                                value={panelSearch}
                                onChange={(e) => setPanelSearch(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 8px',
                                    borderRadius: '3px',
                                    border: '1px solid #ccc',
                                    fontSize: '12px',
                                    marginBottom: '8px'
                                }}
                            />
                            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                                {filteredNotes.slice(0, 10).map(n => (
                                    <div
                                        key={n.id}
                                        onClick={() => insertReferenceAtCursor(n.title)}
                                        style={{
                                            padding: '6px 8px',
                                            marginBottom: '4px',
                                            backgroundColor: '#f9f9f9',
                                            borderRadius: '3px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                                    >
                                        {n.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
