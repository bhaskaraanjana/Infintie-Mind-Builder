import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useStore } from './store';

export const DebugMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    return (
        <>
            {/* Debug Button */}
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: 'var(--spacing-4)',
                    left: 'calc(var(--spacing-4) + 60px)', // Next to settings
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'var(--accent-500)',
                    color: 'white',
                    fontSize: 'var(--text-xl)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xl)',
                    zIndex: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.backgroundColor = 'var(--accent-600)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.backgroundColor = 'var(--accent-500)';
                }}
            >
                🛠️
            </button>

            {/* Debug Modal */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{
                            width: '600px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            overflow: 'auto',
                            padding: 'var(--spacing-8)',
                            borderRadius: 'var(--radius-2xl)',
                            boxShadow: 'var(--shadow-2xl)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ marginBottom: 'var(--spacing-6)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: 'var(--spacing-4)' }}>
                            <h2 style={{
                                margin: 0,
                                fontSize: 'var(--text-2xl)',
                                fontWeight: 700,
                                color: 'var(--neutral-900)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-2)'
                            }}>
                                🛠️ Debug Tools
                            </h2>
                            <p style={{
                                margin: 'var(--spacing-2) 0 0',
                                fontSize: 'var(--text-sm)',
                                color: 'var(--neutral-600)'
                            }}>
                                Developer tools for debugging and testing
                            </p>
                        </div>

                        {/* Status Section */}
                        <div style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--neutral-100)', borderRadius: 'var(--radius-lg)' }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>📊 Current State</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)', fontSize: 'var(--text-sm)' }}>
                                <div><strong>Notes:</strong> {Object.keys(useStore.getState().notes).length}</div>
                                <div><strong>Clusters:</strong> {Object.keys(useStore.getState().clusters).length}</div>
                                <div><strong>Links:</strong> {Object.keys(useStore.getState().links).length}</div>
                                <div><strong>Syncing:</strong> {useStore.getState().syncing ? '🟢 Yes' : '🔴 No'}</div>
                                <div style={{ gridColumn: '1 / -1' }}><strong>User:</strong> {user?.email}</div>
                                <div style={{ gridColumn: '1 / -1' }}><strong>UID:</strong> <code>{user?.uid}</code></div>
                            </div>
                        </div>

                        {/* Console Debug */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>🔍 Console Debug</h3>
                            <button
                                onClick={() => {
                                    console.clear();
                                    console.log('=== DEBUG DUMP ===');
                                    console.log('Notes:', useStore.getState().notes);
                                    console.log('Clusters:', useStore.getState().clusters);
                                    console.log('Links:', useStore.getState().links);
                                    console.log('Viewport:', useStore.getState().viewport);
                                    console.log('Theme:', useStore.getState().theme);
                                    console.log('User:', user);
                                    alert('Check browser console (F12)');
                                }}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--neutral-300)',
                                    backgroundColor: 'white',
                                    fontSize: 'var(--text-sm)',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                📊 Dump All State to Console
                            </button>
                        </div>

                        {/* Force Sync */}
                        <div style={{ marginBottom: 'var(--spacing-6)' }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>🔄 Force Cloud Sync</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                <button
                                    onClick={async () => {
                                        const notes = Object.values(useStore.getState().notes);
                                        if (notes.length === 0) {
                                            alert('No notes to sync');
                                            return;
                                        }
                                        console.log('🔄 Syncing', notes.length, 'notes...');
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
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--primary-500)',
                                        backgroundColor: 'var(--primary-500)',
                                        color: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    🔄 Sync All Notes ({Object.keys(useStore.getState().notes).length})
                                </button>

                                <button
                                    onClick={async () => {
                                        const clusters = Object.values(useStore.getState().clusters);
                                        if (clusters.length === 0) {
                                            alert('No clusters to sync');
                                            return;
                                        }
                                        console.log('🔄 Syncing', clusters.length, 'clusters...');
                                        try {
                                            const { syncService } = await import('./services/firebaseSyncService');
                                            for (const cluster of clusters) {
                                                await syncService.syncCluster(cluster);
                                            }
                                            alert(`✅ Synced ${clusters.length} clusters!`);
                                        } catch (error) {
                                            console.error('Sync failed:', error);
                                            alert('❌ Sync failed - check console');
                                        }
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--accent-500)',
                                        backgroundColor: 'var(--accent-500)',
                                        color: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    📦 Sync All Clusters ({Object.keys(useStore.getState().clusters).length})
                                </button>

                                <button
                                    onClick={async () => {
                                        const links = Object.values(useStore.getState().links);
                                        if (links.length === 0) {
                                            alert('No links to sync');
                                            return;
                                        }
                                        console.log('🔄 Syncing', links.length, 'links...');
                                        try {
                                            const { syncService } = await import('./services/firebaseSyncService');
                                            for (const link of links) {
                                                await syncService.syncLink(link);
                                            }
                                            alert(`✅ Synced ${links.length} links!`);
                                        } catch (error) {
                                            console.error('Sync failed:', error);
                                            alert('❌ Sync failed - check console');
                                        }
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-500)',
                                        backgroundColor: 'var(--neutral-500)',
                                        color: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                >
                                    🔗 Sync All Links ({Object.keys(useStore.getState().links).length})
                                </button>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>🔗 Quick Links</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                <button
                                    onClick={() => {
                                        const url = `https://console.firebase.google.com/project/infinite-mind-8f29c/firestore/databases/-default-/data/~2Fusers~2F${user?.uid}~2Fnotes`;
                                        window.open(url, '_blank');
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-300)',
                                        backgroundColor: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        textAlign: 'left'
                                    }}
                                >
                                    🔥 Open Firestore → Notes
                                </button>

                                <button
                                    onClick={() => {
                                        const url = `https://console.firebase.google.com/project/infinite-mind-8f29c/firestore/databases/-default-/data/~2Fusers~2F${user?.uid}~2Fclusters`;
                                        window.open(url, '_blank');
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-300)',
                                        backgroundColor: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        textAlign: 'left'
                                    }}
                                >
                                    📦 Open Firestore → Clusters
                                </button>

                                <button
                                    onClick={() => {
                                        const url = `https://console.firebase.google.com/project/infinite-mind-8f29c/firestore/databases/-default-/data/~2Fusers~2F${user?.uid}~2Flinks`;
                                        window.open(url, '_blank');
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--neutral-300)',
                                        backgroundColor: 'white',
                                        fontSize: 'var(--text-sm)',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        textAlign: 'left'
                                    }}
                                >
                                    🔗 Open Firestore → Links
                                </button>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ marginBottom: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-lg)', border: '2px solid rgb(239, 68, 68)' }}>
                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'rgb(239, 68, 68)' }}>⚠️ Danger Zone</h3>
                            <button
                                onClick={async () => {
                                    if (confirm('⚠️ Delete ALL notes, clusters, and links? This cannot be undone!')) {
                                        if (confirm('Are you absolutely sure? This will delete everything from local AND cloud!')) {
                                            try {
                                                // Clear cloud
                                                const { syncService } = await import('./services/firebaseSyncService');
                                                const notes = Object.values(useStore.getState().notes);
                                                const clusters = Object.values(useStore.getState().clusters);
                                                const links = Object.values(useStore.getState().links);

                                                for (const note of notes) {
                                                    await syncService.deleteNote(note.id);
                                                }
                                                for (const cluster of clusters) {
                                                    await syncService.deleteCluster(cluster.id);
                                                }
                                                for (const link of links) {
                                                    await syncService.deleteLink(link.id);
                                                }

                                                // Clear local
                                                useStore.setState({ notes: {}, clusters: {}, links: {} });
                                                const { db } = await import('./db');
                                                await db.notes.clear();
                                                await db.clusters.clear();
                                                await db.links.clear();

                                                alert('✅ All data cleared from local and cloud');
                                            } catch (error) {
                                                console.error('Clear failed:', error);
                                                alert('❌ Clear failed - check console');
                                            }
                                        }
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: 'var(--spacing-3)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '2px solid rgb(239, 68, 68)',
                                    backgroundColor: 'rgb(239, 68, 68)',
                                    color: 'white',
                                    fontSize: 'var(--text-sm)',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                            >
                                🗑️ Clear All Data (Local + Cloud)
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{
                                marginTop: 'var(--spacing-6)',
                                width: '100%',
                                padding: 'var(--spacing-3)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--neutral-300)',
                                backgroundColor: 'white',
                                fontSize: 'var(--text-sm)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
