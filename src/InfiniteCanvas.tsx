import { useRef, useMemo, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useStore } from './store';
import { NoteNode } from './NoteNode';
import { ClusterNode } from './ClusterNode';
import { ContextMenu } from './ContextMenu';
import type { MenuOption } from './ContextMenu';
import { LinkLayer } from './LinkLayer';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Note } from './types';

export const InfiniteCanvas = () => {
    const viewport = useStore((state) => state.viewport);
    const setViewport = useStore((state) => state.setViewport);
    const notes = useStore((state) => state.notes);
    const clusters = useStore((state) => state.clusters);
    const links = useStore((state) => state.links);
    const selectedTags = useStore((state) => state.selectedTags);
    const addNote = useStore((state) => state.addNote);
    const updateNote = useStore((state) => state.updateNote);
    const deleteNote = useStore((state) => state.deleteNote);
    const createCluster = useStore((state) => state.createCluster);
    const deleteCluster = useStore((state) => state.deleteCluster);
    const addToCluster = useStore((state) => state.addToCluster);
    const updateCluster = useStore((state) => state.updateCluster);
    const addLink = useStore((state) => state.addLink);
    const deleteLink = useStore((state) => state.deleteLink);
    const updateLink = useStore((state) => state.updateLink);
    const updateNotePosition = useStore((state) => state.updateNotePosition);
    const setEditingNoteId = useStore((state) => state.setEditingNoteId);
    const updateClusterPosition = useStore((state) => state.updateClusterPosition);
    const theme = useStore((state) => state.theme);

    const stageRef = useRef<any>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; options: MenuOption[] } | null>(null);

    // Linking State
    const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();
        setContextMenu(null);

        const scaleBy = 1.1;
        const stage = stageRef.current;
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

        // Limit zoom
        if (newScale < 0.05 || newScale > 5) return;

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setViewport({ x: newPos.x, y: newPos.y, scale: newScale });
    };

    const handleStageDblClick = (e: KonvaEventObject<MouseEvent>) => {
        console.log('Double click detected', e.target);
        // Prevent creating note if clicking on existing note
        if (e.target !== e.target.getStage()) {
            console.log('Clicked on non-stage element', e.target);
            return;
        }

        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX();
        const x = (pointer.x - stage.x()) / scale;
        const y = (pointer.y - stage.y()) / scale;

        console.log('Adding note at', x, y);
        addNote({
            type: 'fleeting',
            x,
            y,
            title: 'New Thought',
            content: 'Double-click to edit...',
            tags: [],
            references: []
        });
    };

    const handleLinkContextMenu = (e: any, linkId: string) => {
        e.evt.preventDefault();
        const options: MenuOption[] = [
            {
                label: 'Change Type',
                submenu: [
                    { label: 'Related', action: () => updateLink(linkId, { type: 'related' }) },
                    { label: 'Parent', action: () => updateLink(linkId, { type: 'parent' }) },
                    { label: 'Criticism', action: () => updateLink(linkId, { type: 'criticism' }) },
                ]
            },
            {
                label: 'Delete Link',
                action: () => deleteLink(linkId),
                danger: true
            }
        ];

        setContextMenu({
            x: e.evt.clientX,
            y: e.evt.clientY,
            options
        });
    };

    const handleContextMenu = (e: KonvaEventObject<PointerEvent>) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        // Determine what was clicked
        const target = e.target;
        const noteGroup = target.findAncestor((node: any) => node.name() && node.name().startsWith('note-'));
        const clusterGroup = target.findAncestor((node: any) => node.name() && node.name().startsWith('cluster-'));

        const options: MenuOption[] = [];

        if (noteGroup) {
            const noteId = noteGroup.name().replace('note-', '');

            // Assign to Cluster Submenu
            const clusterOptions: MenuOption[] = Object.values(clusters).map(c => ({
                label: c.title,
                action: () => addToCluster(c.id, [noteId])
            }));

            // Note Type Submenu
            const typeOptions: MenuOption[] = [
                { label: 'Fleeting (Gold)', action: () => updateNote(noteId, { type: 'fleeting' }) },
                { label: 'Literature (Blue)', action: () => updateNote(noteId, { type: 'literature' }) },
                { label: 'Permanent (Green)', action: () => updateNote(noteId, { type: 'permanent' }) },
                { label: 'Hub (Purple)', action: () => updateNote(noteId, { type: 'hub' }) },
            ];

            options.push({
                label: 'Create Cluster',
                action: () => createCluster([noteId], 'New Cluster')
            });

            if (clusterOptions.length > 0) {
                options.push({
                    label: 'Assign to Cluster',
                    submenu: clusterOptions
                });
            }

            options.push({
                label: 'Change Type',
                submenu: typeOptions
            });

            options.push({
                label: 'Delete Note',
                action: () => deleteNote(noteId),
                danger: true
            });
        } else if (clusterGroup) {
            const clusterId = clusterGroup.name().replace('cluster-', '');

            options.push({
                label: 'Rename Cluster',
                action: () => {
                    const newTitle = window.prompt('Enter new cluster name:', clusters[clusterId]?.title);
                    if (newTitle) updateCluster(clusterId, { title: newTitle });
                }
            });

            options.push({
                label: 'Change Color',
                submenu: [
                    { label: 'Gold', action: () => updateCluster(clusterId, { color: '#FFD700' }) },
                    { label: 'Blue', action: () => updateCluster(clusterId, { color: '#87CEEB' }) },
                    { label: 'Green', action: () => updateCluster(clusterId, { color: '#90EE90' }) },
                    { label: 'Purple', action: () => updateCluster(clusterId, { color: '#DDA0DD' }) },
                    { label: 'Red', action: () => updateCluster(clusterId, { color: '#FF6B6B' }) },
                ]
            });

            options.push({
                label: 'Delete Cluster',
                action: () => deleteCluster(clusterId),
                danger: true
            });
        } else {
            // Canvas clicked
            const scale = stage.scaleX();
            const x = (pointer.x - stage.x()) / scale;
            const y = (pointer.y - stage.y()) / scale;

            options.push({
                label: 'Create Note Here',
                action: () => addNote({
                    type: 'fleeting',
                    x,
                    y,
                    title: 'New Thought',
                    content: 'Double-click to edit...',
                    tags: [],
                    references: []
                })
            });

            options.push({
                label: 'Create Hub Note',
                action: () => addNote({
                    type: 'hub',
                    x,
                    y,
                    title: 'Central Hub',
                    content: 'A central point for connecting ideas.',
                    tags: ['hub'],
                    references: []
                })
            });

            options.push({
                label: 'Reset View',
                action: () => setViewport({ x: 0, y: 0, scale: 1 })
            });
        }

        setContextMenu({
            x: e.evt.clientX,
            y: e.evt.clientY,
            options
        });
    };

    const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        if (e.evt.shiftKey) {
            const target = e.target;
            const noteGroup = target.findAncestor((node: any) => node.name() && node.name().startsWith('note-'));
            if (noteGroup) {
                const noteId = noteGroup.name().replace('note-', '');
                setLinkingSourceId(noteId);

                // Prevent dragging the note
                noteGroup.draggable(false);
            }
        }
    };

    const handleMouseMove = () => {
        if (linkingSourceId) {
            const stage = stageRef.current;
            const pointer = stage.getPointerPosition();
            if (pointer) {
                const scale = stage.scaleX();
                setMousePos({
                    x: (pointer.x - stage.x()) / scale,
                    y: (pointer.y - stage.y()) / scale
                });
            }
        }
    };

    const handleMouseUp = (e: KonvaEventObject<MouseEvent>) => {
        if (linkingSourceId) {
            const target = e.target;
            const noteGroup = target.findAncestor((node: any) => node.name() && node.name().startsWith('note-'));

            if (noteGroup) {
                const targetId = noteGroup.name().replace('note-', '');
                if (targetId !== linkingSourceId) {
                    addLink(linkingSourceId, targetId);
                }
            }

            // Reset draggable
            const stage = stageRef.current;
            const sourceNode = stage.findOne(`.note-${linkingSourceId}`);
            if (sourceNode) {
                sourceNode.draggable(true);
            }

            // Also try finding by name directly if class selector fails
            const sourceGroup = stage.findOne((n: any) => n.name() === `note-${linkingSourceId}`);
            if (sourceGroup) sourceGroup.draggable(true);

            setLinkingSourceId(null);
            setMousePos(null);
        }
    };

    const visibleNotes = useMemo(() => {
        const buffer = 500;
        const visibleLeft = -viewport.x / viewport.scale - buffer;
        const visibleTop = -viewport.y / viewport.scale - buffer;
        const visibleRight = (window.innerWidth - viewport.x) / viewport.scale + buffer;
        const visibleBottom = (window.innerHeight - viewport.y) / viewport.scale + buffer;

        return Object.values(notes).filter((note: Note) => {
            // Tag filtering
            if (selectedTags && selectedTags.length > 0) {
                const hasTag = note.tags && note.tags.some(tag => selectedTags.includes(tag));
                if (!hasTag) return false;
            }

            return note.x >= visibleLeft &&
                note.x <= visibleRight &&
                note.y >= visibleTop &&
                note.y <= visibleBottom;
        });
    }, [notes, viewport, selectedTags]);

    return (
        <>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable
                onWheel={handleWheel}
                onDblClick={handleStageDblClick}
                onContextMenu={handleContextMenu}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onClick={() => setContextMenu(null)}
                scaleX={viewport.scale}
                scaleY={viewport.scale}
                x={viewport.x}
                y={viewport.y}
                onDragEnd={(e) => {
                    if (e.target === stageRef.current) {
                        setViewport({ x: e.target.x(), y: e.target.y() });
                    }
                }}
                ref={stageRef}
                style={{ backgroundColor: 'var(--theme-canvas-bg)' }}
            >
                <Layer>
                    {Object.values(clusters).map((cluster) => (
                        <ClusterNode
                            key={cluster.id}
                            cluster={cluster}
                            scale={viewport.scale}
                            notes={notes}
                            updateClusterPosition={updateClusterPosition}
                            themeName={theme}
                        />
                    ))}

                    <LinkLayer notes={notes} links={links} onLinkContextMenu={handleLinkContextMenu} />

                    {linkingSourceId && mousePos && notes[linkingSourceId] && (
                        <Line
                            points={[
                                notes[linkingSourceId].x,
                                notes[linkingSourceId].y,
                                mousePos.x,
                                mousePos.y
                            ]}
                            stroke="#FFD700"
                            strokeWidth={2}
                            dash={[10, 5]}
                        />
                    )}

                    {visibleNotes.map((note) => (
                        <NoteNode
                            key={note.id}
                            note={note}
                            scale={viewport.scale}
                            updateNotePosition={updateNotePosition}
                            setEditingNoteId={setEditingNoteId}
                            themeName={theme}
                        />
                    ))}
                </Layer>
            </Stage>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    options={contextMenu.options}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </>
    );
};