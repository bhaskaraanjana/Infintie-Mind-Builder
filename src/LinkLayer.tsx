import React, { useState } from 'react';
import { Line, Arrow } from 'react-konva';
import type { Note, Link } from './types';

interface Props {
    notes: Record<string, Note>;
    links: Record<string, Link>;
    onLinkContextMenu: (e: any, linkId: string) => void;
}

const LINK_COLORS = {
    related: { start: '#60A5FA', end: '#3B82F6' },      // Blue gradient
    parent: { start: '#4ADE80', end: '#22C55E' },       // Green gradient
    criticism: { start: '#F87171', end: '#EF4444' }     // Red gradient
};

export const LinkLayer: React.FC<Props> = ({ notes, links, onLinkContextMenu }) => {
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    return (
        <>
            {Object.values(links).map((link) => {
                const source = notes[link.sourceId];
                const target = notes[link.targetId];

                if (!source || !target) return null;

                const isHovered = hoveredLink === link.id;
                const linkType = link.type || 'related';
                const colors = LINK_COLORS[linkType as keyof typeof LINK_COLORS] || LINK_COLORS.related;

                // Calculate control points for curve
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Curve intensity based on distance
                const curvature = Math.min(distance * 0.3, 100);

                // Control point perpendicular to line
                const controlX = (source.x + target.x) / 2 + dy / distance * curvature;
                const controlY = (source.y + target.y) / 2 - dx / distance * curvature;

                return (
                    <React.Fragment key={link.id}>
                        {/* Glow effect when hovered */}
                        {isHovered && (
                            <Line
                                points={[
                                    source.x,
                                    source.y,
                                    controlX,
                                    controlY,
                                    target.x,
                                    target.y
                                ]}
                                stroke={colors.end}
                                strokeWidth={8}
                                opacity={0.2}
                                tension={0.5}
                                bezier={true}
                                shadowColor={colors.end}
                                shadowBlur={15}
                                shadowOpacity={0.5}
                                listening={false}
                            />
                        )}
                        {/* Main curved link */}
                        <Line
                            points={[
                                source.x,
                                source.y,
                                controlX,
                                controlY,
                                target.x,
                                target.y
                            ]}
                            stroke={isHovered ? colors.end : colors.start}
                            strokeWidth={isHovered ? 3 : 2}
                            tension={0.5}
                            bezier={true}
                            opacity={isHovered ? 0.9 : 0.6}
                            dash={linkType === 'criticism' ? [8, 4] : undefined}
                            hitStrokeWidth={20}
                            onMouseEnter={() => setHoveredLink(link.id)}
                            onMouseLeave={() => setHoveredLink(null)}
                            onContextMenu={(e) => {
                                e.cancelBubble = true;
                                onLinkContextMenu(e, link.id);
                            }}
                        />
                        {/* Arrow head at target */}
                        <Arrow
                            points={[
                                target.x - (dx / distance) * 30,
                                target.y - (dy / distance) * 30,
                                target.x - (dx / distance) * 5,
                                target.y - (dy / distance) * 5
                            ]}
                            fill={isHovered ? colors.end : colors.start}
                            stroke={isHovered ? colors.end : colors.start}
                            strokeWidth={isHovered ? 3 : 2}
                            pointerLength={8}
                            pointerWidth={8}
                            opacity={isHovered ? 0.9 : 0.6}
                            listening={false}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};
