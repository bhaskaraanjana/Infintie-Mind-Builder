// Abstraction layer for sync service
// Allows switching from Firebase to other backends later

import type { Note, Cluster, Link } from '../types';

export interface SyncService {
    // Initialize sync for a user
    initialize(userId: string): Promise<void>;

    // Cleanup listeners
    cleanup(): void;

    // Notes sync
    syncNote(note: Note): Promise<void>;
    deleteNote(noteId: string): Promise<void>;

    // Clusters sync
    syncCluster(cluster: Cluster): Promise<void>;
    deleteCluster(clusterId: string): Promise<void>;

    // Links sync
    syncLink(link: Link): Promise<void>;
    deleteLink(linkId: string): Promise<void>;

    // Real-time listeners
    onNotesChanged(callback: (notes: Record<string, Note>) => void): () => void;
    onClustersChanged(callback: (clusters: Record<string, Cluster>) => void): () => void;
    onLinksChanged(callback: (links: Record<string, Link>) => void): () => void;
}
