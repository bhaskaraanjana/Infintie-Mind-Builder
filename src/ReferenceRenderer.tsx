import React from 'react';
import { useStore } from './store';
import { parseContentParts } from './referenceParser';
import type { Note } from './types';

interface Props {
    note: Note;
    onNavigate?: (noteId: string) => void;
}

export const ReferenceRenderer: React.FC<Props> = ({ note, onNavigate }) => {
    const notes = useStore(state => state.notes);
    const setViewport = useStore(state => state.setViewport);

    const parts = parseContentParts(note.content, notes);

    const handleReferenceClick = (noteId: string) => {
        if (onNavigate) {
            onNavigate(noteId);
        } else {
            // Default: pan to note
            const targetNote = notes[noteId];
            if (targetNote) {
                setViewport({
                    x: -targetNote.x + window.innerWidth / 2,
                    y: -targetNote.y + window.innerHeight / 2,
                    scale: 1
                });
            }
        }
    };

    return (
        <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {parts.map((part, index) => {
                if (part.type === 'text') {
                    return <span key={index}>{part.content}</span>;
                }

                // Reference part
                if (part.exists && part.noteId) {
                    return (
                        <span
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReferenceClick(part.noteId!);
                            }}
                            style={{
                                color: '#4a9eff',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline solid 2px'}
                            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        >
                            [[{part.content}]]
                        </span>
                    );
                } else {
                    // Broken reference
                    return (
                        <span
                            key={index}
                            style={{
                                color: '#ff6b6b',
                                textDecoration: 'underline dotted',
                                cursor: 'help'
                            }}
                            title={`Note "${part.content}" not found`}
                        >
                            [[{part.content}]]
                        </span>
                    );
                }
            })}
        </span>
    );
};
