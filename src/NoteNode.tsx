import React, { useState } from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import type { Note } from './types';
import { themes, type ThemeName } from './themes';
import { useStore } from './store';

interface Props {
    note: Note;
    scale: number;
    updateNotePosition: (id: string, x: number, y: number) => void;
    onDragStart?: (id: string, x: number, y: number) => void;
    onDragMove?: (id: string, x: number, y: number) => void;
    setEditingNoteId: (id: string | null) => void;
    themeName: ThemeName;
    isLinking?: boolean;
    onNoteClick?: (id: string) => void;
}

export const NoteNode: React.FC<Props> = ({ note, scale, updateNotePosition, onDragStart, onDragMove, setEditingNoteId, themeName, isLinking, onNoteClick }) => {
    const [hover, setHover] = useState(false);
    const theme = themes[themeName];
    const ui = useStore((state) => state.ui); // Reactive state access
    const editingNoteId = useStore((state) => state.editingNoteId);
    const selectionMode = useStore((state) => state.selectionMode);
    const selectedNoteIds = useStore((state) => state.selectedNoteIds);
    const toggleNoteSelection = useStore((state) => state.toggleNoteSelection);
    const isEditing = editingNoteId === note.id;
    const isSelected = selectedNoteIds.includes(note.id);

    // Fallback if theme or color is missing
    const getNoteColor = (t: typeof theme, type: string) => {
        const c = t.colors[type as keyof typeof t.colors];
        if (c && typeof c === 'object' && 'main' in c) return c;
        return t.colors.fleeting;
    };
    const noteColor = getNoteColor(theme, note.type);

    const colorScheme = {
        main: noteColor.main,
        glow: `${noteColor.main}40`
    };

    const handleClick = (e: any) => {
        // Only allow left click (button 0)
        if (e.evt.button !== 0) return;

        e.cancelBubble = true;
        if (selectionMode) {
            toggleNoteSelection(note.id);
        } else if (isLinking) {
            onNoteClick?.(note.id);
        } else {
            setEditingNoteId(note.id);
        }
    };

    const handleDblClick = (e: any) => {
        e.cancelBubble = true;
        setEditingNoteId(note.id);
    };

    const isOrbView = ui.lodMode === 'orb' || (ui.lodMode === 'auto' && scale < 1.2);

    // LEVEL 1 & 2: Far and Medium View - Obsidian Style Dots with Labels
    if (isOrbView) {
        const dotSize = note.type === 'hub' ? 12 : 8;
        const glowSize = hover ? dotSize + 8 : dotSize + 4;
        const showLabel = ui.showOrbLabels || hover || isEditing || isSelected;
        const showDetails = ui.showOrbDetails || hover || isEditing || isSelected;

        return (
            <Group
                name={`note-${note.id}`}
                x={note.x}
                y={note.y}
                draggable
                onDragStart={(e) => onDragStart?.(note.id, e.target.x(), e.target.y())}
                onDragMove={(e) => onDragMove?.(note.id, e.target.x(), e.target.y())}
                onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
                onClick={handleClick}
                onTap={handleClick}
                onDblClick={handleDblClick}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Editing Indicator Ring */}
                {isEditing && (
                    <Circle
                        radius={glowSize + 4}
                        stroke={theme.colors.text}
                        strokeWidth={1}
                        dash={[4, 4]}
                        listening={false}
                        opacity={0.6}
                    />
                )}
                {/* Selection Indicator Ring */}
                {isSelected && (
                    <Circle
                        radius={glowSize + 4}
                        stroke="#00a1ff"
                        strokeWidth={2}
                        listening={false}
                        opacity={0.8}
                    />
                )}
                {/* Outer glow */}
                <Circle
                    radius={glowSize}
                    fill={colorScheme.glow}
                    opacity={hover || isEditing ? 0.4 : 0.25}
                    listening={false}
                />
                {/* Main dot */}
                <Circle
                    radius={dotSize}
                    fill={colorScheme.main}
                    shadowColor={colorScheme.main}
                    shadowBlur={hover || isEditing ? 15 : 8}
                    shadowOpacity={0.6}
                />
                {/* Floating text label */}
                <Text
                    text={note.title}
                    fill={theme.colors.text}
                    fontSize={11}
                    fontStyle={note.type === 'hub' ? 'bold' : 'normal'}
                    x={dotSize + 8}
                    y={-6}
                    opacity={showLabel ? 1 : 0}
                    listening={false}
                />
                {/* Small preview text on hover or toggle */}
                {showDetails && note.content && (
                    <Text
                        text={note.content.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...'}
                        fill={theme.colors.text}
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
    // Strip HTML tags for preview
    const plainTextContent = (note.content || '').replace(/<[^>]*>?/gm, '');
    const contentPreview = plainTextContent.substring(0, 100);
    const cardHeight = 140;

    const cardColorScheme = {
        main: noteColor.main,
        light: `${noteColor.main}20`, // Use 20% opacity as light variant
        dark: noteColor.main // Use main as dark variant
    };

    return (
        <Group
            name={`note-${note.id}`}
            x={note.x}
            y={note.y}
            draggable
            onDragStart={(e) => onDragStart?.(note.id, e.target.x(), e.target.y())}
            onDragMove={(e) => onDragMove?.(note.id, e.target.x(), e.target.y())}
            onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
            onClick={handleClick}
            onTap={handleClick}
            onDblClick={handleDblClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Editing Selection Glow */}
            {isEditing && (
                <Rect
                    y={-4}
                    x={-4}
                    width={288}
                    height={cardHeight + 8}
                    stroke={theme.colors.text}
                    strokeWidth={1}
                    dash={[6, 6]}
                    cornerRadius={20}
                    opacity={0.5}
                    listening={false}
                />
            )}
            {/* Selection Glow */}
            {isSelected && (
                <Rect
                    y={-4}
                    x={-4}
                    width={288}
                    height={cardHeight + 8}
                    stroke="#00a1ff"
                    strokeWidth={2}
                    cornerRadius={20}
                    opacity={0.8}
                    listening={false}
                />
            )}
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
                fill={theme.colors.canvasBg}
                cornerRadius={16}
                shadowColor={isEditing ? "black" : "black"}
                shadowBlur={hover || isEditing ? 25 : 12}
                shadowOpacity={hover || isEditing ? 0.4 : 0.2}
                shadowOffsetY={hover || isEditing ? 10 : 4}
            />
            <Rect
                width={280}
                height={cardHeight}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: cardHeight }}
                fillLinearGradientColorStops={[0, cardColorScheme.light, 0.3, theme.colors.canvasBg, 1, theme.colors.canvasBg]}
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
                fill={theme.colors.text}
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
                    text={contentPreview + (note.content && note.content.length > 100 ? '...' : '')}
                    fill={theme.colors.text}
                    fontSize={13}
                    lineHeight={1.4}
                    x={20}
                    y={45}
                    width={250}
                    height={50}
                    ellipsis={true}
                    listening={false}
                    opacity={0.8}
                />
            )}
            {note.type === 'literature' && note.source && (
                <Text
                    text={`Ref: ${note.source}`}
                    fill={theme.colors.text}
                    fontSize={10}
                    fontStyle="italic"
                    x={20}
                    y={95}
                    width={250}
                    ellipsis={true}
                    listening={false}
                    opacity={0.6}
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