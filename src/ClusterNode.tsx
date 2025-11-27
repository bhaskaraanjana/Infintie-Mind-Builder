import React, { useState } from 'react';
import { Group, Circle, Text, Rect } from 'react-konva';
import type { Cluster, Note } from './types';

interface Props {
    cluster: Cluster;
    scale: number;
    notes: Record<string, Note>;
    updateClusterPosition: (id: string, x: number, y: number) => void;
}

export const ClusterNode: React.FC<Props> = ({ cluster, scale, notes, updateClusterPosition }) => {
    const [hover, setHover] = useState(false);

    const childrenNotes = cluster.children.map(id => notes[id]).filter(Boolean);
    if (childrenNotes.length === 0) return null;

    const minX = Math.min(...childrenNotes.map(n => n.x));
    const maxX = Math.max(...childrenNotes.map(n => n.x));
    const minY = Math.min(...childrenNotes.map(n => n.y));
    const maxY = Math.max(...childrenNotes.map(n => n.y));

    const width = maxX - minX + 350;
    const height = maxY - minY + 250;

    // LEVEL 1: Far Out View - Glowing Hub
    if (scale < 0.4) {
        return (
            <Group
                x={cluster.x}
                y={cluster.y}
                name={`cluster-${cluster.id}`}
                draggable
                onDragEnd={(e) => updateClusterPosition(cluster.id, e.target.x(), e.target.y())}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Outer glow */}
                <Circle
                    radius={120}
                    fill={cluster.color}
                    opacity={0.1}
                    listening={false}
                />
                {/* Main circle */}
                <Circle
                    radius={100}
                    fill={cluster.color}
                    opacity={hover ? 0.7 : 0.5}
                    shadowColor={cluster.color}
                    shadowBlur={hover ? 30 : 20}
                    shadowOpacity={0.6}
                />
                {/* Title */}
                <Text
                    text={cluster.title}
                    fontSize={40}
                    fontStyle="bold"
                    fill="#fff"
                    align="center"
                    width={200}
                    offsetX={100}
                    offsetY={20}
                    listening={false}
                />
                {/* Count */}
                <Text
                    text={`${childrenNotes.length} notes`}
                    fontSize={24}
                    fill="#eee"
                    align="center"
                    width={200}
                    offsetX={100}
                    offsetY={-20}
                    listening={false}
                />
            </Group>
        );
    }

    // LEVEL 2: Close View - Glassmorphic Container
    return (
        <Group
            x={cluster.x}
            y={cluster.y}
            name={`cluster-${cluster.id}`}
            draggable
            onDragEnd={(e) => updateClusterPosition(cluster.id, e.target.x(), e.target.y())}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Shadow layer */}
            <Rect
                x={minX - cluster.x - 50}
                y={minY - cluster.y - 44}
                width={width}
                height={height}
                fill="rgba(0,0,0,0.08)"
                cornerRadius={24}
                blur={12}
                listening={false}
            />
            {/* Main glassmorphic container */}
            <Rect
                x={minX - cluster.x - 50}
                y={minY - cluster.y - 50}
                width={width}
                height={height}
                fill={`${cluster.color}15`} // Very transparent fill
                stroke={cluster.color}
                strokeWidth={hover ? 5 : 3}
                dash={[15, 8]}
                cornerRadius={24}
                shadowColor={cluster.color}
                shadowBlur={hover ? 25 : 15}
                shadowOpacity={0.3}
                opacity={hover ? 1 : 0.8}
            />
            {/* Inner glow effect */}
            <Rect
                x={minX - cluster.x - 48}
                y={minY - cluster.y - 48}
                width={width - 4}
                height={height - 4}
                stroke={cluster.color}
                strokeWidth={1}
                cornerRadius={22}
                opacity={0.4}
                listening={false}
            />
            {/* Label badge */}
            <Group x={minX - cluster.x - 50} y={minY - cluster.y - 100}>
                {/* Badge shadow */}
                <Rect
                    y={3}
                    width={Math.min(cluster.title.length * 16 + 40, 300)}
                    height={50}
                    fill="rgba(0,0,0,0.1)"
                    cornerRadius={25}
                    blur={8}
                    listening={false}
                />
                {/* Badge background */}
                <Rect
                    width={Math.min(cluster.title.length * 16 + 40, 300)}
                    height={50}
                    fill={cluster.color}
                    cornerRadius={25}
                    shadowColor="black"
                    shadowBlur={hover ? 15 : 10}
                    shadowOpacity={0.25}
                    opacity={hover ? 1 : 0.95}
                />
                {/* Badge title */}
                <Text
                    text={cluster.title}
                    fontSize={22}
                    fontStyle="bold"
                    fill="#fff"
                    padding={15}
                    align="center"
                    verticalAlign="middle"
                    width={Math.min(cluster.title.length * 16 + 40, 300)}
                    height={50}
                    listening={false}
                />
                {/* Badge icon/dot */}
                <Circle
                    x={10}
                    y={25}
                    radius={5}
                    fill="#fff"
                    opacity={0.8}
                    listening={false}
                />
            </Group>
        </Group>
    );
};
