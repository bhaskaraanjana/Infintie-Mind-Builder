import React, { useState, useEffect, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import { ChevronUp, ChevronDown, ChevronRight, X } from 'lucide-react';
import './EditorToolbar.css'; // Reuse toolbar styles for consistency

interface EditorSearchBarProps {
    editor: Editor | null;
    onClose: () => void;
}

export const EditorSearchBar = ({ editor, onClose }: EditorSearchBarProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [replaceTerm, setReplaceTerm] = useState('');
    const [showReplace, setShowReplace] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [resultsCount, setResultsCount] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(-1);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Sync state with editor storage
    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            const storage = editor.storage.search;
            if (storage) {
                setResultsCount(storage.results.length);
                setCurrentIndex(storage.currentIndex);
            }
        };

        const handleUpdate = () => {
            updateState();
        };

        editor.on('transaction', handleUpdate);
        return () => {
            editor.off('transaction', handleUpdate);
        };
    }, [editor]);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (editor) {
            editor.commands.setSearchTerm(term);
        }
    };

    const handleNext = () => {
        editor?.commands.findNext();
    };

    const handlePrev = () => {
        editor?.commands.findPrevious();
    };

    const handleReplace = () => {
        editor?.commands.replace(replaceTerm);
    };

    const handleReplaceAll = () => {
        editor?.commands.replaceAll(replaceTerm);
    };

    const handleClose = () => {
        editor?.commands.clearSearch();
        setSearchTerm('');
        setReplaceTerm('');
        setShowReplace(false);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                handlePrev();
            } else {
                handleNext();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
            editor?.commands.focus();
        }
    }

    const handleReplaceKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.metaKey || e.ctrlKey) {
                handleReplaceAll();
            } else {
                handleReplace();
            }
        }
    }

    if (!editor) return null;

    return (
        <div className="editor-search-bar" style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--neutral-50)',
            borderBottom: '1px solid var(--border)',
            fontSize: '14px'
        }}>
            {/* Find Row */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
            }}>
                <button
                    onClick={() => setShowReplace(!showReplace)}
                    className="toolbar-btn"
                    title="Toggle Replace"
                    style={{ padding: '4px' }}
                >
                    <ChevronRight size={14} style={{ transform: showReplace ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }} />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Find"
                    className="search-input"
                    style={{
                        flex: 1,
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: 'var(--bg)'
                    }}
                />

                <div style={{
                    fontSize: '12px',
                    color: 'var(--neutral-500)',
                    minWidth: '60px',
                    textAlign: 'center',
                    userSelect: 'none'
                }}>
                    {resultsCount > 0 ? `${currentIndex + 1} / ${resultsCount}` : 'No results'}
                </div>

                <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                        onClick={handlePrev}
                        className="toolbar-btn"
                        title="Previous (Shift+Enter)"
                        disabled={resultsCount === 0}
                    >
                        <ChevronUp size={16} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="toolbar-btn"
                        title="Next (Enter)"
                        disabled={resultsCount === 0}
                    >
                        <ChevronDown size={16} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="toolbar-btn"
                        title="Close (Esc)"
                        style={{ marginLeft: '4px' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Replace Row */}
            {showReplace && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px 8px 30px', /* Indent to align with input */
                }}>
                    <input
                        type="text"
                        value={replaceTerm}
                        onChange={(e) => setReplaceTerm(e.target.value)}
                        onKeyDown={handleReplaceKeyDown}
                        placeholder="Replace"
                        className="search-input"
                        style={{
                            flex: 1,
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '13px',
                            outline: 'none',
                            backgroundColor: 'var(--bg)'
                        }}
                    />

                    <button
                        onClick={handleReplace}
                        className="toolbar-btn"
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            width: 'auto',
                            border: '1px solid var(--border)',
                            borderRadius: '4px'
                        }}
                        disabled={resultsCount === 0}
                        title="Replace (Enter)"
                    >
                        Replace
                    </button>

                    <button
                        onClick={handleReplaceAll}
                        className="toolbar-btn"
                        style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            width: 'auto',
                            border: '1px solid var(--border)',
                            borderRadius: '4px'
                        }}
                        disabled={resultsCount === 0}
                        title="Replace All (Cmd+Enter)"
                    >
                        All
                    </button>
                </div>
            )}
        </div>
    );
};
