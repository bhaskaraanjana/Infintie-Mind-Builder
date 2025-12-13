// Firebase implementation of SyncService
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    getDocs
} from 'firebase/firestore';
import { firestore } from '../firebase';
import type { SyncService } from './syncService';
import type { Note, Cluster, Link } from '../types';

class FirebaseSyncService implements SyncService {
    private userId: string | null = null;
    private unsubscribers: (() => void)[] = [];

    async initialize(userId: string): Promise<void> {
        this.userId = userId;
        console.log('🔄 Sync service initialized for user:', userId);
    }

    cleanup(): void {
        console.log('🧹 Cleaning up sync listeners');
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
        this.userId = null;
    }

    // ===== NOTES =====

    async syncNote(note: Note): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const noteRef = doc(firestore, 'users', this.userId, 'notes', note.id);
        await setDoc(noteRef, {
            ...note
        }, { merge: true });
    }

    async deleteNote(noteId: string): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const noteRef = doc(firestore, 'users', this.userId, 'notes', noteId);
        await deleteDoc(noteRef);
    }

    onNotesChanged(callback: (notes: Record<string, Note>) => void): () => void {
        if (!this.userId) throw new Error('Sync not initialized');

        const notesRef = collection(firestore, 'users', this.userId, 'notes');
        const q = query(notesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes: Record<string, Note> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data() as Note;
                notes[data.id] = data;
            });
            callback(notes);
        });

        this.unsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    // ===== CLUSTERS =====

    async syncCluster(cluster: Cluster): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const clusterRef = doc(firestore, 'users', this.userId, 'clusters', cluster.id);
        await setDoc(clusterRef, cluster, { merge: true });
    }

    async deleteCluster(clusterId: string): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const clusterRef = doc(firestore, 'users', this.userId, 'clusters', clusterId);
        await deleteDoc(clusterRef);
    }

    onClustersChanged(callback: (clusters: Record<string, Cluster>) => void): () => void {
        if (!this.userId) throw new Error('Sync not initialized');

        const clustersRef = collection(firestore, 'users', this.userId, 'clusters');
        const q = query(clustersRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const clusters: Record<string, Cluster> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data() as Cluster;
                clusters[data.id] = data;
            });
            callback(clusters);
        });

        this.unsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    // ===== LINKS =====

    async syncLink(link: Link): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const linkRef = doc(firestore, 'users', this.userId, 'links', link.id);
        await setDoc(linkRef, link, { merge: true });
    }

    async deleteLink(linkId: string): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        const linkRef = doc(firestore, 'users', this.userId, 'links', linkId);
        await deleteDoc(linkRef);
    }

    onLinksChanged(callback: (links: Record<string, Link>) => void): () => void {
        if (!this.userId) throw new Error('Sync not initialized');

        const linksRef = collection(firestore, 'users', this.userId, 'links');
        const q = query(linksRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const links: Record<string, Link> = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data() as Link;
                links[data.id] = data;
            });
            callback(links);
        });

        this.unsubscribers.push(unsubscribe);
        return unsubscribe;
    }

    // ===== MIGRATION =====

    async migrateLocalData(localNotes: Note[], localClusters: Cluster[], localLinks: Link[]): Promise<void> {
        if (!this.userId) throw new Error('Sync not initialized');

        console.log('🔄 Checking if migration needed...');

        // Check if cloud already has data
        const notesRef = collection(firestore, 'users', this.userId, 'notes');
        const snapshot = await getDocs(notesRef);

        if (!snapshot.empty) {
            console.log('✅ Cloud already has data, skipping migration');
            return;
        }

        if (localNotes.length === 0) {
            console.log('✅ No local data to migrate');
            return;
        }

        console.log(`🚀 Migrating ${localNotes.length} notes, ${localClusters.length} clusters, ${localLinks.length} links...`);

        // Migrate notes
        for (const note of localNotes) {
            await this.syncNote(note);
        }

        // Migrate clusters
        for (const cluster of localClusters) {
            await this.syncCluster(cluster);
        }

        // Migrate links
        for (const link of localLinks) {
            await this.syncLink(link);
        }

        console.log('✅ Migration complete!');
    }
}

// Export singleton instance
export const syncService = new FirebaseSyncService();
