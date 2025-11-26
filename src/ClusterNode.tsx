import React from 'react';
import { Group, Circle, Text, Rect } from 'react-konva';
import type { Cluster, Note } from './types';

interface Props {
    cluster: Cluster;
    scale: number;
    notes: Record<string, Note>;
    updateClusterPosition: (id: string, x: number, y: number) => void;
}

export const ClusterNode: React.FC<Props> = ({ cluster, scale, notes, updateClusterPosition }) => {

    // Calculate bounds based on children
    const childrenNotes = cluster.children.map(id => notes[id]).filter(Boolean);

    if (childrenNotes.length === 0) return null;

    // Calculate bounding box
    const minX = Math.min(...childrenNotes.map(n => n.x));
    const maxX = Math.max(...childrenNotes.map(n => n.x));
    const minY = Math.min(...childrenNotes.map(n => n.y));
    const maxY = Math.max(...childrenNotes.map(n => n.y));

    const width = maxX - minX + 350; // Add padding + note width
    const height = maxY - minY + 250; // Add padding + note height

    // LEVEL 1: Hub View (Zoomed Out)
    if (scale < 0.4) {
        return (
            <Group
                x={cluster.x}
                y={cluster.y}
                name={`cluster-${cluster.id}`}
                draggable
                onDragEnd={(e) => updateClusterPosition(cluster.id, e.target.x(), e.target.y())}
            >
                <Circle
                    radius={100}
                    fill={cluster.color}
                    opacity={0.6}
                    shadowColor="black"
                    shadowBlur={20}
                    shadowOpacity={0.5}
                />
                <Text
                    text={cluster.title}
                    fontSize={40}
                    fontStyle="bold"
                    fill="#fff"
                    align="center"
                    width={200}
                    offsetX={100}
                    offsetY={20}
                />
                <Text
                    text={`${childrenNotes.length} notes`}
                    fontSize={24}
                    fill="#eee"
                    align="center"
                    width={200}
                    offsetX={100}
                    offsetY={-20}
                />
            </Group>
        );
    }

    // LEVEL 2: Boundary View (Zoomed In)
    return (
        <Group
            x={cluster.x}
            y={cluster.y}
            name={`cluster-${cluster.id}`}
            draggable
            onDragEnd={(e) => updateClusterPosition(cluster.id, e.target.x(), e.target.y())}
        >
            {/* Boundary */}
            <Rect
                x={minX - cluster.x - 50} // Relative to group 
                y={minY - cluster.y - 50}
                width={width}
                height={height}
                stroke={cluster.color}
                strokeWidth={4}
                dash={[20, 10]}
                cornerRadius={20}
                fill={cluster.color}
                opacity={0.1}
            />

            {/* Label */}
            <Group x={minX - cluster.x - 50} y={minY - cluster.y - 100}>
                <Rect
                    width={300}
                    height={50}
                    fill={cluster.color}
                    cornerRadius={10}
                />
                <Text
                    text={cluster.title}
                    fontSize={24}
                    fontStyle="bold"
                    fill="#fff"
                    padding={10}
                />
            </Group>
        </Group>
    );
};
