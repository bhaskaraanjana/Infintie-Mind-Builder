import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Sparkles, CircleDot, Square, Tag, AlignLeft } from 'lucide-react';

export const ViewControls: React.FC = () => {
    const { viewport, setViewport, ui, setUi } = useStore();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(e.target.value);
        setViewport({ scale: newScale });
    };

    const selectionMode = useStore((state) => state.selectionMode);

    if (selectionMode) return null; // Hide if selection toolbar is active

    return (
        <div
            id="view-controls"
            className="glass"
            style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '4px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 'var(--z-sticky)',
                boxShadow: 'var(--shadow-xl)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                width: 'max-content',
                maxWidth: '90vw',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Zoom Slider - Desktop Only */}
            <div className="hide-on-mobile" style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 'var(--spacing-2)', paddingLeft: '8px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--textSecondary)', fontWeight: 600, minWidth: '40px' }}>
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
                        width: '80px',
                        accentColor: 'var(--primary-500)',
                        cursor: 'pointer'
                    }}
                />
            </div>

            <div className="hide-on-mobile" style={{ display: isMobile ? 'none' : 'block', width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

            {/* LOD Toggle */}
            <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--canvasBg)', padding: '2px', borderRadius: '9999px' }}>
                {(['auto', 'orb', 'card'] as const).map((mode) => {
                    const Icon = mode === 'auto' ? Sparkles : mode === 'orb' ? CircleDot : Square;
                    return (
                        <button
                            key={mode}
                            onClick={() => setUi({ lodMode: mode })}
                            style={{
                                padding: isMobile ? '8px' : '4px 12px',
                                borderRadius: '9999px',
                                border: 'none',
                                background: ui.lodMode === mode ? 'var(--primary-500)' : 'transparent',
                                color: ui.lodMode === mode ? '#fff' : 'var(--textSecondary)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: isMobile ? '36px' : 'auto',
                                justifyContent: 'center'
                            }}
                        >
                            {isMobile ? <Icon size={18} /> : mode}
                        </button>
                    );
                })}
            </div>

            {/* Label & Details Toggles */}
            {ui.lodMode === 'orb' && (
                <>
                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />

                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                            onClick={() => setUi({ showOrbLabels: !ui.showOrbLabels })}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                background: ui.showOrbLabels ? 'var(--primary-100)' : 'transparent',
                                color: ui.showOrbLabels ? 'var(--primary-600)' : 'var(--textSecondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Tag size={18} />
                        </button>

                        <button
                            onClick={() => setUi({ showOrbDetails: !ui.showOrbDetails })}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                border: 'none',
                                background: ui.showOrbDetails ? 'var(--primary-100)' : 'transparent',
                                color: ui.showOrbDetails ? 'var(--primary-600)' : 'var(--textSecondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <AlignLeft size={18} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
