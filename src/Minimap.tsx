import React from 'react';
import { useStore } from './store';

export const Minimap: React.FC = () => {
    const { notes, clusters, viewport, setViewport } = useStore();

    const minimapWidth = 200;
    const minimapHeight = 150;
    const worldSize = 8000; // Assume world is ±4000 in each direction
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
            y: -worldY + window.innerHeight / 2
        });
    };

    // Calculate viewport rectangle in minimap space
    const viewportWidth = (window.innerWidth / viewport.scale) * scale;
    const viewportHeight = (window.innerHeight / viewport.scale) * scale;
    const viewportX = ((-viewport.x / viewport.scale + worldSize / 2) * scale);
    const viewportY = ((-viewport.y / viewport.scale + worldSize / 2) * scale);

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            border: '2px solid #444',
            borderRadius: '8px',
            padding: '8px',
            zIndex: 50,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
        }}>
            <div style={{
                fontSize: '11px',
                color: '#999',
                marginBottom: '4px',
                fontWeight: '600'
            }}>
                MINIMAP
            </div>
            <svg
                width={minimapWidth}
                height={minimapHeight}
                style={{ display: 'block', cursor: 'pointer' }}
                onClick={handleMinimapClick}
            >
                {/* Background */}
                <rect width={minimapWidth} height={minimapHeight} fill="#0a0a0a" />

                {/* Grid lines */}
                <line x1={minimapWidth / 2} y1={0} x2={minimapWidth / 2} y2={minimapHeight} stroke="#222" strokeWidth="1" />
                <line x1={0} y1={minimapHeight / 2} x2={minimapWidth} y2={minimapHeight / 2} stroke="#222" strokeWidth="1" />

                {/* Clusters */}
                {Object.values(clusters).map(cluster => {
                    const x = ((cluster.x + worldSize / 2) * scale);
                    const y = ((cluster.y + worldSize / 2) * scale);
                    return (
                        <circle
                            key={cluster.id}
                            cx={x}
                            cy={y}
                            r={8}
                            fill={cluster.color}
                            opacity={0.4}
                        />
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
                        hub: '#DDA0DD'
                    };

                    return (
                        <circle
                            key={note.id}
                            cx={x}
                            cy={y}
                            r={2}
                            fill={colors[note.type]}
                            opacity={0.8}
                        />
                    );
                })}

                {/* Viewport indicator */}
                <rect
                    x={viewportX}
                    y={viewportY}
                    width={viewportWidth}
                    height={viewportHeight}
                    fill="none"
                    stroke="#4a9eff"
                    strokeWidth="2"
                    opacity={0.8}
                />
            </svg>
        </div>
    );
};
