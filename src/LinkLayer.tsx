import React, { useEffect, useRef } from 'react';
import { Line, Arrow, Group, Text, Rect } from 'react-konva';
import Konva from 'konva';
import { useStore } from './store';
import type { Note, Link, Cluster } from './types';
import { NOTE_WIDTH, NOTE_HEIGHT, ORB_RADIUS_DEFAULT, ORB_RADIUS_HUB } from './constants';

interface Props {
    notes: Record<string, Note>;
    clusters: Record<string, Cluster>;
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

const getClusterBounds = (cluster: Cluster, notes: Record<string, Note>) => {
    const children = cluster.children.map(id => notes[id]).filter(Boolean);
    if (children.length === 0) return { x: cluster.x, y: cluster.y, width: 200, height: 200 };

    const xs = children.map(n => n.x);
    const ys = children.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Padding matches ClusterNode implementation
    return {
        x: minX - 50,
        y: minY - 50,
        width: maxX - minX + 350,
        height: maxY - minY + 250
    };
};

export const LinkLayer: React.FC<Props> = ({ notes, clusters, links, onLinkContextMenu, scale }) => {
    const ui = useStore((state) => state.ui);
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

    const isOrbView = ui.lodMode === 'orb' || (ui.lodMode === 'auto' && scale < 0.8);
    // Show labels if scale is high enough or hovered
    const showLabels = scale > 0.6;

    return (
        <Group ref={layerRef}>
            {Object.values(links).map((link) => {
                const sourceNote = notes[link.sourceId];
                const sourceCluster = clusters[link.sourceId];
                const targetNote = notes[link.targetId];
                const targetCluster = clusters[link.targetId];

                const source = sourceNote || sourceCluster;
                const target = targetNote || targetCluster;

                if (!source || !target) return null;

                const isSourceCluster = !!sourceCluster;
                const isTargetCluster = !!targetCluster;

                const isHovered = hoveredLink === link.id;

                // --- Style Resolution ---
                let linkColor = link.color;
                if (!linkColor) {
                    linkColor = DEFAULT_COLORS[link.type as keyof typeof DEFAULT_COLORS] || DEFAULT_COLORS.default;
                }

                const labelText = link.label || "";

                let dashPattern: number[] | undefined = undefined;
                if (link.style === 'dashed') dashPattern = [10, 10];
                else if (link.style === 'dotted') dashPattern = [3, 5];
                else if (!link.style && link.type === 'criticism') dashPattern = [8, 4];

                const isStraight = link.shape === 'straight';

                const arrowDirection = link.arrowDirection || 'forward';
                const showEndArrow = arrowDirection === 'forward';
                const showStartArrow = arrowDirection === 'reverse';


                // --- Geometry Calculation ---
                let sW = 0, sH = 0, tW = 0, tH = 0, sR = 0, tR = 0;
                let sourceCenter = { x: 0, y: 0 };
                let targetCenter = { x: 0, y: 0 };

                // Source Geometry
                if (isSourceCluster) {
                    if (isOrbView) {
                        sR = 90;
                        sourceCenter = { x: source.x, y: source.y };
                    } else {
                        const bounds = getClusterBounds(source as unknown as Cluster, notes);
                        sW = bounds.width;
                        sH = bounds.height;
                        sourceCenter = { x: bounds.x + sW / 2, y: bounds.y + sH / 2 };
                    }
                } else {
                    if (isOrbView) {
                        sR = (source as Note).type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT;
                        sourceCenter = { x: source.x, y: source.y };
                    } else {
                        sW = NOTE_WIDTH;
                        sH = NOTE_HEIGHT;
                        sourceCenter = { x: source.x + sW / 2, y: source.y + sH / 2 };
                    }
                }

                // Target Geometry
                if (isTargetCluster) {
                    if (isOrbView) {
                        tR = 90;
                        targetCenter = { x: target.x, y: target.y };
                    } else {
                        const bounds = getClusterBounds(target as unknown as Cluster, notes);
                        tW = bounds.width;
                        tH = bounds.height;
                        targetCenter = { x: bounds.x + tW / 2, y: bounds.y + tH / 2 };
                    }
                } else {
                    if (isOrbView) {
                        tR = (target as Note).type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT;
                        targetCenter = { x: target.x, y: target.y };
                    } else {
                        tW = NOTE_WIDTH;
                        tH = NOTE_HEIGHT;
                        targetCenter = { x: target.x + tW / 2, y: target.y + tH / 2 };
                    }
                }

                // Edge Intersection Points
                let startPoint = { x: 0, y: 0 };
                if (isOrbView) {
                    const angle = Math.atan2(targetCenter.y - sourceCenter.y, targetCenter.x - sourceCenter.x);
                    const radius = sR || ((source as Note).type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT);
                    startPoint.x = sourceCenter.x + Math.cos(angle) * (radius + 2);
                    startPoint.y = sourceCenter.y + Math.sin(angle) * (radius + 2);
                } else {
                    startPoint = getRectIntersection(sourceCenter.x, sourceCenter.y, sW, sH, targetCenter.x, targetCenter.y);
                }

                let endPoint = { x: 0, y: 0 };
                if (isOrbView) {
                    const angle = Math.atan2(sourceCenter.y - targetCenter.y, sourceCenter.x - targetCenter.x);
                    const radius = tR || ((target as Note).type === 'hub' ? ORB_RADIUS_HUB : ORB_RADIUS_DEFAULT);
                    endPoint.x = targetCenter.x + Math.cos(angle) * (radius + 2);
                    endPoint.y = targetCenter.y + Math.sin(angle) * (radius + 2);
                } else {
                    endPoint = getRectIntersection(targetCenter.x, targetCenter.y, tW, tH, sourceCenter.x, sourceCenter.y);
                }

                // Control Points & Midpoint
                let controlX, controlY, midPoint;

                if (isStraight) {
                    controlX = (startPoint.x + endPoint.x) / 2;
                    controlY = (startPoint.y + endPoint.y) / 2;
                    midPoint = { x: controlX, y: controlY };
                } else {
                    const dx = endPoint.x - startPoint.x;
                    const dy = endPoint.y - startPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const curvature = Math.min(distance * 0.2, 80);

                    controlX = (startPoint.x + endPoint.x) / 2 + dy / distance * curvature;
                    controlY = (startPoint.y + endPoint.y) / 2 - dx / distance * curvature;

                    midPoint = getBezierPoint(0.5, startPoint, { x: controlX, y: controlY }, endPoint);
                }

                // Points array
                const points = isStraight
                    ? [startPoint.x, startPoint.y, endPoint.x, endPoint.y]
                    : [startPoint.x, startPoint.y, controlX, controlY, endPoint.x, endPoint.y];

                const isClusterLink = isSourceCluster || isTargetCluster;
                const baseStroke = isClusterLink ? 4 : 1.5;
                const hoverStroke = isClusterLink ? 6 : 2.5;

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
                                strokeWidth={hoverStroke * 2}
                                opacity={0.3}
                                tension={isStraight ? 0 : 0.5}
                                bezier={!isStraight}
                                listening={false}
                            />
                        )}

                        {/* Main Link & Arrow */}
                        <Arrow
                            name="animated-link"
                            points={points}
                            pointerAtBeginning={showStartArrow}
                            pointerAtEnding={showEndArrow}
                            fill={linkColor}
                            stroke={linkColor}
                            strokeWidth={isHovered ? hoverStroke : baseStroke}
                            pointerLength={isClusterLink ? 15 : 10}
                            pointerWidth={isClusterLink ? 15 : 10}
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
