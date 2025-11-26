import React from 'react';
import { Group, Rect, Text, Circle } from 'react-konva';
import type { Note } from './types';

interface Props {
    note: Note;
    scale: number; // Current zoom level
    updateNotePosition: (id: string, x: number, y: number) => void;
    setEditingNoteId: (id: string | null) => void;
}

const COLORS = {
    fleeting: '#FFD700',   // Gold
    literature: '#87CEEB', // Sky Blue
    permanent: '#90EE90',  // Light Green
    hub: '#D8BFD8'         // Thistle Purple
};

export const NoteNode: React.FC<Props> = ({ note, scale, updateNotePosition, setEditingNoteId }) => {
    const handleDblClick = (e: any) => {
        e.cancelBubble = true;
        setEditingNoteId(note.id);
    };

    // LEVEL 1: Universe View (Just dots)
    if (scale < 0.2) {
        return (
            <Circle
                x={note.x}
                y={note.y}
                radius={40} // Make them large enough to see from space
                fill={COLORS[note.type]}
                opacity={0.8}
                onClick={handleDblClick}
            />
        );
    }

    // LEVEL 2: Cluster View (Title + Tags)
    if (scale < 0.6) {
        const hasTags = note.tags && note.tags.length > 0;
        const cardHeight = hasTags ? 60 : 40;

        return (
            <Group
                x={note.x}
                y={note.y}
                name={`note-${note.id}`}
                draggable
                onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
                onDblClick={handleDblClick}
            >
                <Rect
                    width={200}
                    height={cardHeight}
                    fill="#FFFFFF"
                    stroke={COLORS[note.type]}
                    strokeWidth={2}
                    cornerRadius={5}
                    shadowColor="black"
                    shadowBlur={5}
                    shadowOpacity={0.1}
                />
                <Text
                    text={note.title}
                    fill="#333"
                    fontSize={14}
                    x={10}
                    y={8}
                    width={180}
                    ellipsis={true}
                    listening={false} // Let clicks pass to Group
                />
                {/* Tags for collapsed view */}
                {hasTags && (
                    <>
                        {note.tags!.slice(0, 3).map((tag, idx) => (
                            <React.Fragment key={`${tag}-${idx}`}>
                                <Rect
                                    x={10 + idx * 60}
                                    y={32}
                                    width={55}
                                    height={18}
                                    fill="#e3f2fd"
                                    cornerRadius={3}
                                    listening={false}
                                />
                                <Text
                                    x={10 + idx * 60}
                                    y={35}
                                    text={tag.length > 7 ? tag.substring(0, 6) + '…' : tag}
                                    fill="#1976d2"
                                    fontSize={10}
                                    width={55}
                                    align="center"
                                    listening={false}
                                />
                            </React.Fragment>
                        ))}
                        {note.tags!.length > 3 && (
                            <Text
                                x={10 + 3 * 60}
                                y={36}
                                text={`+${note.tags!.length - 3}`}
                                fill="#666"
                                fontSize={9}
                                listening={false}
                            />
                        )}
                    </>
                )}
            </Group>
        );
    }

    // LEVEL 3: Detail View (Full Content + Tags)
    const hasTags = note.tags && note.tags.length > 0;

    return (
        <Group
            x={note.x}
            y={note.y}
            name={`note-${note.id}`}
            draggable
            onDragEnd={(e) => updateNotePosition(note.id, e.target.x(), e.target.y())}
            onDblClick={handleDblClick}
        >
            <Rect
                width={300}
                height={180}
                fill="#FFFFFF"
                stroke={COLORS[note.type]}
                strokeWidth={1}
                cornerRadius={8}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.1}
                shadowOffset={{ x: 5, y: 5 }}
            />
            {/* Header */}
            <Rect width={300} height={40} fill={COLORS[note.type]} opacity={0.2} cornerRadius={[8, 8, 0, 0]} listening={false} />

            <Text
                x={15} y={12}
                text={note.title}
                fill="#333"
                fontSize={18}
                fontStyle="bold"
                width={270}
                ellipsis={true}
                listening={false}
            />

            {/* Tags for expanded view */}
            {hasTags && (
                <>
                    {note.tags!.slice(0, 3).map((tag, idx) => (
                        <React.Fragment key={`${tag}-${idx}`}>
                            <Rect
                                x={15 + idx * 88}
                                y={45}
                                width={85}
                                height={20}
                                fill="#e3f2fd"
                                cornerRadius={3}
                                listening={false}
                            />
                            <Text
                                x={15 + idx * 88}
                                y={48}
                                text={tag.length > 12 ? tag.substring(0, 11) + '…' : tag}
                                fill="#1976d2"
                                fontSize={11}
                                width={85}
                                align="center"
                                listening={false}
                            />
                        </React.Fragment>
                    ))}
                    {note.tags!.length > 3 && (
                        <Text
                            x={15 + 3 * 88}
                            y={50}
                            text={`+${note.tags!.length - 3} more`}
                            fill="#666"
                            fontSize={10}
                            listening={false}
                        />
                    )}
                </>
            )}

            <Text
                x={15}
                y={hasTags ? 72 : 55}
                text={note.content}
                fill="#555"
                fontSize={14}
                width={270}
                height={hasTags ? 93 : 110}
                lineHeight={1.4}
                ellipsis={true}
                listening={false}
            />
        </Group>
    );
};