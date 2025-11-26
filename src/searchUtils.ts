import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { Note } from './types';

export interface SearchResult {
    item: Note;
    score: number;
    matches?: FuseResult<Note>['matches'];
}

const fuseOptions: IFuseOptions<Note> = {
    keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 },
        { name: 'tags', weight: 1.5 }
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2
};

export const searchNotes = (query: string, notes: Note[]): SearchResult[] => {
    if (!query.trim()) return [];

    // Check if searching by tag (starts with #)
    if (query.startsWith('#')) {
        const tag = query.slice(1).toLowerCase();
        return notes
            .filter(note => note.tags?.some(t => t.toLowerCase().includes(tag)))
            .map(note => ({ item: note, score: 0 }));
    }

    // Regular fuzzy search
    const fuse = new Fuse(notes, fuseOptions);
    const results = fuse.search(query);

    return results.map(result => ({
        item: result.item,
        score: result.score || 0,
        matches: result.matches
    }));
};

export const getHighlightedText = (text: string, matches?: FuseResult<Note>['matches']): string => {
    if (!matches || matches.length === 0) return text;

    // Simple highlighting - just return the matched portion
    const match = matches[0];
    if (match && match.indices && match.indices.length > 0) {
        const [start, end] = match.indices[0];
        return text.slice(Math.max(0, start - 20), Math.min(text.length, end + 50));
    }

    return text.slice(0, 100);
};
