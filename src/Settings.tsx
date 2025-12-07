import React, { useState } from 'react';
import { themes, type ThemeName } from './themes';
import { useStore } from './store';
import { useAuth } from './contexts/AuthContext';

export const Settings: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { theme: currentTheme, setTheme } = useStore();
    const { logout, user } = useAuth();

    const handleThemeChange = (themeName: ThemeName) => {
        setTheme(themeName);
        setIsOpen(false);
    };

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="glass"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-full)',
                    zIndex: 'var(--z-sticky)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-2xl)',
                    transition: 'all var(--transition-base)'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-600)" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2" />
                </svg>
            </button>

            {/* Settings Modal */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 'var(--z-modal)',
                            animation: 'fade-in var(--transition-base)'
                        }}
                    />

                    {/* Modal Content */}
                    <div
                        className="glass"
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '500px',
                            maxWidth: '90vw',
                            padding: 'var(--spacing-6)',
                            borderRadius: 'var(--radius-2xl)',
                            zIndex: 'var(--z-popover)',
                            boxShadow: 'var(--shadow-2xl)',
                            animation: 'scale-in var(--transition-base)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 700,
                                color: 'var(--neutral-900)'
                            }}>
                                Settings
                            </h2>
                            <p style={{
                                margin: 'var(--spacing-2) 0 0',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--neutral-600)'
                            }}>
                                Logged in as: {user?.email}
                            </p>
                            <button
                                onClick={async () => {
                                    if (confirm('Log out?')) {
                                        await logout();
                                    }
                                }}
                                style={{
                                    marginTop: 'var(--spacing-3)',
                                    padding: 'var(--spacing-2) var(--spacing-4)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--primary-500)',
                                    backgroundColor: 'white',
                                    color: 'var(--primary-500)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-base)'
                                }}
                            >
                                Logout
                            </button>
                        </div>

                        {/* Debug Tools */}
                        <div style={{ marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: 'var(--spacing-6)' }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--neutral-900)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                🛠️ Debug Tools
                            </h3>

                            <div style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-3)', color: 'var(--neutral-600)' }}>
                                <div>Local Notes: {Object.keys(useStore.getState().notes).length}</div>
                                <div>Syncing: {useStore.getState().syncing ? 'Yes' : 'No'}</div>
                                <div>User ID: {user?.uid.slice(0, 8)}...</div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => {
                                        console.clear();
                                        console.log('=== DEBUG INFO ===');
                                        console.log('Notes:', useStore.getState().notes);
                                        console.log('Clusters:', useStore.getState().clusters);
                                        console.log('Links:', useStore.getState().links);
                                        console.log('User:', user);
                                        alert('Check browser console (F12)');
                                    }}
                                    style={{
                                        padding: 'var(--spacing-2) var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-300)',
                                        backgroundColor: 'white',
                                        fontSize: 'var(--text-xs)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    📊 Log State
                                </button>

                                <button
                                    onClick={async () => {
                                        const notes = Object.values(useStore.getState().notes);
                                        if (notes.length === 0) {
                                            alert('No notes to sync');
                                            return;
                                        }
                                        console.log('🔄 Manually syncing', notes.length, 'notes...');
                                        try {
                                            const { syncService } = await import('./services/firebaseSyncService');
                                            for (const note of notes) {
                                                await syncService.syncNote(note);
                                            }
                                            alert(`✅ Synced ${notes.length} notes!`);
                                        } catch (error) {
                                            console.error('Sync failed:', error);
                                            alert('❌ Sync failed - check console');
                                        }
                                    }}
                                    style={{
                                        padding: 'var(--spacing-2) var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--primary-500)',
                                        backgroundColor: 'var(--primary-500)',
                                        color: 'white',
                                        fontSize: 'var(--text-xs)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔄 Force Sync All
                                </button>

                                <button
                                    onClick={() => {
                                        const url = `https://console.firebase.google.com/project/infinite-mind-8f29c/firestore/databases/-default-/data/~2Fusers~2F${user?.uid}~2Fnotes`;
                                        window.open(url, '_blank');
                                    }}
                                    style={{
                                        padding: 'var(--spacing-2) var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-300)',
                                        backgroundColor: 'white',
                                        fontSize: 'var(--text-xs)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    🔥 Open Firestore
                                </button>
                            </div>
                        </div>


                        {/* Export/Import Section */}
                        <div style={{ marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: 'var(--spacing-6)' }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--neutral-900)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                Backup & Restore
                            </h3>
                            <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                                <button
                                    onClick={() => useStore.getState().exportData?.()}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: 'none',
                                        backgroundColor: 'var(--primary-500)',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-base)'
                                    }}
                                >
                                    Export Notes
                                </button>
                                <button
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = '.json';
                                        input.onchange = (e) => {
                                            const file = (e.target as HTMLInputElement).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (evt) => {
                                                    try {
                                                        const data = JSON.parse(evt.target?.result as string);
                                                        const result = useStore.getState().importData?.(data);
                                                        alert(result?.message || 'Import successful');
                                                    } catch (err) {
                                                        alert('Failed to import: Invalid file format');
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--primary-500)',
                                        backgroundColor: 'white',
                                        color: 'var(--primary-500)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-base)'
                                    }}
                                >
                                    Import Notes
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('⚠️ Delete ALL notes, clusters, and links? This cannot be undone!')) {
                                        // Clear Zustand state
                                        useStore.setState({
                                            notes: {},
                                            clusters: {},
                                            links: {}
                                        });
                                        // Clear database
                                        import('./db').then(({ db }) => {
                                            db.notes.clear();
                                            db.clusters.clear();
                                            db.links.clear();
                                        });
                                        alert('All data cleared!');
                                        setIsOpen(false);
                                    }
                                }}
                                style={{
                                    marginTop: 'var(--spacing-3)',
                                    width: '100%',
                                    padding: 'var(--spacing-2)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid var(--error)',
                                    backgroundColor: 'white',
                                    color: 'var(--error)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-base)'
                                }}
                            >
                                🗑️ Clear All Data (Debug)
                            </button>
                        </div>

                        {/* Theme Section */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--neutral-900)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                Theme
                            </h3>
                        </div>

                        {/* Theme Grid */}
                        <div style={{
                            display: 'grid',
                            gap: 'var(--spacing-4)',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'
                        }}>
                            {Object.values(themes).map((theme) => (
                                <button
                                    key={theme.name}
                                    onClick={() => handleThemeChange(theme.name)}
                                    style={{
                                        padding: 'var(--spacing-4)',
                                        borderRadius: 'var(--radius-xl)',
                                        border: currentTheme === theme.name
                                            ? '2px solid var(--primary-500)'
                                            : '2px solid var(--neutral-200)',
                                        backgroundColor: theme.name === currentTheme
                                            ? 'var(--primary-50)'
                                            : 'white',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-base)',
                                        textAlign: 'left'
                                    }}
                                >
                                    {/* Color Swatches */}
                                    <div style={{
                                        display: 'flex',
                                        gap: 'var(--spacing-2)',
                                        marginBottom: 'var(--spacing-3)'
                                    }}>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: theme.colors.canvasBg,
                                            border: '1px solid var(--neutral-300)'
                                        }} />
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: theme.colors.fleeting.main,
                                            border: '1px solid var(--neutral-300)'
                                        }} />
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-md)',
                                            backgroundColor: theme.colors.literature.main,
                                            border: '1px solid var(--neutral-300)'
                                        }} />
                                    </div>

                                    {/* Theme Name */}
                                    <div style={{
                                        fontWeight: 600,
                                        fontSize: 'var(--text-sm)',
                                        color: 'var(--neutral-900)',
                                        marginBottom: 'var(--spacing-1)'
                                    }}>
                                        {theme.label}
                                    </div>

                                    {/* Description */}
                                    <div style={{
                                        fontSize: 'var(--text-xs)',
                                        color: 'var(--neutral-600)'
                                    }}>
                                        {theme.description}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                marginTop: 'var(--spacing-6)',
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                backgroundColor: 'var(--neutral-200)',
                                color: 'var(--neutral-700)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

