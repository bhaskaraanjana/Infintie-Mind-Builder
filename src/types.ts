export type NoteType = 'fleeting' | 'literature' | 'permanent' | 'hub';

export interface Note {
    id: string;
    type: NoteType;
    x: number;
    y: number;
    title: string;
    content: string;
    tags: string[];
    source?: string;
    spaceId?: string;
    clusterId?: string;
    created: number; // Timestamp
    modified: number; // Timestamp
    references: string[]; // IDs of referenced notes
}

export interface Cluster {
    id: string;
    title: string;
    x: number;
    y: number;
    children: string[]; // Note IDs
    color: string;
}

export interface Link {
    id: string;
    sourceId: string;
    targetId: string;
    type?: 'related' | 'parent' | 'criticism';
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