import React, { useState, useEffect } from 'react';
import { themes, type ThemeName } from './themes';
import { useStore } from './store';
import { useAuth } from './contexts/AuthContext';
import { useModalHistory } from './hooks/useModalHistory';
import { User, Palette, Wrench, LogOut, Download, Upload, Trash2, Smartphone, Database, Cloud } from 'lucide-react';

type Tab = 'account' | 'appearance' | 'advanced';

export const Settings: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('account');
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const { theme: currentTheme, setTheme } = useStore();
    const { logout, user } = useAuth();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Debug stats
    const noteCount = Object.keys(useStore((state) => state.notes)).length;
    const clusterCount = Object.keys(useStore((state) => state.clusters)).length;
    const linkCount = Object.keys(useStore((state) => state.links)).length;
    const isSyncing = useStore((state) => state.syncing);

    // Enable Back Button navigation
    useModalHistory(isOpen, () => setIsOpen(false), 'settings');

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    const handleThemeChange = (themeName: ThemeName) => {
        setTheme(themeName);
    };

    const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isMobile ? '8px 12px' : '12px 16px',
                width: isMobile ? 'auto' : '100%',
                flex: isMobile ? '0 0 auto' : 'none', // Allow scrolling on mobile
                padding: isMobile ? '8px 16px' : '12px 16px',
                justifyContent: isMobile ? 'center' : 'flex-start',
                backgroundColor: activeTab === id ? 'var(--primary-50)' : 'transparent',
                border: 'none',
                borderRadius: isMobile ? '20px' : '12px',
                color: activeTab === id ? 'var(--primary-600)' : 'var(--neutral-600)',
                fontWeight: activeTab === id ? 600 : 500,
                cursor: 'pointer',
                textAlign: isMobile ? 'center' : 'left',
                transition: 'all 0.2s',
                marginBottom: isMobile ? '0' : '4px',
                flexDirection: isMobile ? 'column' : 'row',
                fontSize: isMobile ? '11px' : '14px'
            }}
        >
            <Icon size={isMobile ? 20 : 20} />
            <span>{label}</span>
        </button>
    );

    return (
        <>
            {/* Settings Fab */}
            <button
                onClick={() => setIsOpen(true)}
                className="glass"
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    zIndex: 999,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                <User size={20} color="var(--neutral-600)" />
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: isMobile ? '0' : '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass"
                        style={{
                            width: isMobile ? '100%' : '800px',
                            maxWidth: '100%',
                            height: isMobile ? '100%' : '600px',
                            maxHeight: isMobile ? '100vh' : '90vh',
                            borderRadius: isMobile ? '0' : '24px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            overflow: 'hidden',
                            backgroundColor: 'var(--bg)', // Ensure opaque-ish background
                            border: isMobile ? 'none' : '1px solid var(--border)'
                        }}
                    >
                        {/* Sidebar */}
                        <div style={{
                            width: isMobile ? '100%' : '240px',
                            padding: isMobile ? '16px' : '24px',
                            borderRight: isMobile ? 'none' : '1px solid var(--border)',
                            borderBottom: isMobile ? '1px solid var(--border)' : 'none',
                            backgroundColor: 'var(--neutral-50)',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'column',
                            gap: isMobile ? '12px' : '0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '0' : '24px' }}>
                                <h2 style={{
                                    fontSize: isMobile ? '18px' : '20px',
                                    fontWeight: 700,
                                    margin: 0,
                                    paddingLeft: isMobile ? '0' : '12px'
                                }}>
                                    Settings
                                </h2>
                                {isMobile && (
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            padding: '8px 40px', // Increase tap area
                                            cursor: 'pointer',
                                            fontSize: '20px',
                                            marginRight: '-4px' // Optical alignment
                                        }}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div style={{
                                flex: isMobile ? 'none' : 1,
                                display: 'flex',
                                flexDirection: isMobile ? 'row' : 'column',
                                gap: isMobile ? '8px' : '0',
                                backgroundColor: isMobile ? 'transperent' : 'transparent', // Remove bg on mobile to allow scroll bleed
                                padding: isMobile ? '0 4px' : '0',
                                borderRadius: isMobile ? '0' : '0',
                                overflowX: isMobile ? 'auto' : 'visible', // Enable scrolling
                                scrollbarWidth: 'none', // Hide scrollbar for Firefox
                                WebkitOverflowScrolling: 'touch', // Smooth scrolling
                            }}>
                                {/* Hide scrollbar for Chrome/Safari via CSS injection or class if possible, using inline for now */}
                                <style>{`
                                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                                `}</style>
                                <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '8px' : '0', width: '100%' }}>
                                    <TabButton id="account" label="Account" icon={User} />
                                    <TabButton id="appearance" label="Appearance" icon={Palette} />
                                    <TabButton id="advanced" label="Advanced" icon={Wrench} />
                                </div>
                            </div>

                            {!isMobile && (
                                <div style={{ paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--neutral-400)', textAlign: 'center' }}>
                                        Version 0.6.1-beta
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Content Area */}
                        <div style={{
                            flex: 1,
                            padding: '32px',
                            overflowY: 'auto'
                        }}>
                            {/* ACCOUNT TAB */}
                            {activeTab === 'account' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Account</h3>

                                    <div style={{
                                        padding: '24px',
                                        backgroundColor: 'var(--neutral-50)',
                                        borderRadius: '16px',
                                        marginBottom: '24px',
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--primary-100)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '24px',
                                                color: 'var(--primary-600)',
                                                fontWeight: 600
                                            }}>
                                                {user?.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '200px' // Limit width
                                                }}>{user?.email}</div>
                                                <div style={{ color: 'var(--neutral-500)', fontSize: '14px' }}>User ID: {user?.uid.slice(0, 8)}...</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                if (confirm('Are you sure you want to log out?')) {
                                                    await logout();
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '10px 20px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--neutral-300)',
                                                backgroundColor: 'white',
                                                color: 'var(--neutral-700)',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <LogOut size={16} />
                                            Sign Out
                                        </button>
                                    </div>

                                    {installPrompt && (
                                        <div style={{
                                            padding: '24px',
                                            backgroundColor: 'var(--primary-50)',
                                            borderRadius: '16px',
                                            border: '1px solid var(--primary-200)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '16px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <Smartphone className="text-primary-600" />
                                                <div>
                                                    <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--primary-900)' }}>Install App</h4>
                                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--primary-700)' }}>
                                                        Install Infinite Mind for a better full-screen experience.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleInstallClick}
                                                style={{
                                                    alignSelf: 'flex-start',
                                                    padding: '8px 16px',
                                                    backgroundColor: 'var(--primary-600)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Install Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* APPEARANCE TAB */}
                            {activeTab === 'appearance' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Appearance</h3>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '20px'
                                    }}>
                                        {Object.values(themes).map((theme) => (
                                            <button
                                                key={theme.name}
                                                onClick={() => handleThemeChange(theme.name)}
                                                style={{
                                                    border: currentTheme === theme.name ? '2px solid var(--primary-500)' : '2px solid transparent',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: 'var(--neutral-50)',
                                                    textAlign: 'left',
                                                    boxShadow: currentTheme === theme.name ? '0 0 0 4px var(--primary-100)' : 'none'
                                                }}
                                            >
                                                {/* Theme Preview */}
                                                <div style={{
                                                    height: '100px',
                                                    backgroundColor: theme.colors.bg,
                                                    position: 'relative',
                                                    borderBottom: '1px solid var(--border)'
                                                }}>
                                                    {/* Fake UI Elements */}
                                                    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, height: 8, backgroundColor: theme.colors.border, borderRadius: 4, opacity: 0.5 }}></div>
                                                    <div style={{ position: 'absolute', top: 28, left: 12, width: 40, height: 40, borderRadius: '50%', backgroundColor: theme.colors['primary-500'], opacity: 0.2 }}></div>
                                                    <div style={{ position: 'absolute', top: 32, left: 60, right: 30, height: 8, backgroundColor: theme.colors.text, opacity: 0.1, borderRadius: 4 }}></div>
                                                    <div style={{ position: 'absolute', top: 50, left: 60, right: 60, height: 8, backgroundColor: theme.colors.text, opacity: 0.1, borderRadius: 4 }}></div>
                                                </div>

                                                <div style={{ padding: '16px' }}>
                                                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--neutral-900)' }}>{theme.label}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--neutral-500)' }}>{theme.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ADVANCED TAB */}
                            {activeTab === 'advanced' && (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Advanced</h3>

                                    {/* Stats */}
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, 1fr)',
                                        gap: '16px',
                                        marginBottom: '32px'
                                    }}>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--neutral-50)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--neutral-500)', marginBottom: '4px' }}>Notes</div>
                                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{noteCount}</div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--neutral-50)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--neutral-500)', marginBottom: '4px' }}>Clusters</div>
                                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{clusterCount}</div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--neutral-50)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--neutral-500)', marginBottom: '4px' }}>Links</div>
                                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{linkCount}</div>
                                        </div>
                                        <div style={{ padding: '16px', backgroundColor: 'var(--neutral-50)', borderRadius: '12px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '13px', color: 'var(--neutral-500)', marginBottom: '4px' }}>Sync Status</div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: isSyncing ? 'var(--primary-600)' : 'var(--permanent-main)' }}>
                                                {isSyncing ? 'Syncing...' : 'Synced'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Data Management */}
                                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Database size={18} /> Data Management
                                    </h4>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                        <button
                                            onClick={() => useStore.getState().exportData?.()}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                color: 'var(--neutral-700)'
                                            }}
                                        >
                                            <Download size={16} /> Export JSON
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
                                                                useStore.getState().importData?.(data);
                                                            } catch (err) {
                                                                alert('Invalid import file');
                                                            }
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                };
                                                input.click();
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border)',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                                color: 'var(--neutral-700)'
                                            }}
                                        >
                                            <Upload size={16} /> Import JSON
                                        </button>
                                    </div>

                                    {/* Debug Actions */}
                                    <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Cloud size={18} /> Cloud Sync
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                                        <button
                                            onClick={async () => {
                                                const notes = Object.values(useStore.getState().notes);
                                                if (confirm(`Force push ${notes.length} notes to cloud?`)) {
                                                    try {
                                                        const { syncService } = await import('./services/firebaseSyncService');
                                                        for (const note of notes) await syncService.syncNote(note);
                                                        alert('Sync Complete');
                                                    } catch (e) { console.error(e); alert('Sync Failed'); }
                                                }
                                            }}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}
                                        >
                                            Force Push Notes
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log(useStore.getState());
                                                alert('State logged to console');
                                            }}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}
                                        >
                                            Log State to Console
                                        </button>
                                    </div>

                                    {/* Danger Zone */}
                                    <div style={{
                                        padding: '20px',
                                        backgroundColor: '#FEF2F2',
                                        border: '1px solid #FCA5A5',
                                        borderRadius: '12px'
                                    }}>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Trash2 size={18} /> Danger Zone
                                        </h4>
                                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#7F1D1D' }}>
                                            Irreversibly delete all data from your local device and cloud account.
                                        </p>
                                        <button
                                            onClick={async () => {
                                                if (confirm('Delete EVERYTHING? This cannot be undone.')) {
                                                    if (confirm('Are you absolutely sure?')) {
                                                        try {
                                                            // Cloud Wipe
                                                            const { syncService } = await import('./services/firebaseSyncService');
                                                            const notes = Object.values(useStore.getState().notes);
                                                            const clusters = Object.values(useStore.getState().clusters);
                                                            const links = Object.values(useStore.getState().links);

                                                            for (const n of notes) await syncService.deleteNote(n.id);
                                                            for (const c of clusters) await syncService.deleteCluster(c.id);
                                                            for (const l of links) await syncService.deleteLink(l.id);

                                                            // Local Wipe
                                                            useStore.setState({ notes: {}, clusters: {}, links: {} });
                                                            import('./db').then(({ db }) => {
                                                                db.notes.clear();
                                                                db.clusters.clear();
                                                                db.links.clear();
                                                            });

                                                            alert('All data cleared successfully.');
                                                        } catch (e) {
                                                            console.error(e);
                                                            alert('Wipe partial or failed. Check console.');
                                                        }
                                                    }
                                                }
                                            }}
                                            style={{
                                                padding: '10px 20px',
                                                backgroundColor: '#DC2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Clear All Data
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
