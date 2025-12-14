// Firebase implementation of SyncService
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    getDocs,
    getDoc
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

        // Ensure metadata tombstone exists so we know this account is active/used.
        // This prevents other devices from treating an empty cloud as a "Fresh Account" after we delete everything.
        try {
            const metadataRef = doc(firestore, 'users', userId, 'metadata', 'sync');
            await setDoc(metadataRef, { lastSeen: Date.now() }, { merge: true });
        } catch (e) {
            console.error('Failed to update sync metadata:', e);
        }
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

        // Ensure tombstone exists (critical if this was the last note)
        const metadataRef = doc(firestore, 'users', this.userId, 'metadata', 'sync');
        // We use setDoc mostly to ensure existence, not specific content
        setDoc(metadataRef, { lastDelete: Date.now() }, { merge: true }).catch(console.error);
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

        // 1. Check for Sync Metadata (The "Account Used Before" Flag)
        const metadataRef = doc(firestore, 'users', this.userId, 'metadata', 'sync');
        const metadataSnap = await getDoc(metadataRef);

        // 2. Check if cloud has actual data
        const notesRef = collection(firestore, 'users', this.userId, 'notes');
        const notesSnap = await getDocs(notesRef);

        const hasCloudData = !notesSnap.empty;
        const hasMetadata = metadataSnap.exists();

        console.log(`🔍 [Migration Check] Metadata: ${hasMetadata}, CloudData: ${hasCloudData}, LocalNotes: ${localNotes.length}`);

        // Case A: Account was used before (metadata exists) but is empty (notesSnap empty).
        // This implies the user explicitly deleted everything.
        // We should NOT upload local data (which would "resurrect" it).
        if (hasMetadata && !hasCloudData) {
            console.log('⚠️ Metadata exists but cloud is empty. Respecting deletion state.');
            return; // Exit. The subsequent sync listeners will wipe local data to match the empty cloud.
        }

        // Case B: Cloud has data.
        if (hasCloudData) {
            console.log('✅ Cloud already has data, skipping migration');
            // Ensure metadata exists for future
            if (!hasMetadata) await setDoc(metadataRef, { created: Date.now() });
            return;
        }

        // Case C: Fresh Account (No Metadata, No Data).
        // Safe to migrate local data up.
        if (localNotes.length === 0 && localClusters.length === 0 && localLinks.length === 0) {
            console.log('✅ No local data to migrate');
            if (!hasMetadata) await setDoc(metadataRef, { created: Date.now() });
            return;
        }

        console.log(`🚀 Fresh Account detected. Migrating ${localNotes.length} items...`);

        // Mark account as initialized
        await setDoc(metadataRef, { created: Date.now() });

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
