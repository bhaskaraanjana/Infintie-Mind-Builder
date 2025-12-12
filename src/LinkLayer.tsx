import React, { useEffect, useRef } from 'react';
import { Line, Arrow, Group, Text, Rect } from 'react-konva';
import Konva from 'konva';
import type { Note, Link } from './types';
import { NOTE_WIDTH, NOTE_HEIGHT, ORB_RADIUS_DEFAULT, ORB_RADIUS_HUB } from './constants';

interface Props {
    notes: Record<string, Note>;
    links: Record<string, Link>;
    onLinkContextMenu: (e: any, linkId: string) => void;
    scale: number;
}

const DEFAULT_COLORS = {
    related: '#3B82F6',   // Blue
    parent: '#22C55E',    // Green
    criticism: '#EF4444', // Red
    default: '#9CA3AF'    // Gray
};

const LEGACY_LABELS = {
    related: 'Related',
    parent: 'Parent',
    criticism: 'Critique'
};

// Helper to calculate intersection point between a line (center to point) and a rectangle
const getRectIntersection = (cx: number, cy: number, w: number, h: number, px: number, py: number) => {
    const dx = px - cx;
    const dy = py - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    const halfW = w / 2;
    const halfH = h / 2;

    const scaleX = halfW / Math.abs(dx);
    const scaleY = halfH / Math.abs(dy);

    const scale = Math.min(scaleX, scaleY);

    return {
        x: cx + dx * scale,
        y: cy + dy * scale
    };
};

// Helper to calculate point on Quadratic Bezier at t
const getBezierPoint = (t: number, p0: { x: number, y: number }, p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    const oneMinusT = 1 - t;
    return {
        x: oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x,
        y: oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y
    };
};

export const LinkLayer: React.FC<Props> = ({ notes, links, onLinkContextMenu, scale }) => {
    const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);
    const layerRef = useRef<any>(null);

    // Animation loop for flowing dash effect
    useEffect(() => {
        let anim: Konva.Animation;
        if (layerRef.current) {
            anim = new Konva.Animation((frame) => {
                const layer = layerRef.current.getLayer();
                if (!layer) return;

                // Animate all lines with name 'animated-link'
                const lines = layer.find('.animated-link');
                const time = frame?.time || 0;
                const offset = -time / 50; // Speed control

                lines.forEach((node: any) => {
                    // Only animate if dashed/dotted
                    if (node.dash() && node.dash().length > 0) {
                        node.dashOffset(offset);
                    }
                });
            }, layerRef.current.getLayer());

            anim.start();
        }

        return () => {
            if (anim) anim.stop();
        };
    }, []);

    const isOrbView = scale < 1.2;
    // Show labels if scale is high enough or hovered
    const showLabels = scale > 0.6;

    return (
        <Group ref={layerRef}>
            {Object.values(links).map((link) => {
                const source = notes[link.sourceId];
                const target = notes[link.targetId];

                if (!source || !target) return null;

                const isHovered = hoveredLink === link.id;

                // --- Style Resolution ---
                // 1. Color
                let linkColor = link.color;
                if (!linkColor) {
                    linkColor = DEFAULT_COLORS[link.type as keyof typeof DEFAULT_COLORS] || DEFAULT_COLORS.default;
                }

                // 2. Label - Default to empty
                const labelText = link.label || "";

                // 3. Style (Solid/Dashed/Dotted)
                let dashPattern: number[] | undefined = undefined;
                if (link.style === 'dashed') dashPattern = [10, 10];
                else if (link.style === 'dotted') dashPattern = [3, 5];
                else if (!link.style && link.type === 'criticism') dashPattern = [8, 4]; // Legacy fallback

                // 4. Shape (Curved/Straight)
                const isStraight = link.shape === 'straight';

                // 5. Arrow Direction
                const arrowDirection = link.arrowDirection || 'forward';
                const showEndArrow = arrowDirection === 'forward';
                const showStartArrow = arrowDirection === 'reverse';


                // --- Geometry Calculation ---

                // Determine dimensions based on view mode
                let sW, sH, tW, tH, sR, tR;

                // Source Dimensions
                if (isOrbView) {
                    sR = source.type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT;
                    sW = sR * 2;
                    sH = sR * 2;
                } else {
                    sW = NOTE_WIDTH;
                    sH = NOTE_HEIGHT;
                }

                // Target Dimensions
                if (isOrbView) {
                    tR = target.type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT;
                    tW = tR * 2;
                    tH = tR * 2;
                } else {
                    tW = NOTE_WIDTH;
                    tH = NOTE_HEIGHT;
                }

                // Centers
                const sourceCenter = isOrbView
                    ? { x: source.x, y: source.y }
                    : { x: source.x + sW / 2, y: source.y + sH / 2 };

                const targetCenter = isOrbView
                    ? { x: target.x, y: target.y }
                    : { x: target.x + tW / 2, y: target.y + tH / 2 };


                // Edge Intersection Points
                const startPoint = isOrbView
                    ? getRectIntersection(sourceCenter.x, sourceCenter.y, sW, sH, targetCenter.x, targetCenter.y)
                    : getRectIntersection(sourceCenter.x, sourceCenter.y, sW, sH, targetCenter.x, targetCenter.y);

                if (isOrbView) {
                    const angle = Math.atan2(targetCenter.y - sourceCenter.y, targetCenter.x - sourceCenter.x);
                    startPoint.x = sourceCenter.x + Math.cos(angle) * (sR! + 2);
                    startPoint.y = sourceCenter.y + Math.sin(angle) * (sR! + 2);
                }

                const endPoint = isOrbView
                    ? { x: targetCenter.x, y: targetCenter.y }
                    : getRectIntersection(targetCenter.x, targetCenter.y, tW, tH, sourceCenter.x, sourceCenter.y);

                if (isOrbView) {
                    const angle = Math.atan2(sourceCenter.y - targetCenter.y, sourceCenter.x - targetCenter.x);
                    endPoint.x = targetCenter.x + Math.cos(angle) * (tR! + 2);
                    endPoint.y = targetCenter.y + Math.sin(angle) * (tR! + 2);
                }

                // Control Points & Midpoint
                let controlX, controlY, midPoint, tangentX, tangentY;

                if (isStraight) {
                    controlX = (startPoint.x + endPoint.x) / 2;
                    controlY = (startPoint.y + endPoint.y) / 2;
                    midPoint = { x: controlX, y: controlY };

                    // Tangent for straight line is the line itself
                    tangentX = endPoint.x - startPoint.x;
                    tangentY = endPoint.y - startPoint.y;

                } else {
                    // Curved Logic
                    const dx = endPoint.x - startPoint.x;
                    const dy = endPoint.y - startPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const curvature = Math.min(distance * 0.2, 80);

                    controlX = (startPoint.x + endPoint.x) / 2 + dy / distance * curvature;
                    controlY = (startPoint.y + endPoint.y) / 2 - dx / distance * curvature;

                    midPoint = getBezierPoint(0.5, startPoint, { x: controlX, y: controlY }, endPoint);

                    // Tangent at end for arrow: 2(P2 - P1)
                    tangentX = endPoint.x - controlX;
                    tangentY = endPoint.y - controlY;
                }

                // Arrow Angle (Used for manual head in previous iteration, relying on Konva Arrow component now)

                // Points array depends on shape.
                const points = isStraight
                    ? [startPoint.x, startPoint.y, endPoint.x, endPoint.y]
                    : [startPoint.x, startPoint.y, controlX, controlY, endPoint.x, endPoint.y];

                return (
                    <React.Fragment key={link.id}>
                        {/* Interactive Hit Area */}
                        <Line
                            name="link-hit-area"
                            id={`link-${link.id}`}
                            points={points}
                            stroke="transparent"
                            strokeWidth={25}
                            tension={isStraight ? 0 : 0.5}
                            bezier={!isStraight}
                            onMouseEnter={() => setHoveredLink(link.id)}
                            onMouseLeave={() => setHoveredLink(null)}
                            onContextMenu={(e) => {
                                e.cancelBubble = true;
                                onLinkContextMenu(e, link.id);
                            }}
                        />

                        {/* Glow effect */}
                        {isHovered && (
                            <Line
                                points={points}
                                stroke={linkColor}
                                strokeWidth={6}
                                opacity={0.3}
                                tension={isStraight ? 0 : 0.5}
                                bezier={!isStraight}
                                listening={false}
                            />
                        )}

                        {/* Main Link & Arrow using single component */}
                        <Arrow
                            name="animated-link"
                            points={points}
                            pointerAtBeginning={showStartArrow}
                            pointerAtEnding={showEndArrow}
                            fill={linkColor}
                            stroke={linkColor}
                            strokeWidth={isHovered ? 2.5 : 1.5}
                            pointerLength={10}
                            pointerWidth={10}
                            tension={isStraight ? 0 : 0.5}
                            bezier={!isStraight}
                            opacity={isHovered ? 1 : 0.9}
                            dash={dashPattern}
                            listening={false}
                        />

                        {/* Link Label */}
                        {(labelText && (showLabels || isHovered)) && (
                            <Group x={midPoint.x} y={midPoint.y} listening={false}>
                                <Rect
                                    x={-24}
                                    y={-10}
                                    width={48}
                                    height={20}
                                    fill={linkColor}
                                    cornerRadius={10}
                                    opacity={isHovered ? 1 : 0.9}
                                    shadowColor="black"
                                    shadowBlur={4}
                                    shadowOpacity={0.2}
                                />
                                <Text
                                    x={-24}
                                    y={-6}
                                    width={48}
                                    text={labelText}
                                    align="center"
                                    fill="white"
                                    fontSize={10}
                                    fontStyle="bold"
                                />
                            </Group>
                        )}
                    </React.Fragment>
                );
            })}
        </Group>
    );
};
