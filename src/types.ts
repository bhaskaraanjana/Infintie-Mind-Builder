export type NoteType = 'fleeting' | 'literature' | 'permanent' | 'hub';

export interface SourceMetadata {
    id: string;
    title: string;
    author: string;
    publishedDate: string;
    url: string;
}

export interface Note {
    id: string;
    type: NoteType;
    x: number;
    y: number;
    title: string;
    content: string;
    tags: string[];
    source?: string; // Legacy
    sources?: string[]; // Legacy
    spaceId?: string;
    clusterId?: string;
    created: number; // Timestamp
    modified: number; // Timestamp
    references: string[]; // IDs of referenced notes
    // Single metadata is legacy, we prefer sourcesMetadata array now
    metadata?: Partial<SourceMetadata>;
    sourcesMetadata?: SourceMetadata[]; // New Array of rich sources
}

export interface Cluster {
    id: string;
    title: string;
    x: number;
    y: number;
    children: string[]; // Note IDs
    color: string;
    modified: number;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type?: 'related' | 'parent' | 'criticism'; // Legacy/Semantic type
    label?: string; // Custom label text
    color?: string; // Hex color
    style?: 'solid' | 'dashed' | 'dotted';
    shape?: 'curved' | 'straight';
    arrowDirection?: 'forward' | 'reverse' | 'none';
    modified: number;
}

export interface ViewportState {
    x: number;
    y: number;
    scale: number;
}

export interface Space {
    id: string;
    name: string;
    problemStatement: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    parentSpaceId?: string;
}