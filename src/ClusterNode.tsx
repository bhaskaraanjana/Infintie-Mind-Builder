import React, { useState } from 'react';
import { Group, Circle, Text, Rect, Arc } from 'react-konva';
import type { Cluster, Note } from './types';
import { themes, type ThemeName } from './themes';

interface Props {
    cluster: Cluster;
    scale: number;
    notes: Record<string, Note>;
    updateClusterPosition: (id: string, x: number, y: number) => void;
    themeName: ThemeName;
}

export const ClusterNode: React.FC<Props> = ({ cluster, scale, notes, updateClusterPosition, themeName }) => {
    const [hover, setHover] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const theme = themes[themeName];

    const childrenNotes = cluster.children.map(id => notes[id]).filter(Boolean);
    if (childrenNotes.length === 0) return null;

    const minX = Math.min(...childrenNotes.map(n => n.x));
    const maxX = Math.max(...childrenNotes.map(n => n.x));
    const minY = Math.min(...childrenNotes.map(n => n.y));
    const maxY = Math.max(...childrenNotes.map(n => n.y));

    const width = maxX - minX + 350;
    const height = maxY - minY + 250;

    // LEVEL 1: Far Out View - "The Orb"
    if (scale < 0.4) {
        return (
            <Group
                x={cluster.x}
                y={cluster.y}
                name={`cluster-${cluster.id}`}
                draggable
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(e) => {
                    setIsDragging(false);
                    updateClusterPosition(cluster.id, e.target.x(), e.target.y());
                }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Orbit Ring */}
                <Circle
                    radius={hover || isDragging ? 160 : 130}
                    stroke={cluster.color}
                    strokeWidth={2}
                    opacity={hover || isDragging ? 0.6 : 0.3}
                    dash={[10, 10]}
                    rotation={45}
                    listening={false}
                />

                {/* Outer Glow */}
                <Circle
                    radius={hover || isDragging ? 140 : 110}
                    fill={cluster.color}
                    opacity={isDragging ? 0.2 : 0.1}
                    listening={false}
                />

                {/* Main Planet Body */}
                <Circle
                    radius={90}
                    fill={cluster.color}
                    opacity={hover || isDragging ? 0.9 : 0.8}
                    shadowColor={cluster.color}
                    shadowBlur={hover || isDragging ? 40 : 20}
                    shadowOpacity={0.5}
                />

                {/* Title */}
                <Text
                    text={cluster.title}
                    fontSize={36}
                    fontStyle="bold"
                    fill={theme.colors.text}
                    align="center"
                    width={300}
                    offsetX={150}
                    offsetY={15}
                    listening={false}
                    shadowColor="black"
                    shadowBlur={10}
                    shadowOpacity={0.5}
                />

                {/* Count */}
                <Text
                    text={`${childrenNotes.length} notes`}
                    fontSize={20}
                    fill={theme.colors.textSecondary}
                    align="center"
                    width={200}
                    offsetX={100}
                    offsetY={-25}
                    listening={false}
                    opacity={0.9}
                />

                {/* Drag indicator */}
                {isDragging && (
                    <Text
                        text="Moving..."
                        fontSize={18}
                        fill={theme.colors.text}
                        align="center"
                        width={200}
                        offsetX={100}
                        y={130}
                        opacity={0.8}
                        listening={false}
                    />
                )}
            </Group>
        );
    }

    // LEVEL 2: Close View - "The Zone"
    return (
        <Group
            x={cluster.x}
            y={cluster.y}
            name={`cluster-${cluster.id}`}
            draggable
            onDragStart={() => setIsDragging(true)}
            onDragEnd={(e) => {
                setIsDragging(false);
                updateClusterPosition(cluster.id, e.target.x(), e.target.y());
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Main Container */}
            <Rect
                x={minX - cluster.x - 50}
                y={minY - cluster.y - 50}
                width={width}
                height={height}
                fill={`${cluster.color}0D`} // Very low opacity fill (approx 5%)
                stroke={cluster.color}
                strokeWidth={hover || isDragging ? 3 : 2}
                cornerRadius={32}
                shadowColor={cluster.color}
                shadowBlur={hover || isDragging ? 30 : 0}
                shadowOpacity={0.15}
                dash={isDragging ? [10, 10] : undefined}
            />

            {/* Tab Label Group */}
            <Group x={minX - cluster.x - 50} y={minY - cluster.y - 50}>
                {/* Tab Background */}
                <Rect
                    width={Math.min(cluster.title.length * 14 + 60, 300)}
                    height={44}
                    fill={cluster.color}
                    cornerRadius={[32, 16, 16, 0]} // Top-left, Top-right, Bottom-right, Bottom-left
                    opacity={hover || isDragging ? 1 : 0.9}
                    shadowColor="black"
                    shadowBlur={10}
                    shadowOpacity={0.2}
                />

                {/* Tab Title */}
                <Text
                    text={cluster.title}
                    x={20}
                    y={12}
                    fontSize={18}
                    fontStyle="bold"
                    fill={theme.name === 'light' ? '#fff' : theme.colors.text}
                    listening={false}
                />
            </Group>

            {/* Dragging Feedback */}
            {isDragging && (
                <Text
                    text="Dragging Cluster"
                    x={minX - cluster.x}
                    y={maxY - cluster.y + 30}
                    width={width}
                    align="center"
                    fontSize={16}
                    fill={theme.colors.text}
                    opacity={0.7}
                    listening={false}
                />
            )}
        </Group>
    );
};
