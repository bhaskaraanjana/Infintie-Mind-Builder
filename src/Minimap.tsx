import React, { useState, useEffect } from 'react';
import { useStore } from './store';

import { themes } from './themes';

export const Minimap: React.FC = () => {
    const { notes, clusters, viewport, setViewport, theme: themeName, ui, setUi } = useStore();
    const theme = themes[themeName];
    const [hover, setHover] = useState(false);
    const [, forceUpdate] = useState({});

    // Force re-render when viewport changes to update minimap dynamically
    useEffect(() => {
        forceUpdate({});
    }, [viewport.x, viewport.y, viewport.scale]);

    const minimapWidth = 220;
    const minimapHeight = 165;
    const worldSize = 8000;
    const scale = minimapWidth / worldSize;

    const handleMinimapClick = (e: React.MouseEvent<SVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert minimap coordinates to world coordinates
        const worldX = (clickX / minimapWidth) * worldSize - worldSize / 2;
        const worldY = (clickY / minimapHeight) * worldSize - worldSize / 2;

        // Center viewport on clicked location
        setViewport({
            x: -worldX + window.innerWidth / 2,
            y: -worldY + window.innerHeight / 2,
            scale: viewport.scale
        });
    };

    // Calculate viewport rectangle in minimap space
    const viewportWidth = (window.innerWidth / viewport.scale) * scale;
    const viewportHeight = (window.innerHeight / viewport.scale) * scale;
    const viewportX = ((-viewport.x / viewport.scale + worldSize / 2) * scale);
    const viewportY = ((-viewport.y / viewport.scale + worldSize / 2) * scale);

    return (
        <div className="hide-on-mobile">
            {/* Toggle Button */}
            <button
                onClick={() => setUi({ minimapVisible: !ui.minimapVisible })}
                className="glass"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    color: 'var(--theme-text)',
                    cursor: 'pointer',
                    zIndex: 'var(--z-sticky)',
                    boxShadow: 'var(--shadow-lg)',
                    transition: 'all 0.2s'
                }}
                title={ui.minimapVisible ? "Hide Map" : "Show Map"}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {ui.minimapVisible ? (
                        <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                        <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    )}
                </svg>
            </button>

            {/* Minimap Container */}
            {ui.minimapVisible && (
                <div
                    className="glass"
                    style={{
                        position: 'fixed',
                        bottom: '70px', // Moved up to make room for toggle
                        right: '20px',
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--spacing-4)',
                        zIndex: 'var(--z-sticky)',
                        boxShadow: 'var(--shadow-2xl)',
                        opacity: hover ? 1 : 0.85,
                        transition: 'all var(--transition-base)'
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        marginBottom: 'var(--spacing-2)'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--theme-text-secondary)" strokeWidth="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--theme-text)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Map
                        </div>
                        <div className="badge badge-neutral" style={{
                            fontSize: '10px',
                            marginLeft: 'auto'
                        }}>
                            {Object.keys(notes).length}
                        </div>
                    </div>

                    {/* SVG Canvas */}
                    <svg
                        width={minimapWidth}
                        height={minimapHeight}
                        style={{
                            display: 'block',
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--theme-canvas-bg)',
                            border: '1px solid var(--theme-border)'
                        }}
                        onClick={handleMinimapClick}
                    >
                        {/* Grid pattern */}
                        <defs>
                            <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--theme-border)" strokeWidth="0.5" opacity="0.3" />
                            </pattern>
                            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                                <rect width="50" height="50" fill="url(#smallGrid)" />
                                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--theme-border)" strokeWidth="1" opacity="0.5" />
                            </pattern>
                        </defs>

                        {/* Background grid */}
                        <rect width={minimapWidth} height={minimapHeight} fill="url(#grid)" />

                        {/* Center crosshair */}
                        <line
                            x1={minimapWidth / 2}
                            y1={minimapHeight / 2 - 5}
                            x2={minimapWidth / 2}
                            y2={minimapHeight / 2 + 5}
                            stroke="var(--theme-text-secondary)"
                            strokeWidth="1"
                            opacity="0.5"
                        />
                        <line
                            x1={minimapWidth / 2 - 5}
                            y1={minimapHeight / 2}
                            x2={minimapWidth / 2 + 5}
                            y2={minimapHeight / 2}
                            stroke="var(--theme-text-secondary)"
                            strokeWidth="1"
                            opacity="0.5"
                        />

                        {/* Clusters */}
                        {Object.values(clusters).map(cluster => {
                            const x = ((cluster.x + worldSize / 2) * scale);
                            const y = ((cluster.y + worldSize / 2) * scale);
                            return (
                                <g key={cluster.id}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={12}
                                        fill={cluster.color}
                                        opacity={0.15}
                                    />
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={6}
                                        fill={cluster.color}
                                        opacity={0.5}
                                    />
                                </g>
                            );
                        })}

                        {/* Notes */}
                        {Object.values(notes).map(note => {
                            const x = ((note.x + worldSize / 2) * scale);
                            const y = ((note.y + worldSize / 2) * scale);

                            const noteColor = theme.colors[note.type as keyof typeof theme.colors] || theme.colors.fleeting;
                            // @ts-ignore
                            const fill = noteColor.main;

                            return (
                                <circle
                                    key={note.id}
                                    cx={x}
                                    cy={y}
                                    r={2.5}
                                    fill={fill}
                                    opacity={0.9}
                                />
                            );
                        })}

                        {/* Viewport indicator - dynamically updated */}
                        <g>
                            {/* Outer glow */}
                            <rect
                                x={viewportX}
                                y={viewportY}
                                width={viewportWidth}
                                height={viewportHeight}
                                fill="none"
                                stroke="var(--primary-500)"
                                strokeWidth="3"
                                opacity="0.2"
                                rx="2"
                            />
                            {/* Main rectangle */}
                            <rect
                                x={viewportX}
                                y={viewportY}
                                width={viewportWidth}
                                height={viewportHeight}
                                fill="var(--primary-500)"
                                fillOpacity="0.1"
                                stroke="var(--primary-600)"
                                strokeWidth="2"
                                opacity="0.9"
                                rx="2"
                            />
                        </g>
                    </svg>

                    {/* Footer stats */}
                    <div style={{
                        marginTop: 'var(--spacing-2)',
                        display: 'flex',
                        gap: 'var(--spacing-3)',
                        fontSize: '10px',
                        color: 'var(--theme-text-secondary)'
                    }}>
                        <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
                        <div>•</div>
                        <div>Clusters: {Object.keys(clusters).length}</div>
                    </div>
                </div>
            )}
        </div>
    );
};
