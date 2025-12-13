import type { Note } from './types';
import { db } from './db';

/**
 * Sync bidirectional references between notes
 * Creates/deletes links and updates reference arrays
 */
export const syncBidirectionalReferences = async (
    noteId: string,
    newReferences: string[],
    oldReferences: string[],
    get: () => { notes: Record<string, Note>; links: Record<string, any> },
    addLink: (sourceId: string, targetId: string) => Promise<void>,
    deleteLink: (linkId: string) => Promise<void>
) => {
    const { notes, links } = get();
    const note = notes[noteId];
    if (!note) return;

    // Find references to add (in new but not in old)
    const toAdd = newReferences.filter(id => !oldReferences.includes(id));

    // Find references to remove (in old but not in new)
    const toRemove = oldReferences.filter(id => !newReferences.includes(id));

    // Add new links
    for (const targetId of toAdd) {
        if (notes[targetId]) {
            await addLink(targetId, noteId);
        }
    }

    // Remove old links
    for (const targetId of toRemove) {
        // Find and delete the link
        const linkToDelete = Object.values(links).find(
            l => (l.sourceId === noteId && l.targetId === targetId) ||
                (l.sourceId === targetId && l.targetId === noteId)
        );

        if (linkToDelete) {
            await deleteLink(linkToDelete.id);
        }
    }

    // Update the note's references array in database
    await db.notes.update(noteId, { references: newReferences });
};
