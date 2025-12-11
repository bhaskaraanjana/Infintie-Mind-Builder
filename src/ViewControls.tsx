import React from 'react';
import { useStore } from './store';

export const ViewControls: React.FC = () => {
    const { viewport, setViewport, ui, setUi } = useStore();

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(e.target.value);
        setViewport({ scale: newScale });
    };

    return (
        <div
            className="glass"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: 'var(--spacing-2) var(--spacing-4)', // Reduced padding
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-2)', // Reduced gap
                zIndex: 'var(--z-sticky)',
                boxShadow: 'var(--shadow-xl)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                width: 'max-content',
                maxWidth: '95vw', // Ensure it fits screen
                overflowX: 'auto' // Allow scroll if needed
            }}
        >
            {/* Zoom Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text-secondary)', fontWeight: 600 }}>
                    {(viewport.scale * 100).toFixed(0)}%
                </span>
                <input
                    type="range"
                    min="0.1"
                    max="3.0"
                    step="0.1"
                    value={viewport.scale}
                    onChange={handleZoomChange}
                    style={{
                        width: '100px',
                        accentColor: 'var(--primary-500)',
                        cursor: 'pointer'
                    }}
                />
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--theme-border)' }} />

            {/* LOD Toggle */}
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--theme-canvas-bg)', padding: '2px', borderRadius: 'var(--radius-lg)' }}>
                {(['auto', 'orb', 'card'] as const).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setUi({ lodMode: mode })}
                        style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: ui.lodMode === mode ? 'var(--primary-500)' : 'transparent',
                            color: ui.lodMode === mode ? '#fff' : 'var(--theme-text-secondary)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.2s'
                        }}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--theme-border)' }} />

                {/* Label Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={ui.showOrbLabels}
                        onChange={(e) => setUi({ showOrbLabels: e.target.checked })}
                        style={{ accentColor: 'var(--primary-500)' }}
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text)', fontWeight: 500 }}>
                        Labels
                    </span>
                </label>

                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--theme-border)' }} />

                {/* Details Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={ui.showOrbDetails}
                        onChange={(e) => setUi({ showOrbDetails: e.target.checked })}
                        style={{ accentColor: 'var(--primary-500)' }}
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--theme-text)', fontWeight: 500 }}>
                        Details
                    </span>
                </label>
            </div>
        </div>
    );
};
