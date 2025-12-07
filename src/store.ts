import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Note, Cluster, Link, ViewportState } from './types';
import { db } from './db';
import { type ThemeName } from './themes';
import { syncService } from './services/firebaseSyncService';

interface AppState {
    notes: Record<string, Note>;
    clusters: Record<string, Cluster>;
    links: Record<string, Link>;
    viewport: ViewportState;
    editingNoteId: string | null;
    selectedTags: string[]; // Active tag filter
    theme: ThemeName;

    setViewport: (v: Partial<ViewportState>) => void;
    setEditingNoteId: (id: string | null) => void;
    setSelectedTags: (tags: string[]) => void;
    toggleTagFilter: (tag: string) => void;
    clearTagFilter: () => void;
    setTheme: (theme: ThemeName) => void;

    // UI State
    ui: {
        minimapVisible: boolean;
        lodMode: 'auto' | 'orb' | 'card';
        showOrbLabels: boolean;
        showOrbDetails: boolean;
    };
    setUi: (updates: Partial<AppState['ui']>) => void;

    // Actions
    loadData: () => Promise<void>;
    addNote: (note: Omit<Note, 'id' | 'created' | 'modified'>) => Promise<void>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    updateNotePosition: (id: string, x: number, y: number) => void;

    // Cluster Actions
    createCluster: (noteIds: string[], title?: string) => Promise<void>;
    deleteCluster: (id: string) => Promise<void>;
    addToCluster: (clusterId: string, noteIds: string[]) => Promise<void>;
    removeFromCluster: (noteId: string) => Promise<void>;
    updateClusterPosition: (id: string, x: number, y: number) => void;
    updateCluster: (id: string, updates: Partial<Cluster>) => Promise<void>;

    // Link Actions
    addLink: (sourceId: string, targetId: string) => Promise<void>;
    deleteLink: (id: string) => Promise<void>;
    updateLink: (id: string, updates: Partial<Link>) => Promise<void>;

    generateRandomNotes: () => Promise<void>;

    // Export/Import
    exportData: () => void;
    importData: (data: any) => { success: boolean; message: string };

    // Cloud Sync
    syncing: boolean;
    initializeSync: (userId: string) => Promise<void>;
    reconcileWithCloud: () => Promise<void>;
    cleanupSync: () => void;
}

// Helper to recalculate cluster center
const recalculateClusterCenter = async (
    clusterId: string,
    get: () => AppState,
    set: (partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>)) => void
) => {
    const state = get();
    const cluster = state.clusters[clusterId];
    if (!cluster) return;

    const notes = cluster.children.map(id => state.notes[id]).filter(Boolean);
    if (notes.length === 0) return;

    const centerX = notes.reduce((sum, n) => sum + n.x, 0) / notes.length;
    const centerY = notes.reduce((sum, n) => sum + n.y, 0) / notes.length;

    set((prev: AppState) => ({
        clusters: {
            ...prev.clusters,
            [clusterId]: { ...prev.clusters[clusterId], x: centerX, y: centerY }
        }
    }));
    await db.clusters.update(clusterId, { x: centerX, y: centerY });
};

export const useStore = create<AppState>((set, get) => ({
    notes: {},
    clusters: {},
    links: {},
    viewport: { x: 0, y: 0, scale: 1 },
    editingNoteId: null,
    selectedTags: [],
    theme: (localStorage.getItem('infinite-mind-theme') as ThemeName) || 'light',
    ui: {
        minimapVisible: true,
        lodMode: 'auto',
        showOrbLabels: false,
        showOrbDetails: false
    },
    syncing: false,

    setUi: (updates) => set((state) => ({
        ui: { ...state.ui, ...updates }
    })),

    setViewport: (update) => set((state) => ({
        viewport: { ...state.viewport, ...update }
    })),

    setEditingNoteId: (id) => set({ editingNoteId: id }),

    setSelectedTags: (tags) => set({ selectedTags: tags }),

    toggleTagFilter: (tag) => set((state) => {
        const isSelected = state.selectedTags.includes(tag);
        return {
            selectedTags: isSelected
                ? state.selectedTags.filter(t => t !== tag)
                : [...state.selectedTags, tag]
        };
    }),

    clearTagFilter: () => set({ selectedTags: [] }),

    setTheme: (theme) => {
        localStorage.setItem('infinite-mind-theme', theme);
        set({ theme });
    },

    loadData: async () => {
        const notesArray = await db.notes.toArray();
        const clustersArray = await db.clusters.toArray();
        const linksArray = await db.links.toArray();

        const notes: Record<string, Note> = {};
        notesArray.forEach((n: Note) => notes[n.id] = n);

        const clusters: Record<string, Cluster> = {};
        clustersArray.forEach((c: Cluster) => clusters[c.id] = c);

        const links: Record<string, Link> = {};
        linksArray.forEach((l: Link) => links[l.id] = l);

        set({ notes, clusters, links });
    },

    addNote: async (noteData) => {
        const now = Date.now();
        const newNote: Note = {
            ...noteData,
            id: uuidv4(),
            created: now,
            modified: now,
        };
        set(state => ({ notes: { ...state.notes, [newNote.id]: newNote }, editingNoteId: newNote.id }));
        await db.notes.add(newNote);
    },

    updateNote: async (id, updates) => {
        const note = get().notes[id];
        if (!note) return;

        const updatedNote = { ...note, ...updates, modified: Date.now() };

        // If content changed, parse references and sync
        if (updates.content !== undefined) {
            const { parseReferences } = await import('./referenceParser');
            const { syncBidirectionalReferences } = await import('./linkUtils');

            const oldReferences = note.references || [];
            const newReferences = parseReferences(updatedNote.content, get().notes);

            set(state => ({
                notes: { ...state.notes, [id]: { ...updatedNote, references: newReferences } }
            }));

            // Sync links bidirectionally
            await syncBidirectionalReferences(
                id,
                newReferences,
                oldReferences,
                get,
                get().addLink,
                get().deleteLink
            );

            await db.notes.update(id, { ...updatedNote, references: newReferences });
        } else {
            set(state => ({
                notes: { ...state.notes, [id]: updatedNote }
            }));
            await db.notes.update(id, updatedNote);
        }
    },

    deleteNote: async (id) => {
        const note = get().notes[id];
        if (note && note.clusterId) {
            await get().removeFromCluster(id);
        }

        // Delete associated links
        const links = get().links;
        const linksToDelete = Object.values(links).filter(l => l.sourceId === id || l.targetId === id);

        // Remove this note from other notes' references arrays
        const notes = get().notes;
        const notesToUpdate: Array<{ id: string; refs: string[] }> = [];

        Object.values(notes).forEach(n => {
            if (n.references && n.references.includes(id)) {
                const newRefs = n.references.filter(refId => refId !== id);
                notesToUpdate.push({ id: n.id, refs: newRefs });
            }
        });

        set(state => {
            const { [id]: deleted, ...restNotes } = state.notes;
            const updatedLinks = { ...state.links };
            linksToDelete.forEach(l => delete updatedLinks[l.id]);

            const updatedNotes = { ...restNotes };
            notesToUpdate.forEach(({ id: noteId, refs }) => {
                if (updatedNotes[noteId]) {
                    updatedNotes[noteId] = { ...updatedNotes[noteId], references: refs };
                }
            });

            return { notes: updatedNotes, links: updatedLinks, editingNoteId: null };
        });

        await db.notes.delete(id);
        await Promise.all(linksToDelete.map(l => db.links.delete(l.id)));
        await Promise.all(notesToUpdate.map(({ id: noteId, refs }) =>
            db.notes.update(noteId, { references: refs })
        ));

        // Sync deletion to cloud
        try {
            await syncService.deleteNote(id);
            // Also delete associated links from cloud
            for (const link of linksToDelete) {
                await syncService.deleteLink(link.id);
            }
        } catch (error) {
            console.error('Failed to sync note deletion to cloud:', error);
        }
    },

    updateNotePosition: (id, x, y) => {
        set((state) => ({
            notes: {
                ...state.notes,
                [id]: { ...state.notes[id], x, y }
            }
        }));
        db.notes.update(id, { x, y, modified: Date.now() });

        const note = get().notes[id];
        if (note && note.clusterId) {
            recalculateClusterCenter(note.clusterId, get, set);
        }
    },

    // --- Cluster Actions ---

    createCluster: async (noteIds, title = 'New Cluster') => {
        const notes = get().notes;
        const selectedNotes = noteIds.map(id => notes[id]).filter(Boolean);
        if (selectedNotes.length === 0) return;

        const centerX = selectedNotes.reduce((sum, n) => sum + n.x, 0) / selectedNotes.length;
        const centerY = selectedNotes.reduce((sum, n) => sum + n.y, 0) / selectedNotes.length;

        const newCluster: Cluster = {
            id: uuidv4(),
            title,
            x: centerX,
            y: centerY,
            children: noteIds,
            color: '#FFD700'
        };

        set(state => {
            const updatedNotes = { ...state.notes };
            noteIds.forEach(id => {
                if (updatedNotes[id]) updatedNotes[id] = { ...updatedNotes[id], clusterId: newCluster.id };
            });

            return {
                clusters: { ...state.clusters, [newCluster.id]: newCluster },
                notes: updatedNotes
            };
        });

        await db.clusters.add(newCluster);
        await Promise.all(noteIds.map(id => db.notes.update(id, { clusterId: newCluster.id })));

        try {
            await syncService.syncCluster(newCluster);
            for (const id of noteIds) {
                const updatedNote = get().notes[id];
                if (updatedNote) await syncService.syncNote(updatedNote);
            }
        } catch (error) {
            console.error('Failed to sync new cluster:', error);
        }
    },

    deleteCluster: async (id) => {
        const cluster = get().clusters[id];
        if (!cluster) return;

        const childrenIds = cluster.children;

        set(state => {
            const updatedNotes = { ...state.notes };
            childrenIds.forEach(childId => {
                if (updatedNotes[childId]) {
                    const { clusterId, ...rest } = updatedNotes[childId];
                    updatedNotes[childId] = rest as Note;
                }
            });

            const { [id]: deleted, ...restClusters } = state.clusters;
            return {
                notes: updatedNotes,
                clusters: restClusters
            };
        });

        await db.clusters.delete(id);
        await Promise.all(childrenIds.map(childId => db.notes.update(childId, { clusterId: undefined })));

        try {
            await syncService.deleteCluster(id);
            for (const childId of childrenIds) {
                const note = get().notes[childId];
                if (note) await syncService.syncNote(note);
            }
        } catch (error) {
            console.error('Failed to sync cluster deletion:', error);
        }
    },

    addToCluster: async (clusterId, noteIds) => {
        const cluster = get().clusters[clusterId];
        if (!cluster) return;

        const newChildren = [...new Set([...cluster.children, ...noteIds])];

        set(state => {
            const updatedNotes = { ...state.notes };
            noteIds.forEach(id => {
                if (updatedNotes[id]) updatedNotes[id] = { ...updatedNotes[id], clusterId };
            });

            return {
                clusters: {
                    ...state.clusters,
                    [clusterId]: { ...cluster, children: newChildren }
                },
                notes: updatedNotes
            };
        });

        await db.clusters.update(clusterId, { children: newChildren });
        await Promise.all(noteIds.map(id => db.notes.update(id, { clusterId })));
        recalculateClusterCenter(clusterId, get, set);

        try {
            const updatedCluster = get().clusters[clusterId];
            if (updatedCluster) await syncService.syncCluster(updatedCluster);

            for (const id of noteIds) {
                const updatedNote = get().notes[id];
                if (updatedNote) await syncService.syncNote(updatedNote);
            }
        } catch (error) {
            console.error('Failed to sync addToCluster:', error);
        }
    },

    removeFromCluster: async (noteId) => {
        const note = get().notes[noteId];
        if (!note || !note.clusterId) return;

        const clusterId = note.clusterId;
        const cluster = get().clusters[clusterId];

        if (cluster) {
            const newChildren = cluster.children.filter(id => id !== noteId);

            set(state => ({
                clusters: {
                    ...state.clusters,
                    [clusterId]: { ...cluster, children: newChildren }
                }
            }));

            await db.clusters.update(clusterId, { children: newChildren });
        }

        set(state => {
            const { clusterId, ...rest } = state.notes[noteId];
            return {
                notes: { ...state.notes, [noteId]: rest as Note }
            };
        });

        await db.notes.update(noteId, { clusterId: undefined });

        if (clusterId) {
            recalculateClusterCenter(clusterId, get, set);
        }

        try {
            if (clusterId) {
                const updatedCluster = get().clusters[clusterId];
                if (updatedCluster) await syncService.syncCluster(updatedCluster);
            }
            const updatedNote = get().notes[noteId];
            if (updatedNote) await syncService.syncNote(updatedNote);
        } catch (error) {
            console.error('Failed to sync removeFromCluster:', error);
        }
    },

    updateClusterPosition: (id, x, y) => {
        const cluster = get().clusters[id];
        if (!cluster) return;

        const dx = x - cluster.x;
        const dy = y - cluster.y;

        set(state => {
            const updatedNotes = { ...state.notes };
            cluster.children.forEach(childId => {
                if (updatedNotes[childId]) {
                    updatedNotes[childId] = {
                        ...updatedNotes[childId],
                        x: updatedNotes[childId].x + dx,
                        y: updatedNotes[childId].y + dy
                    };
                }
            });

            return {
                clusters: { ...state.clusters, [id]: { ...cluster, x, y } },
                notes: updatedNotes
            };
        });

        db.clusters.update(id, { x, y });
        cluster.children.forEach(childId => {
            const note = get().notes[childId];
            if (note) db.notes.update(childId, { x: note.x, y: note.y });
        });
    },

    updateCluster: async (id, updates) => {
        const cluster = get().clusters[id];
        if (!cluster) return;

        const updatedCluster = { ...cluster, ...updates };

        set(state => ({
            clusters: { ...state.clusters, [id]: updatedCluster }
        }));

        await db.clusters.update(id, updatedCluster);

        try {
            await syncService.syncCluster(updatedCluster);
        } catch (error) {
            console.error('Failed to sync cluster update:', error);
        }
    },

    // --- Link Actions ---

    addLink: async (sourceId, targetId) => {
        if (sourceId === targetId) return;

        const links = Object.values(get().links);
        const exists = links.some(l =>
            (l.sourceId === sourceId && l.targetId === targetId) ||
            (l.sourceId === targetId && l.targetId === sourceId)
        );
        if (exists) return;

        const newLink: Link = {
            id: uuidv4(),
            sourceId,
            targetId,
            type: 'related'
        };

        // Update references in both notes
        const notes = get().notes;
        const sourceNote = notes[sourceId];
        const targetNote = notes[targetId];

        if (!sourceNote || !targetNote) return;

        const sourceRefs = [...(sourceNote.references || [])];
        const targetRefs = [...(targetNote.references || [])];

        if (!sourceRefs.includes(targetId)) sourceRefs.push(targetId);
        if (!targetRefs.includes(sourceId)) targetRefs.push(sourceId);

        set(state => ({
            links: { ...state.links, [newLink.id]: newLink },
            notes: {
                ...state.notes,
                [sourceId]: { ...sourceNote, references: sourceRefs },
                [targetId]: { ...targetNote, references: targetRefs }
            }
        }));

        await db.links.add(newLink);
        await db.notes.update(sourceId, { references: sourceRefs });
        await db.notes.update(targetId, { references: targetRefs });

        try {
            await syncService.syncLink(newLink);
            const sNote = get().notes[sourceId];
            const tNote = get().notes[targetId];
            if (sNote) await syncService.syncNote(sNote);
            if (tNote) await syncService.syncNote(tNote);
        } catch (error) {
            console.error('Failed to sync new link:', error);
        }
    },

    deleteLink: async (id) => {
        const link = get().links[id];
        if (!link) return;

        // Remove from both notes' references
        const notes = get().notes;
        const sourceNote = notes[link.sourceId];
        const targetNote = notes[link.targetId];

        const updates: Array<{ id: string, refs: string[] }> = [];

        if (sourceNote && sourceNote.references) {
            const newSourceRefs = sourceNote.references.filter(refId => refId !== link.targetId);
            updates.push({ id: link.sourceId, refs: newSourceRefs });
        }

        if (targetNote && targetNote.references) {
            const newTargetRefs = targetNote.references.filter(refId => refId !== link.sourceId);
            updates.push({ id: link.targetId, refs: newTargetRefs });
        }

        set(state => {
            const { [id]: deleted, ...restLinks } = state.links;
            const updatedNotes = { ...state.notes };

            updates.forEach(({ id: noteId, refs }) => {
                if (updatedNotes[noteId]) {
                    updatedNotes[noteId] = { ...updatedNotes[noteId], references: refs };
                }
            });

            return { links: restLinks, notes: updatedNotes };
        });

        await db.links.delete(id);
        await Promise.all(updates.map(({ id: noteId, refs }) =>
            db.notes.update(noteId, { references: refs })
        ));

        try {
            await syncService.deleteLink(id);
            for (const { id: noteId } of updates) {
                const note = get().notes[noteId];
                if (note) await syncService.syncNote(note);
            }
        } catch (error) {
            console.error('Failed to sync link deletion:', error);
        }
    },

    updateLink: async (id, updates) => {
        const link = get().links[id];
        if (!link) return;

        const updatedLink = { ...link, ...updates };

        set(state => ({
            links: { ...state.links, [id]: updatedLink }
        }));

        await db.links.update(id, updatedLink);

        try {
            await syncService.syncLink(updatedLink);
        } catch (error) {
            console.error('Failed to sync link update:', error);
        }
    },

    generateRandomNotes: async () => {
        const types = ['fleeting', 'literature', 'permanent', 'hub'] as const;
        const newNotes: Note[] = [];

        for (let i = 0; i < 50; i++) {
            const now = Date.now();
            newNotes.push({
                id: uuidv4(),
                type: types[Math.floor(Math.random() * types.length)],
                x: (Math.random() - 0.5) * 4000,
                y: (Math.random() - 0.5) * 4000,
                title: `Note Idea #${i + 1}`,
                content: "This is a generated note. Zoom in to read the full content. Zoom out to see it as a dot.",
                tags: ['random', 'generated'],
                created: now,
                modified: now,
                references: []
            });
        }

        await db.notes.bulkPut(newNotes);
        get().loadData();
    },

    // Export/Import functionality
    exportData: () => {
        const state = get();
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                notes: state.notes,
                clusters: state.clusters,
                links: state.links,
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `infinite-mind-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: (data: any) => {
        try {
            // Validate structure
            if (!data.data || !data.data.notes) {
                throw new Error('Invalid backup file format');
            }

            const { notes, clusters, links } = data.data;

            set({
                notes: notes || {},
                clusters: clusters || {},
                links: links || {},
            });

            // Save to database
            // Save to IndexedDB`r`n            if (notes) {`r`n                Object.values(notes).forEach((note: any) => db.notes.put(note));`r`n            }`r`n            if (clusters) {`r`n                Object.values(clusters).forEach((cluster: any) => db.clusters.put(cluster));`r`n            }`r`n            if (links) {`r`n                Object.values(links).forEach((link: any) => db.links.put(link));`r`n            }

            return { success: true, message: 'Data imported successfully!' };
        } catch (error) {
            console.error('Import error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Import failed'
            };
        }
    },

    // ===== CLOUD SYNC =====

    initializeSync: async (userId: string) => {
        console.log('🚀 Initializing cloud sync for user:', userId);
        set({ syncing: true });

        try {
            await syncService.initialize(userId);

            const localNotes = Object.values(get().notes);
            const localClusters = Object.values(get().clusters);
            const localLinks = Object.values(get().links);

            await syncService.migrateLocalData(localNotes, localClusters, localLinks);

            syncService.onNotesChanged((cloudNotes) => {
                console.log('📝 Notes updated from cloud:', Object.keys(cloudNotes).length);
                set(state => {
                    const mergedNotes = { ...state.notes };
                    Object.entries(cloudNotes).forEach(([id, cloudNote]) => {
                        const localNote = mergedNotes[id];
                        if (!localNote || cloudNote.modified >= localNote.modified) {
                            mergedNotes[id] = cloudNote;
                        }
                    });
                    return { notes: mergedNotes };
                });
                Object.values(cloudNotes).forEach(note => db.notes.put(note));
            });

            syncService.onClustersChanged((clusters) => {
                console.log('📦 Clusters updated from cloud:', Object.keys(clusters).length);
                set({ clusters });
                Object.values(clusters).forEach(cluster => db.clusters.put(cluster));
            });

            syncService.onLinksChanged((links) => {
                console.log('🔗 Links updated from cloud:', Object.keys(links).length);
                set({ links });
                Object.values(links).forEach(link => db.links.put(link));
            });

            console.log('✅ Cloud sync initialized');
        } catch (error) {
            console.error('❌ Error initializing sync:', error);
        } finally {
            set({ syncing: false });
        }
    },

    reconcileWithCloud: async () => {
        console.log('🔄 Reconciling with cloud...');
        try {
            const notes = Object.values(get().notes);
            const clusters = Object.values(get().clusters);
            const links = Object.values(get().links);

            for (const note of notes) await syncService.syncNote(note);
            for (const cluster of clusters) await syncService.syncCluster(cluster);
            for (const link of links) await syncService.syncLink(link);

            console.log('✅ Reconciliation complete');
        } catch (error) {
            console.error('❌ Reconciliation failed:', error);
        }
    },

    cleanupSync: () => {
        console.log('🧹 Cleaning up sync');
        syncService.cleanup();
    },
}));

// Expose store for debugging
(window as any).store = useStore;
