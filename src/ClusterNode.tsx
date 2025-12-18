import React, { useState, useEffect, useRef } from 'react';
import { Group, Circle, Text, Rect, Line } from 'react-konva';
import Konva from 'konva';
import type { Cluster, Note } from './types';
import { themes, type ThemeName } from './themes';

interface Props {
    cluster: Cluster;
    scale: number;
    notes: Record<string, Note>;
    updateClusterPosition: (id: string, x: number, y: number) => void;
    themeName: ThemeName;
}

import { useStore } from './store';

export const ClusterNode: React.FC<Props> = ({ cluster, scale, notes, updateClusterPosition, themeName }) => {
    const [hover, setHover] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const theme = themes[themeName];
    const ui = useStore((state) => state.ui); // Reactive state access

    // Animation Ref
    const connectionsRef = useRef<Konva.Group>(null);

    // Animate Connections (Inward Flow)
    useEffect(() => {
        const group = connectionsRef.current;
        if (!group) return;

        // We need the layer to start animation, but if the group isn't attached yet it might fail?
        // Usually safe in useEffect.
        const layer = group.getLayer();
        if (!layer) return;

        const anim = new Konva.Animation((frame) => {
            if (!frame) return;
            // Speed: pixels per second
            // Positive offset moves dash pattern "backwards" relative to line direction (Start->End)
            // Line is drawn Cluster(0,0) -> Note.
            // "Inward" means moving Note -> Cluster.
            // So we want the pattern to move from End to Start.
            // Increasing offset usually moves pattern towards Start.
            const speed = 30;
            const dashOffset = (frame.time / 1000) * speed;

            group.children.forEach((node) => {
                if (node instanceof Konva.Line) {
                    node.dashOffset(-dashOffset); // Try negative for outward, positive for inward? 
                    // Actually, let's try strict test. 
                    // If I draw -> and increase offset, the pattern slides ->. 
                    // Wait, offset shifts the texture.
                    // Let's stick with one direction; if user says it's wrong, we flip sign.
                    // "Inward flowing" -> Towards Center.
                    // Line: Center -> Note. 
                    // Movement: Note -> Center. (Upstream).

                    // If I subtract offset, it moves forward? 
                    // Let's use Positive time-based accumulation.
                    node.dashOffset(dashOffset);
                }
            });
        }, layer);

        anim.start();
        return () => {
            anim.stop();
        };
    }, []);

    const childrenNotes = cluster.children.map(id => notes[id]).filter(Boolean);
    if (childrenNotes.length === 0) return null;

    const minX = Math.min(...childrenNotes.map(n => n.x));
    const maxX = Math.max(...childrenNotes.map(n => n.x));
    const minY = Math.min(...childrenNotes.map(n => n.y));
    const maxY = Math.max(...childrenNotes.map(n => n.y));

    const width = maxX - minX + 350;
    const height = maxY - minY + 250;

    const isOrbView = ui.lodMode === 'orb' || (ui.lodMode === 'auto' && scale < 0.8);

    // LEVEL 1: Far Out View - "The Orb"
    if (isOrbView) {
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
                {/* Connections to notes (Animated) */}
                <Group ref={connectionsRef}>
                    {childrenNotes.map(note => (
                        <Line
                            key={`link-${cluster.id}-${note.id}`}
                            points={[0, 0, note.x - cluster.x, note.y - cluster.y]}
                            stroke={cluster.color}
                            strokeWidth={1.5}
                            opacity={0.6}
                            dash={[10, 10]}
                            listening={false}
                        />
                    ))}
                </Group>

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
                    opacity={hover || isDragging ? 0.3 : 0.2}
                    shadowColor={cluster.color}
                    shadowBlur={hover || isDragging ? 40 : 20}
                    shadowOpacity={0.3}
                />

                {/* Title */}
                <Text
                    text={cluster.title}
                    fontSize={36}
                    fontStyle="bold"
                    fill={theme.colors.text}
                    align="center"
                    width={400}
                    offsetX={200}
                    offsetY={18}
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
