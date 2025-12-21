import Fuse, { type IFuseOptions, type FuseResult } from 'fuse.js';
import type { Note, Cluster } from './types';

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

// Generic Search Interface
export interface GenericSearchResult<T> {
    item: T;
    score: number;
    matches?: FuseResult<T>['matches'];
}

// Cluster Search

const clusterFuseOptions: IFuseOptions<Cluster> = {
    keys: [{ name: 'title', weight: 1 }],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true
};

export const searchClusters = (query: string, clusters: Cluster[]): GenericSearchResult<Cluster>[] => {
    if (!query.trim()) return [];

    // Clusters don't have tags usually, but we could add tag logic if needed

    const fuse = new Fuse(clusters, clusterFuseOptions);
    const results = fuse.search(query);

    return results.map(result => ({
        item: result.item,
        score: result.score || 0,
        matches: result.matches
    }));
};

export const getSearchSnippet = (text: string, matches?: FuseResult<Note>['matches']): { pre: string; match: string; post: string } => {
    // Determine the best match to show (prioritize content matches over title)
    const contentMatch = matches?.find(m => m.key === 'content');

    if (!contentMatch || !contentMatch.indices.length) {
        // Fallback: no highlight, just start of text
        return { pre: text.slice(0, 85), match: '', post: text.length > 85 ? '...' : '' };
    }

    const [start, end] = contentMatch.indices[0]; // Fuse indices are inclusive [start, end]

    // Calculate context window
    const contextStart = Math.max(0, start - 30);
    const contextEnd = Math.min(text.length, end + 1 + 50);

    return {
        pre: (contextStart > 0 ? '...' : '') + text.slice(contextStart, start),
        match: text.slice(start, end + 1),
        post: text.slice(end + 1, contextEnd) + (contextEnd < text.length ? '...' : '')
    };
};

// Legacy support if needed, or just remove
export const getHighlightedText = (text: string, matches?: FuseResult<Note>['matches']): string => {
    const snippet = getSearchSnippet(text, matches);
    return `${snippet.pre}${snippet.match}${snippet.post}`;
};
