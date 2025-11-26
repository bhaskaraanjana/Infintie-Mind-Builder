import React from 'react';
import { Line } from 'react-konva';
import type { Note, Link } from './types';

interface Props {
    notes: Record<string, Note>;
    links: Record<string, Link>;
    onLinkContextMenu: (e: any, linkId: string) => void;
}

export const LinkLayer: React.FC<Props> = ({ notes, links, onLinkContextMenu }) => {

    return (
        <>
            {Object.values(links).map((link) => {
                const source = notes[link.sourceId];
                const target = notes[link.targetId];

                if (!source || !target) return null;

                return (
                    <Line
                        key={link.id}
                        points={[source.x, source.y, target.x, target.y]}
                        stroke="#ccc"
                        strokeWidth={2}
                        hitStrokeWidth={20} // Easier to click
                        tension={0}
                        opacity={0.6}
                        onContextMenu={(e) => {
                            e.cancelBubble = true;
                            onLinkContextMenu(e, link.id);
                        }}
                    />
                );
            })}
        </>
    );
};
