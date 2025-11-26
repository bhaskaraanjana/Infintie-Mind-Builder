import type { Note } from './types';

/**
 * Extract note references from content using [[Note Title]] syntax
 * Returns array of note IDs that match the referenced titles
 */
export const parseReferences = (content: string, notes: Record<string, Note>): string[] => {
    // Match [[...]] patterns
    const referencePattern = /\[\[([^\]]+)\]\]/g;
    const matches = Array.from(content.matchAll(referencePattern));

    if (matches.length === 0) return [];

    const referencedIds: string[] = [];
    const notesArray = Object.values(notes);

    for (const match of matches) {
        const referencedTitle = match[1].trim();

        // Find note by title (case-insensitive)
        const targetNote = notesArray.find(
            note => note.title.toLowerCase() === referencedTitle.toLowerCase()
        );

        if (targetNote && !referencedIds.includes(targetNote.id)) {
            referencedIds.push(targetNote.id);
        }
    }

    return referencedIds;
};

/**
 * Get all notes that reference the given note ID (backlinks)
 */
export const getBacklinks = (noteId: string, notes: Record<string, Note>): Note[] => {
    return Object.values(notes).filter(note =>
        note.references && note.references.includes(noteId)
    );
};

/**
 * Split content into parts: text and references
 * Used for rendering clickable references
 */
export interface ContentPart {
    type: 'text' | 'reference';
    content: string;
    noteId?: string; // for reference parts
    exists?: boolean; // whether the referenced note exists
}

export const parseContentParts = (content: string, notes: Record<string, Note>): ContentPart[] => {
    const parts: ContentPart[] = [];
    const referencePattern = /\[\[([^\]]+)\]\]/g;

    let lastIndex = 0;
    let match;

    while ((match = referencePattern.exec(content)) !== null) {
        // Add text before reference
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        // Add reference
        const referencedTitle = match[1].trim();
        const targetNote = Object.values(notes).find(
            note => note.title.toLowerCase() === referencedTitle.toLowerCase()
        );

        parts.push({
            type: 'reference',
            content: referencedTitle,
            noteId: targetNote?.id,
            exists: !!targetNote
        });

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return parts;
};
