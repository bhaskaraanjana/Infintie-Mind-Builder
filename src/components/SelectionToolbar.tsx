import React from 'react';
import { useStore } from '../store';
import { Trash2, BoxSelect, X } from 'lucide-react';
import styles from '../NoteEditor.module.css'; // Reusing some styles or general atomic CSS? 
// Actually let's just use inline or create a new module, but for consistency let's use inline for layout and standard classNames if possible.
// Given previous components use CSS modules or inline, let's stick to inline style object + standard button classes.

export const SelectionToolbar: React.FC = () => {
    const selectedNoteIds = useStore((state) => state.selectedNoteIds);
    const setSelectedNoteIds = useStore((state) => state.setSelectedNoteIds);
    const deleteNotes = useStore((state) => state.deleteNotes);
    const createCluster = useStore((state) => state.createCluster);
    const toggleSelectionMode = useStore((state) => state.toggleSelectionMode); // To exit mode if needed

    if (selectedNoteIds.length === 0) return null;

    const handleDelete = () => {
        if (window.confirm(`Delete ${selectedNoteIds.length} notes?`)) {
            deleteNotes(selectedNoteIds);
        }
    };

    const handleGroup = () => {
        const title = window.prompt("Enter name for new cluster:", "New Group");
        if (title) {
            createCluster(selectedNoteIds, title);
            setSelectedNoteIds([]); // Clear selection after grouping
        }
    };

    const handleClear = () => {
        setSelectedNoteIds([]);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            padding: '12px 20px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.4)',
            zIndex: 1000,
            transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            minWidth: '200px',
            justifyContent: 'center'
        }}>
            <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginRight: '12px',
                borderRight: '1px solid #ddd',
                paddingRight: '12px'
            }}>
                {selectedNoteIds.length} selected
            </div>

            <button
                onClick={handleGroup}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#444',
                    fontSize: '11px',
                    gap: '4px'
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <BoxSelect size={18} />
                </div>
                Group
            </button>

            <button
                onClick={handleDelete}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ff4444',
                    fontSize: '11px',
                    gap: '4px'
                }}
            >
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ff4444'
                }}>
                    <Trash2 size={18} />
                </div>
                Delete
            </button>

            <button
                onClick={handleClear}
                style={{
                    marginLeft: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <X size={20} />
            </button>
        </div>
    );
};
