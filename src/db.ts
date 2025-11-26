import Dexie, { type Table } from 'dexie';
import type { Note, Space, Cluster, Link } from './types';

export class InfiniteMindDB extends Dexie {
    notes!: Table<Note>;
    spaces!: Table<Space>;
    clusters!: Table<Cluster>;
    links!: Table<Link>;

    constructor() {
        super('InfiniteMindDB');
        this.version(1).stores({
            notes: 'id, type, tags, spaceId, clusterId, created, modified',
            spaces: 'id, parentSpaceId',
            clusters: 'id',
            links: 'id, sourceId, targetId'
        });
    }
}

export const db = new InfiniteMindDB();
