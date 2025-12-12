import { useRef, useMemo, useState, useEffect } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useStore } from './store';
import { useLongPress } from './hooks/useLongPress';
import { triggerHaptic } from './utils/haptics';
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

    // Selection State
    const selectionMode = useStore((state) => state.selectionMode);
    const selectedNoteIds = useStore((state) => state.selectedNoteIds);
    const setSelectedNoteIds = useStore((state) => state.setSelectedNoteIds);
    const deleteNotes = useStore((state) => state.deleteNotes);
    const updateNotesPosition = useStore((state) => state.updateNotesPosition);
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, width: number, height: number } | null>(null);

    // Linking State
    const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
    const linkingIdRef = useRef<string | null>(null); // This one is for linkingSourceId
    useEffect(() => { linkingIdRef.current = linkingSourceId; }, [linkingSourceId]);

    const [mousePos, setMousePos] = useState<{ x: number, y: number } | null>(null);

    // Refs for gestures
    const lastDistRef = useRef<number>(0);
    const lastCenterRef = useRef<{ x: number, y: number } | null>(null);
    const dragStartRef = useRef<{ startX: number, startY: number, noteId: string, selectionSnapshot: Record<string, { x: number, y: number }> } | null>(null);
    // Removed unused linkingDragRef
    const ignoreClickRef = useRef(false); // To prevent click after long press
    const editingNoteId = useStore((state) => state.editingNoteId); // Get editing state

    // Global Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if editing a note (let text editor handle keys)
            // Also ignore if any input/textarea is focused (e.g. search bar)
            const activeElement = document.activeElement;
            const isInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA' || activeElement?.getAttribute('contenteditable') === 'true';

            if (editingNoteId || isInput) return;

            // Delete Selection
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedNoteIds.length > 0) {
                    e.preventDefault();
                    if (window.confirm(`Delete ${selectedNoteIds.length} selected notes?`)) {
                        deleteNotes(selectedNoteIds);
                        setSelectedNoteIds([]);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [editingNoteId, selectedNoteIds, deleteNotes, setSelectedNoteIds]);

    const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    const getCenter = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
        };
    };

    const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
        const touch1 = e.evt.touches[0];
        const touch2 = e.evt.touches[1];

        if (touch1 && touch2) {
            e.evt.preventDefault();
            const stage = stageRef.current;
            stage.draggable(false); // Disable drag during zoom
            if (stage.isDragging()) {
                stage.stopDrag();
            }

            const p1 = { x: touch1.clientX, y: touch1.clientY };
            const p2 = { x: touch2.clientX, y: touch2.clientY };

            if (!lastCenterRef.current) {
                lastCenterRef.current = getCenter(p1, p2);
                return;
            }

            const newCenter = getCenter(p1, p2);
            const dist = getDistance(p1, p2);

            if (!lastDistRef.current) {
                lastDistRef.current = dist;
            }

            const pointTo = {
                x: (newCenter.x - stage.x()) / stage.scaleX(),
                y: (newCenter.y - stage.y()) / stage.scaleX(),
            };

            let scale = stage.scaleX() * (dist / lastDistRef.current);
            // Limit zoom
            if (scale < 0.05) scale = 0.05;
            if (scale > 5) scale = 5;

            const dx = newCenter.x - lastCenterRef.current.x;
            const dy = newCenter.y - lastCenterRef.current.y;

            const newPos = {
                x: newCenter.x - pointTo.x * scale + dx,
                y: newCenter.y - pointTo.y * scale + dy,
            };

            // Update refs immediately for next frame
            lastDistRef.current = dist;
            lastCenterRef.current = newCenter;

            // Direct update for performance, verified via setViewport on end
            stage.scale({ x: scale, y: scale });
            stage.position(newPos);
            stage.batchDraw();
        }
    };

    const handleTouchEnd = () => {
        lastDistRef.current = 0;
        lastCenterRef.current = null;

        // Sync state
        const stage = stageRef.current;
        if (stage) {
            setViewport({
                x: stage.x(),
                y: stage.y(),
                scale: stage.scaleX()
            });
            // Re-enable dragging if it was stopped
            stage.draggable(true);
        }
    };

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
        triggerHaptic('medium');
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

    // Selection Logic
    const handleSelectionStart = (pos: { x: number, y: number }) => {
        if (!selectionMode) return;
        const stage = stageRef.current;
        const scale = stage.scaleX();
        const x = (pos.x - stage.x()) / scale;
        const y = (pos.y - stage.y()) / scale;
        setSelectionBox({ startX: x, startY: y, width: 0, height: 0 });
    };

    const handleSelectionMove = (pos: { x: number, y: number }) => {
        if (!selectionBox) return;
        const stage = stageRef.current;
        const scale = stage.scaleX();
        const x = (pos.x - stage.x()) / scale;
        const y = (pos.y - stage.y()) / scale;

        setSelectionBox(prev => ({
            ...prev!,
            width: x - prev!.startX,
            height: y - prev!.startY
        }));
    };

    const handleSelectionEnd = () => {
        if (!selectionBox) return;

        // Normalize box (width/height can be negative)
        const box = {
            x: Math.min(selectionBox.startX, selectionBox.startX + selectionBox.width),
            y: Math.min(selectionBox.startY, selectionBox.startY + selectionBox.height),
            width: Math.abs(selectionBox.width),
            height: Math.abs(selectionBox.height)
        };

        // Find intersecting notes
        const selectedIds: string[] = [];
        Object.values(notes).forEach(note => {
            if (
                note.x >= box.x &&
                note.x <= box.x + box.width &&
                note.y >= box.y &&
                note.y <= box.y + box.height
            ) {
                selectedIds.push(note.id);
            }
        });

        setSelectedNoteIds(selectedIds);
        setSelectionBox(null);
    };

    const handleLinkContextMenu = (e: any, linkId: string) => {
        e.evt.preventDefault();
        const link = links[linkId];
        const options: MenuOption[] = [];

        // 1. Link Type
        options.push({
            label: 'Link Type',
            submenu: [
                {
                    label: 'Solid',
                    action: () => updateLink(linkId, { style: 'solid', arrowDirection: 'none' })
                },
                {
                    label: 'Dashed',
                    action: () => updateLink(linkId, { style: 'dashed', arrowDirection: 'none' })
                },
                {
                    label: 'Dotted',
                    action: () => updateLink(linkId, { style: 'dotted', arrowDirection: 'none' })
                },
                {
                    label: 'Arrow',
                    action: () => updateLink(linkId, { style: 'solid', arrowDirection: 'forward' })
                }
            ]
        });

        // 2. Link Shape
        options.push({
            label: 'Link Shape',
            submenu: [
                { label: 'Curved', action: () => updateLink(linkId, { shape: 'curved' }) },
                { label: 'Straight', action: () => updateLink(linkId, { shape: 'straight' }) }
            ]
        });

        // 3. Arrow Actions (Conditional)
        if (link.arrowDirection && link.arrowDirection !== 'none') {
            options.push({
                label: 'Flip Arrow',
                action: () => {
                    const newDir = link.arrowDirection === 'forward' ? 'reverse' : 'forward';
                    updateLink(linkId, { arrowDirection: newDir });
                }
            });

            options.push({
                label: 'Remove Arrow',
                action: () => updateLink(linkId, { arrowDirection: 'none' })
            });
        }

        // Retained Options (Color, Label)
        options.push({
            label: 'Color',
            submenu: [
                { label: 'Blue', action: () => updateLink(linkId, { color: '#3B82F6' }) },
                { label: 'Green', action: () => updateLink(linkId, { color: '#22C55E' }) },
                { label: 'Red', action: () => updateLink(linkId, { color: '#EF4444' }) },
                { label: 'Gray', action: () => updateLink(linkId, { color: '#9CA3AF' }) },
                { label: 'Gold', action: () => updateLink(linkId, { color: '#EAB308' }) },
            ]
        });

        options.push({
            label: 'Edit Label',
            action: () => {
                const newLabel = window.prompt("Enter link label:", link.label || "");
                if (newLabel !== null) {
                    updateLink(linkId, { label: newLabel });
                }
            }
        });

        // 4. Delete Link
        options.push({
            label: 'Delete Link',
            action: () => deleteLink(linkId),
            danger: true
        });

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

            options.push({ label: 'Link to note', action: () => setLinkingSourceId(noteId) });

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
                if (linkingIdRef.current && targetId !== linkingIdRef.current) {
                    addLink(linkingIdRef.current, targetId);
                    triggerHaptic('success');
                    linkingIdRef.current = null; // Prevent double firing
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

    // Batch Dragging State


    const handleNoteDragStart = (id: string, x: number, y: number) => {
        // Only trigger batch drag if the dragged note is part of the selection
        if (selectedNoteIds.includes(id)) {
            const snapshot: Record<string, { x: number, y: number }> = {};
            selectedNoteIds.forEach(selectedId => {
                if (notes[selectedId]) {
                    snapshot[selectedId] = { x: notes[selectedId].x, y: notes[selectedId].y };
                }
            });
            dragStartRef.current = {
                noteId: id,
                startX: x,
                startY: y,
                selectionSnapshot: snapshot
            };
        } else {
            dragStartRef.current = null;
        }
    };

    const updateNotesPositionTransient = useStore((state) => state.updateNotesPositionTransient);

    const handleNoteDragMove = (id: string, x: number, y: number) => {
        // Batch Drag
        if (dragStartRef.current && dragStartRef.current.noteId === id) {
            const { startX, startY, selectionSnapshot } = dragStartRef.current;
            const deltaX = x - startX;
            const deltaY = y - startY;

            const updates = selectedNoteIds.map(selectedId => {
                const initialPos = selectionSnapshot[selectedId];
                if (selectedId === id) return { id, x, y };
                if (initialPos) {
                    return {
                        id: selectedId,
                        x: initialPos.x + deltaX,
                        y: initialPos.y + deltaY
                    };
                }
                return null;
            }).filter(Boolean) as { id: string, x: number, y: number }[];

            updateNotesPositionTransient(updates);
        } else {
            // Single Drag (Transient update for smooth cluster recentering)
            updateNotesPositionTransient([{ id, x, y }]);
        }
    };

    const handleNoteDragEnd = (id: string, x: number, y: number) => {
        if (dragStartRef.current && dragStartRef.current.noteId === id) {
            // Commit batch update
            const { startX, startY, selectionSnapshot } = dragStartRef.current;
            const deltaX = x - startX;
            const deltaY = y - startY;

            const updates = selectedNoteIds.map(selectedId => {
                const initialPos = selectionSnapshot[selectedId];
                // For the dragged note itself, use current x/y (which theoretically is initial + delta, but exact from event is safer)
                if (selectedId === id) return { id, x, y };

                if (initialPos) {
                    return {
                        id: selectedId,
                        x: initialPos.x + deltaX,
                        y: initialPos.y + deltaY
                    };
                }
                return null;
            }).filter(Boolean) as { id: string, x: number, y: number }[];

            updateNotesPosition(updates);
            dragStartRef.current = null;
        } else {
            // Standard single note update
            updateNotePosition(id, x, y);
        }
    };

    const handleNoteClick = (id: string) => {
        if (linkingIdRef.current && linkingIdRef.current !== id) {
            addLink(linkingIdRef.current, id);
            linkingIdRef.current = null;
            setLinkingSourceId(null);
        } else if (linkingSourceId === id) {
            // Cancel if clicking source
            setLinkingSourceId(null);
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

    // Long Press Logic
    const {
        onTouchStart: onLongPressTouchStart,
        onTouchMove: onLongPressTouchMove,
        onTouchEnd: onLongPressTouchEnd,
        onMouseDown: onLongPressMouseDown,
        onMouseMove: onLongPressMouseMove,
        onMouseUp: onLongPressMouseUp,
        cancel: cancelLongPress
    } = useLongPress({
        onLongPress: (e) => {
            ignoreClickRef.current = true; // Prevent subsequent click/tap handling
            // Context Menu Logic
            const stage = stageRef.current;
            if (!stage) return;

            const pointerPos = stage.getPointerPosition();
            if (!pointerPos) return;

            const shape = stage.getIntersection(pointerPos);
            const target = shape || stage;

            // Determine if Note or Cluster or Link
            const noteGroup = target.findAncestor?.((node: any) => node.name() && node.name().startsWith('note-'))
                || (target.name()?.startsWith('note-') ? target : null);

            const clusterGroup = target.findAncestor?.((node: any) => node.name() && node.name().startsWith('cluster-'))
                || (target.name()?.startsWith('cluster-') ? target : null);

            // Check for link hit area
            const linkHitLine = target.name() === 'link-hit-area' ? target : null;

            const options: MenuOption[] = [];
            if (linkHitLine) {
                const linkId = linkHitLine.id().replace('link-', '');
                const link = links[linkId];

                // 1. Link Type
                options.push({
                    label: 'Link Type',
                    submenu: [
                        {
                            label: 'Solid',
                            action: () => updateLink(linkId, { style: 'solid', arrowDirection: 'none' })
                        },
                        {
                            label: 'Dashed',
                            action: () => updateLink(linkId, { style: 'dashed', arrowDirection: 'none' })
                        },
                        {
                            label: 'Dotted',
                            action: () => updateLink(linkId, { style: 'dotted', arrowDirection: 'none' })
                        },
                        {
                            label: 'Arrow',
                            action: () => updateLink(linkId, { style: 'solid', arrowDirection: 'forward' })
                        }
                    ]
                });

                // 2. Link Shape
                options.push({
                    label: 'Link Shape',
                    submenu: [
                        { label: 'Curved', action: () => updateLink(linkId, { shape: 'curved' }) },
                        { label: 'Straight', action: () => updateLink(linkId, { shape: 'straight' }) }
                    ]
                });

                // 3. Arrow Actions (Conditional)
                const arrowDir = link.arrowDirection || 'forward'; // Default for check
                // Note: 'Arrow' type sets it to forward. 'Solid/Dashed/Dotted' set it to 'none'.
                // If it is NOT none, we show these options.
                if (link.arrowDirection && link.arrowDirection !== 'none') {
                    options.push({
                        label: 'Flip Arrow',
                        action: () => {
                            const newDir = link.arrowDirection === 'forward' ? 'reverse' : 'forward';
                            updateLink(linkId, { arrowDirection: newDir });
                        }
                    });

                    options.push({
                        label: 'Remove Arrow',
                        action: () => updateLink(linkId, { arrowDirection: 'none' })
                    });
                }

                // Retained Options (Color, Label)
                options.push({
                    label: 'Color',
                    submenu: [
                        { label: 'Blue', action: () => updateLink(linkId, { color: '#3B82F6' }) },
                        { label: 'Green', action: () => updateLink(linkId, { color: '#22C55E' }) },
                        { label: 'Red', action: () => updateLink(linkId, { color: '#EF4444' }) },
                        { label: 'Gray', action: () => updateLink(linkId, { color: '#9CA3AF' }) },
                        { label: 'Gold', action: () => updateLink(linkId, { color: '#EAB308' }) },
                    ]
                });

                options.push({
                    label: 'Edit Label',
                    action: () => {
                        const newLabel = window.prompt("Enter link label:", link.label || "");
                        if (newLabel !== null) {
                            updateLink(linkId, { label: newLabel });
                        }
                    }
                });

                // 4. Delete Link
                options.push({
                    label: 'Delete Link',
                    action: () => deleteLink(linkId),
                    danger: true
                });
            } else if (noteGroup) {
                const noteId = noteGroup.name().replace('note-', '');

                // Note Options
                const clusterOptions = Object.values(clusters).map(c => ({
                    label: c.title,
                    action: () => addToCluster(c.id, [noteId])
                }));

                const typeOptions = [
                    { label: 'Fleeting (Gold)', action: () => updateNote(noteId, { type: 'fleeting' }) },
                    { label: 'Literature (Blue)', action: () => updateNote(noteId, { type: 'literature' }) },
                    { label: 'Permanent (Green)', action: () => updateNote(noteId, { type: 'permanent' }) },
                    { label: 'Hub (Purple)', action: () => updateNote(noteId, { type: 'hub' }) },
                ];

                options.push({ label: 'Link to note', action: () => setLinkingSourceId(noteId) });
                options.push({ label: 'Create Cluster', action: () => createCluster([noteId], 'New Cluster') });
                if (clusterOptions.length > 0) options.push({ label: 'Assign to Cluster', submenu: clusterOptions });
                options.push({ label: 'Change Type', submenu: typeOptions });
                options.push({ label: 'Delete Note', action: () => deleteNotes([noteId]), danger: true });
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
                options.push({ label: 'Delete Cluster', action: () => deleteCluster(clusterId), danger: true });
            } else {
                // Canvas long press disabled - return early, no context menu
                return;
            }

            setContextMenu({
                x: pointerPos.x,
                y: pointerPos.y,
                options
            });
        },
        onClick: (e) => setContextMenu(null),
        threshold: 10
    });

    return (
        <>
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                draggable={!selectionMode}
                onWheel={handleWheel}
                onDragStart={() => cancelLongPress()}
                onTouchStart={(e) => {
                    if (e.target === stageRef.current) {
                        const pos = { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY };
                        handleSelectionStart(pos);
                    }
                    onLongPressTouchStart(e.evt as any);
                }}
                onTouchMove={(e) => {
                    const pos = { x: e.evt.touches[0].clientX, y: e.evt.touches[0].clientY };
                    handleSelectionMove(pos);
                    handleTouchMove(e);
                    onLongPressTouchMove(e.evt as any);
                }}
                onTouchEnd={(e) => {
                    handleSelectionEnd();
                    handleTouchEnd();
                    onLongPressTouchEnd(e.evt as any);
                }}
                onDblClick={handleStageDblClick}
                onContextMenu={handleContextMenu}
                onMouseDown={(e) => {
                    if (e.target === stageRef.current) {
                        const pos = { x: e.evt.clientX, y: e.evt.clientY };
                        handleSelectionStart(pos);
                    }
                    handleMouseDown(e);
                    onLongPressMouseDown(e.evt as any);
                }}
                onMouseMove={(e) => {
                    const pos = { x: e.evt.clientX, y: e.evt.clientY };
                    handleSelectionMove(pos);
                    handleMouseMove();
                    onLongPressMouseMove(e.evt as any);
                }}
                onMouseUp={(e) => {
                    handleSelectionEnd();
                    handleMouseUp(e);
                    onLongPressMouseUp(e.evt as any);
                }}
                onClick={() => {
                    if (ignoreClickRef.current) {
                        setTimeout(() => { ignoreClickRef.current = false; }, 50);
                        return;
                    }
                    setContextMenu(null);
                }}
                onTap={() => {
                    if (ignoreClickRef.current) {
                        setTimeout(() => { ignoreClickRef.current = false; }, 50);
                        return;
                    }
                    setContextMenu(null);
                }}
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
                style={{ backgroundColor: 'var(--theme-canvas-bg)', touchAction: 'none' }}
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

                    <LinkLayer notes={notes} links={links} onLinkContextMenu={handleLinkContextMenu} scale={viewport.scale} />

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
                            updateNotePosition={handleNoteDragEnd}
                            onDragStart={handleNoteDragStart}
                            onDragMove={handleNoteDragMove}
                            setEditingNoteId={setEditingNoteId}
                            themeName={theme}
                            isLinking={!!linkingSourceId}
                            onNoteClick={handleNoteClick}
                            ignoreClick={ignoreClickRef}
                        />
                    ))}
                    {selectionBox && (
                        <Rect
                            x={selectionBox.startX}
                            y={selectionBox.startY}
                            width={selectionBox.width}
                            height={selectionBox.height}
                            fill="rgba(0, 161, 255, 0.3)"
                            stroke="#00a1ff"
                            strokeWidth={1}
                        />
                    )}
                </Layer>
            </Stage >

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