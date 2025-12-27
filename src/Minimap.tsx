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

    // Pinch Zoom State
    const [pinchStart, setPinchStart] = useState<{ dist: number, scale: number } | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Force update when viewport changes (keep this just in case, though useStore selector usually handles it)
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

        // Include Current Viewport
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
    }, [notes, clusters, viewport.x, viewport.y, viewport.scale]);

    // Scale Factor
    const scale = Math.min(
        MINIMAP_WIDTH / bounds.width,
        MINIMAP_HEIGHT / bounds.height
    );

    // Centering offsets
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
        const newStageX = window.innerWidth / 2 - worldPos.x * viewport.scale;
        const newStageY = window.innerHeight / 2 - worldPos.y * viewport.scale;

        setViewport({
            x: newStageX,
            y: newStageY,
            scale: viewport.scale
        });
    };

    const updateViewportFromDelta = (clientX: number, clientY: number) => {
        if (!dragStartRef.current) return;

        const dx = clientX - dragStartRef.current.x;
        const dy = clientY - dragStartRef.current.y;

        // Convert pixel delta on screen to world delta
        const worldDx = dx / scale;
        const worldDy = dy / scale;

        // Apply to Viewport
        const deltaStageX = -(worldDx * viewport.scale);
        const deltaStageY = -(worldDy * viewport.scale);

        setViewport({
            x: dragStartRef.current.viewX + deltaStageX,
            y: dragStartRef.current.viewY + deltaStageY,
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

        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
    };

    const handleDragMove = (e: MouseEvent) => {
        updateViewportFromDelta(e.clientX, e.clientY);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragStartRef.current = null;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Pinch Zoom Start
        if (e.touches.length === 2) {
            e.stopPropagation();
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setPinchStart({ dist, scale: viewport.scale });
            return;
        }

        // Check if target is viewport drag handle
        const target = e.target as Element;
        const isViewportDrag = target.closest('g')?.getAttribute('data-viewport-drag') === 'true';

        if (isViewportDrag) {
            e.stopPropagation();
            setIsDragging(true);
            const touch = e.touches[0];
            dragStartRef.current = {
                x: touch.clientX,
                y: touch.clientY,
                viewX: viewport.x,
                viewY: viewport.y
            };

            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Stop scrolling

        // Pinch Zoom Move
        if (e.touches.length === 2 && pinchStart) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            // Calculate new scale
            const scaleFactor = dist / pinchStart.dist;
            let newScale = pinchStart.scale * scaleFactor;

            // Clamp scale
            newScale = Math.max(0.1, Math.min(5, newScale));

            setViewport({ ...viewport, scale: newScale });
            return;
        }

        if (!dragStartRef.current) return;
        const touch = e.touches[0];
        updateViewportFromDelta(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setPinchStart(null); // Reset pinch
        dragStartRef.current = null;
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };

    // Calculate Viewport Rect
    const viewWorldX = -viewport.x / viewport.scale;
    const viewWorldY = -viewport.y / viewport.scale;
    const viewWorldW = window.innerWidth / viewport.scale;
    const viewWorldH = window.innerHeight / viewport.scale;

    const vpPos = worldToMinimap(viewWorldX, viewWorldY);
    const vpW = viewWorldW * scale;
    const vpH = viewWorldH * scale;

    return (
        <div>
            {/* Toggle Button */}
            <button
                id="minimap-toggle"
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
                        bottom: isMobile ? 'auto' : '70px',
                        right: isMobile ? 'auto' : '20px',
                        top: isMobile ? '50%' : 'auto',
                        left: isMobile ? '50%' : 'auto',
                        transform: isMobile ? 'translate(-50%, -50%) scale(1.2)' : 'none',
                        borderRadius: 'var(--radius-2xl)',
                        padding: 'var(--spacing-4)',
                        zIndex: 'var(--z-sticky)',
                        boxShadow: 'var(--shadow-2xl)',
                        opacity: hover || isDragging ? 1 : 0.85,
                        transition: 'opacity 0.2s',
                        touchAction: 'none'
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
                            border: '1px solid var(--border)',
                            touchAction: 'none'
                        }}
                        onClick={handleBackgroundClick}
                        onTouchStart={handleTouchStart}
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
                                    r={3}
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
                                    r={8} // Cluster size on map
                                    fill={cluster.color}
                                    opacity={0.3}
                                />
                            );
                        })}

                        {/* Viewport Indicator (Draggable) */}
                        <g
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            onMouseDown={handleDragStart}
                            data-viewport-drag="true"
                        >
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
