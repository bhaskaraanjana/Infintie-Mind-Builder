import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from './store';
import { themes } from './themes';

export const Minimap: React.FC = () => {
    const { notes, clusters, viewport, setViewport, theme: themeName, ui, setUi } = useStore();
    const theme = themes[themeName];
    const [hover, setHover] = useState(false);

    // Drag State
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number, y: number, viewX: number, viewY: number } | null>(null);

    // Force update when viewport changes
    const [, forceUpdate] = useState({});
    useEffect(() => {
        forceUpdate({});
    }, [viewport.x, viewport.y, viewport.scale]);

    const MINIMAP_WIDTH = 220;
    const MINIMAP_HEIGHT = 165;
    const PADDING = 2000; // Extra space around content in world pixels

    // 1. Calculate Dynamic Bounds
    const bounds = useMemo(() => {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        // Include Notes
        const noteIds = Object.keys(notes);
        if (noteIds.length === 0 && Object.keys(clusters).length === 0) {
            return { minX: -4000, minY: -4000, width: 8000, height: 8000 }; // Default if empty
        }

        noteIds.forEach(id => {
            const n = notes[id];
            minX = Math.min(minX, n.x);
            minY = Math.min(minY, n.y);
            maxX = Math.max(maxX, n.x);
            maxY = Math.max(maxY, n.y);
        });

        // Include Clusters
        Object.values(clusters).forEach(c => {
            minX = Math.min(minX, c.x - 100); // Approximate cluster size
            minY = Math.min(minY, c.y - 100);
            maxX = Math.max(maxX, c.x + 100);
            maxY = Math.max(maxY, c.y + 100);
        });

        // Include Current Viewport (so we don't disappear if we scroll away)
        // Viewport X/Y is top-left of screen in world coords * -1 (inverted by scale behavior of Konva usually, 
        // strictly: stage.x = -viewportX * scale) -> viewportX = -stage.x / scale
        const viewX = -viewport.x / viewport.scale;
        const viewY = -viewport.y / viewport.scale;
        const viewW = window.innerWidth / viewport.scale;
        const viewH = window.innerHeight / viewport.scale;

        minX = Math.min(minX, viewX);
        minY = Math.min(minY, viewY);
        maxX = Math.max(maxX, viewX + viewW);
        maxY = Math.max(maxY, viewY + viewH);

        // Apply Padding
        minX -= PADDING;
        minY -= PADDING;
        maxX += PADDING;
        maxY += PADDING;

        return {
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }, [notes, clusters, viewport.x, viewport.y, viewport.scale]); // Re-calc when content or view changes

    // Scale Factor: Fits the world width/height into the minimap box
    // specific logic: use "contain" fit
    const scale = Math.min(
        MINIMAP_WIDTH / bounds.width,
        MINIMAP_HEIGHT / bounds.height
    );

    // Centering offsets (if aspect ratios differ)
    const offsetX = (MINIMAP_WIDTH - bounds.width * scale) / 2;
    const offsetY = (MINIMAP_HEIGHT - bounds.height * scale) / 2;

    // --- Helpers ---
    const worldToMinimap = (wx: number, wy: number) => {
        return {
            x: (wx - bounds.minX) * scale + offsetX,
            y: (wy - bounds.minY) * scale + offsetY
        };
    };

    const minimapToWorld = (mx: number, my: number) => {
        return {
            x: (mx - offsetX) / scale + bounds.minX,
            y: (my - offsetY) / scale + bounds.minY
        };
    };

    // --- Interaction ---

    const handleBackgroundClick = (e: React.MouseEvent<SVGElement>) => {
        if (isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        const worldPos = minimapToWorld(clickX, clickY);

        // Center Viewport on this point
        // target: worldPos is center of screen
        // formula: viewport.x = -worldX * scale + screenWidth/2 ? No, store is x/y offset
        // Store viewport x,y is usually stage position.
        // stage.x = -worldX * scale + screenW/2
        // viewport.x = -worldX * scale + screenW/2 ... wait.
        // Let's check InfiniteCanvas: scaleX={viewport.scale} x={viewport.x}
        // So viewport.x IS stage.x.

        // We want world center to be at center of screen.
        // Center of screen in local coords: screenW/2, screenH/2
        // Center of screen in world coords: (screenW/2 - stage.x) / scale
        // We want (screenW/2 - newStageX) / scale = targetWorldX
        // screenW/2 - newStageX = targetWorldX * scale
        // newStageX = screenW/2 - targetWorldX * scale

        const newStageX = window.innerWidth / 2 - worldPos.x * viewport.scale;
        const newStageY = window.innerHeight / 2 - worldPos.y * viewport.scale;

        setViewport({
            x: newStageX,
            y: newStageY,
            scale: viewport.scale
        });
    };

    const handleDragStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            viewX: viewport.x,
            viewY: viewport.y
        };

        // Add global listeners
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!dragStartRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        // Convert pixel delta on screen to world delta
        // 1px on minimap = 1/scale px in world
        // But dx is in screen pixels, same as minimap pixels
        const worldDx = dx / scale;
        const worldDy = dy / scale;

        // Apply to Viewport
        // Moving box RIGHT -> Viewport moves LEFT (camera moves right)
        // If box moves +10px (representing +1000 world units), camera must look at +1000 world units
        // So stage.x must DECREASE by (1000 * viewport.scale)

        const deltaStageX = -(worldDx * viewport.scale);
        const deltaStageY = -(worldDy * viewport.scale);

        setViewport({
            x: dragStartRef.current.viewX + deltaStageX,
            y: dragStartRef.current.viewY + deltaStageY,
            scale: viewport.scale
        });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
    };

    // Calculate Viewport Rect
    // Viewport world rect:
    const viewWorldX = -viewport.x / viewport.scale;
    const viewWorldY = -viewport.y / viewport.scale;
    const viewWorldW = window.innerWidth / viewport.scale;
    const viewWorldH = window.innerHeight / viewport.scale;

    const vpPos = worldToMinimap(viewWorldX, viewWorldY);
    // Dimensions in minimap space: length * scale
    const vpW = viewWorldW * scale;
    const vpH = viewWorldH * scale;


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
                    color: 'var(--text)',
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
                        bottom: '70px',
                        right: '20px',
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--spacing-4)',
                        zIndex: 'var(--z-sticky)',
                        boxShadow: 'var(--shadow-2xl)',
                        opacity: hover || isDragging ? 1 : 0.85,
                        transition: 'opacity 0.2s'
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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--textSecondary)" strokeWidth="2">
                            <polygon points="3 11 22 2 13 21 11 13 3 11" />
                        </svg>
                        <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--text)',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            Map
                        </div>
                    </div>

                    {/* SVG Canvas */}
                    <svg
                        width={MINIMAP_WIDTH}
                        height={MINIMAP_HEIGHT}
                        style={{
                            display: 'block',
                            cursor: 'crosshair',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: 'var(--canvasBg)',
                            border: '1px solid var(--border)'
                        }}
                        onClick={handleBackgroundClick}
                    >
                        {/* Notes */}
                        {Object.values(notes).map(note => {
                            const pos = worldToMinimap(note.x, note.y);
                            const fill = theme.colors[`${note.type}-main` as keyof typeof theme.colors] || theme.colors['fleeting-main'];

                            return (
                                <circle
                                    key={note.id}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={3} // Slightly larger for visibility
                                    fill={fill}
                                    opacity={0.8}
                                />
                            );
                        })}

                        {/* Clusters */}
                        {Object.values(clusters).map(cluster => {
                            const pos = worldToMinimap(cluster.x, cluster.y);
                            return (
                                <circle
                                    key={cluster.id}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={8}
                                    fill={cluster.color}
                                    opacity={0.3}
                                />
                            );
                        })}

                        {/* Viewport Indicator (Draggable) */}
                        <g
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            onMouseDown={handleDragStart}
                        >
                            {/* Outer glow/border */}
                            <rect
                                x={vpPos.x}
                                y={vpPos.y}
                                width={vpW}
                                height={vpH}
                                fill="var(--primary-500)"
                                fillOpacity={isDragging ? "0.2" : "0.1"}
                                stroke="var(--primary-500)"
                                strokeWidth="2"
                                rx="4"
                            />
                        </g>
                    </svg>
                </div>
            )}
        </div>
    );
};
