import React, { useState } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import type { Note } from './types';

interface Props {
    note: Note;
    scale: number;
    updateNotePosition: (id: string, x: number, y: number) => void;
    setEditingNoteId: (id: string | null) => void;
}

const COLORS = {
    fleeting: { main: '#FFD700', glow: '#FFD70040' },
    literature: { main: '#4FC3F7', glow: '#4FC3F740' },  // Cyan blue like Obsidian
    permanent: { main: '#81C784', glow: '#81C78440' },
    hub: { main: '#64B5F6', glow: '#64B5F640' }  // Brighter blue for hubs
};

export const NoteNode: React.FC<Props> = ({ note, scale, updateNotePosition, setEditingNoteId }) => {
    const [hover, setHover] = useState(false);
    const colorScheme = COLORS[note.type];

    const handleDblClick = (e: any) => {
        e.cancelBubble = true;
        setEditingNoteId(note.id);
    };

    // LEVEL 1 & 2: Far and Medium View - Obsidian Style Dots with Labels
    if (scale < 0.8) {
        const dotSize = note.type === 'hub' ? 12 : 8;
        const glowSize = hover ? dotSize + 8 : dotSize + 4;

        return (
            <Group
                x={note.x}
                y={note.y}
                draggable
                onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
                onDblClick={handleDblClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Outer glow */}
                <Circle
                    radius={glowSize}
                    fill={colorScheme.glow}
                    opacity={hover ? 0.4 : 0.25}
                    listening={false}
                />
                {/* Main dot */}
                <Circle
                    radius={dotSize}
                    fill={colorScheme.main}
                    shadowColor={colorScheme.main}
                    shadowBlur={hover ? 15 : 8}
                    shadowOpacity={0.6}
                />
                {/* Floating text label */}
                <Text
                    text={note.title}
                    fill="#E0E0E0"
                    fontSize={11}
                    fontStyle={note.type === 'hub' ? 'bold' : 'normal'}
                    x={dotSize + 8}
                    y={-6}
                    opacity={hover ? 1 : 0.85}
                    listening={false}
                />
                {/* Small preview text on hover */}
                {hover && note.content && (
                    <Text
                        text={note.content.substring(0, 50) + '...'}
                        fill="#999"
                        fontSize={9}
                        x={dotSize + 8}
                        y={8}
                        width={150}
                        opacity={0.7}
                        listening={false}
                    />
                )}
            </Group>
        );
    }

    // LEVEL 3: Close View - Full Card (keep existing design)
    const hasTags = note.tags && note.tags.length > 0;
    const contentPreview = note.content.substring(0, 100);
    const cardHeight = 140;
    const cardColorScheme = {
        fleeting: { main: '#FFD700', light: '#FFF9E6', dark: '#CC9900' },
        literature: { main: '#87CEEB', light: '#E6F7FF', dark: '#5BA3C7' },
        permanent: { main: '#90EE90', light: '#E6FFE6', dark: '#6BC46B' },
        hub: { main: '#D8BFD8', light: '#F5E6FF', dark: '#B896B8' }
    }[note.type];

    return (
        <Group
            x={note.x}
            y={note.y}
            name={`note-${note.id}`}
            draggable
            onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
            onDblClick={handleDblClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Shadow layers */}
            <Rect
                y={6}
                width={280}
                height={cardHeight}
                fill="rgba(0,0,0,0.04)"
                cornerRadius={16}
                blur={12}
                listening={false}
            />
            <Rect
                y={3}
                width={280}
                height={cardHeight}
                fill="rgba(0,0,0,0.06)"
                cornerRadius={16}
                blur={6}
                listening={false}
            />
            <Rect
                width={280}
                height={cardHeight}
                fill="white"
                cornerRadius={16}
                shadowColor="black"
                shadowBlur={hover ? 20 : 12}
                shadowOpacity={hover ? 0.3 : 0.2}
                shadowOffsetY={hover ? 8 : 4}
            />
            <Rect
                width={280}
                height={cardHeight}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: cardHeight }}
                fillLinearGradientColorStops={[0, cardColorScheme.light, 0.3, 'rgba(255,255,255,0.95)', 1, 'white']}
                cornerRadius={16}
                opacity={0.6}
                listening={false}
            />
            <Rect
                width={6}
                height={cardHeight}
                fill={cardColorScheme.main}
                cornerRadius={[16, 0, 0, 16]}
                shadowColor={cardColorScheme.main}
                shadowBlur={hover ? 8 : 4}
                shadowOpacity={0.4}
                listening={false}
            />
            <Circle
                x={265}
                y={15}
                radius={6}
                fill={cardColorScheme.main}
                listening={false}
            />
            <Text
                text={note.title}
                fill="#171717"
                fontSize={18}
                fontStyle="bold"
                x={20}
                y={15}
                width={235}
                ellipsis={true}
                listening={false}
            />
            {contentPreview && (
                <Text
                    text={contentPreview + (note.content.length > 100 ? '...' : '')}
                    fill="#525252"
                    fontSize={13}
                    lineHeight={1.4}
                    x={20}
                    y={45}
                    width={250}
                    height={50}
                    ellipsis={true}
                    listening={false}
                />
            )}
            {hasTags && (
                <>
                    {note.tags!.slice(0, 4).map((tag, idx) => (
                        <React.Fragment key={`${tag}-${idx}`}>
                            <Rect
                                x={20 + idx * 62}
                                y={110}
                                width={58}
                                height={24}
                                fill={cardColorScheme.light}
                                cornerRadius={12}
                                strokeWidth={1}
                                stroke={cardColorScheme.main}
                                opacity={0.9}
                                listening={false}
                            />
                            <Text
                                x={20 + idx * 62}
                                y={115}
                                text={`#${tag.length > 7 ? tag.substring(0, 6) + '…' : tag}`}
                                fill={cardColorScheme.dark}
                                fontSize={11}
                                fontStyle="600"
                                width={58}
                                align="center"
                                listening={false}
                            />
                        </React.Fragment>
                    ))}
                    {note.tags!.length > 4 && (
                        <>
                            <Rect
                                x={20 + 4 * 62}
                                y={110}
                                width={35}
                                height={24}
                                fill={cardColorScheme.light}
                                cornerRadius={12}
                                strokeWidth={1}
                                stroke={cardColorScheme.main}
                                opacity={0.9}
                                listening={false}
                            />
                            <Text
                                x={20 + 4 * 62}
                                y={115}
                                text={`+${note.tags!.length - 4}`}
                                fill={cardColorScheme.dark}
                                fontSize={11}
                                fontStyle="600"
                                width={35}
                                align="center"
                                listening={false}
                            />
                        </>
                    )}
                </>
            )}
        </Group>
    );
};