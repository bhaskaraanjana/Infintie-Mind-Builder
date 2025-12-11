import React from 'react';
import { useStore } from '../store';
import { Trash2, Link as LinkIcon, Palette, Copy, Minimize2, Maximize2 } from 'lucide-react';

export const MobileContextMenu: React.FC = () => {
    const {
        contextMenu,
        setContextMenu,
        deleteNote,
        updateNote,
        notes,
        createCluster,
        setClusterColor
    } = useStore();

    if (!contextMenu || window.innerWidth >= 768) return null;

    const handleAction = (action: () => void) => {
        action();
        setContextMenu(null);
    };

    const targetNote = contextMenu.itemType === 'note' && contextMenu.itemId ? notes[contextMenu.itemId] : null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    zIndex: 'var(--z-modal)',
                    backdropFilter: 'blur(2px)'
                }}
                onClick={() => setContextMenu(null)}
            />

            {/* Bottom Sheet */}
            <div className="glass slide-in-up" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'var(--spacing-4)',
                borderTopLeftRadius: 'var(--radius-2xl)',
                borderTopRightRadius: 'var(--radius-2xl)',
                zIndex: 'var(--z-modal)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
                boxShadow: 'var(--shadow-2xl)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                {/* Drag Handle */}
                <div style={{
                    width: '40px',
                    height: '4px',
                    backgroundColor: 'var(--neutral-300)',
                    borderRadius: 'var(--radius-full)',
                    margin: '0 auto var(--spacing-2)'
                }} />

                <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--neutral-500)',
                    marginBottom: 'var(--spacing-2)',
                    textAlign: 'center'
                }}>
                    {contextMenu.itemType === 'note' ? 'Note Options' : 'Canvas Options'}
                </div>

                {contextMenu.itemType === 'note' && targetNote && (
                    <>
                        <button
                            className="menu-item"
                            onClick={() => handleAction(() => {
                                // Expand logic handled by editor usually, but we can open it
                                // For now, maybe just focus it or something
                                // Actually, existing double click opens it.
                            })}
                        >
                            <Maximize2 size={18} />
                            <span>Open Editor</span>
                        </button>

                        <button
                            className="menu-item"
                            style={{ color: 'var(--error)' }}
                            onClick={() => handleAction(() => deleteNote(contextMenu.itemId!))}
                        >
                            <Trash2 size={18} />
                            <span>Delete Note</span>
                        </button>
                    </>
                )}

                {contextMenu.itemType === 'canvas' && (
                    <>
                        <button className="menu-item" onClick={() => handleAction(() => {
                            // Helper to create note at click position?
                            // Need to dispatch an event or call store
                        })}>
                            <span>New Note</span>
                        </button>
                        <button className="menu-item" onClick={() => handleAction(() => {
                            // Paste logic
                        })}>
                            <span>Paste</span>
                        </button>
                    </>
                )}

                <button
                    className="button-secondary"
                    style={{ marginTop: 'var(--spacing-2)', width: '100%' }}
                    onClick={() => setContextMenu(null)}
                >
                    Cancel
                </button>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-3);
                    background: transparent;
                    border: none;
                    width: 100%;
                    text-align: left;
                    font-size: var(--text-base);
                    color: var(--neutral-800);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .menu-item:active {
                    background: var(--neutral-100);
                }
            `}</style>
        </>
    );
};
