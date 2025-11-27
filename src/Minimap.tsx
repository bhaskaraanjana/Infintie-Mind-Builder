import React, { useState, useEffect } from 'react';
import { useStore } from './store';

export const Minimap: React.FC = () => {
    const { notes, clusters, viewport, setViewport } = useStore();
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
        <div
            className="glass"
            style={{
                position: 'fixed',
                bottom: '20px',
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-600)" strokeWidth="2">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                </svg>
                <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--neutral-700)',
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
                    backgroundColor: 'var(--neutral-50)',
                    border: '1px solid var(--neutral-200)'
                }}
                onClick={handleMinimapClick}
            >
                {/* Grid pattern */}
                <defs>
                    <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--neutral-300)" strokeWidth="0.5" opacity="0.3" />
                    </pattern>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                        <rect width="50" height="50" fill="url(#smallGrid)" />
                        <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--neutral-300)" strokeWidth="1" opacity="0.5" />
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
                    stroke="var(--neutral-400)"
                    strokeWidth="1"
                    opacity="0.5"
                />
                <line
                    x1={minimapWidth / 2 - 5}
                    y1={minimapHeight / 2}
                    x2={minimapWidth / 2 + 5}
                    y2={minimapHeight / 2}
                    stroke="var(--neutral-400)"
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

                    const colors = {
                        fleeting: '#FFD700',
                        literature: '#87CEEB',
                        permanent: '#90EE90',
                        hub: '#D8BFD8'
                    };

                    return (
                        <circle
                            key={note.id}
                            cx={x}
                            cy={y}
                            r={2.5}
                            fill={colors[note.type]}
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
                color: 'var(--neutral-600)'
            }}>
                <div>Zoom: {(viewport.scale * 100).toFixed(0)}%</div>
                <div>•</div>
                <div>Clusters: {Object.keys(clusters).length}</div>
            </div>
        </div>
    );
};
