import { DatabaseDiff, diffDatabaseAsync, getRemoteIndexesAsync } from '../src/diff';
import { assert, expect } from 'chai';
import { CollectionDiff, diffCollections, getRemoteCollectionsAsync } from '../src/diff/collections';
import { LocalDefinitions } from '../src/shared';
import { Document } from 'mongodb';
import { diffIndexes, IndexDiff } from '../src/diff/indexes';

describe('generate diff', () => {
    it('filters out _id_ from remote indexes', async () => {
        const indexes = [{
            'v': 2,
            'key': { '_id': 1 },
            'name': '_id_'
        }, {
            'v': 2,
            'key': {
                'weight': 1,
                'height': 1
            },
            'name': 'test_index',
            'background': false
        }];
        const coll: any = {
            getIndexesAsync: async () => {
                return indexes;
            }
        };

        const remotes = await getRemoteIndexesAsync(coll);
        expect(remotes.map(x => x.name)).does.not.contain('_id_');
        expect(remotes.map(x => x.name)).to.deep.eq(['test_index']);
    });

    it('maps remote collections to names', async () => {
        const colls = [
            { name: 'coll1' },
            { name: 'coll2' },
            { name: 'coll3' },
        ];

        const db: any = {
            getCollectionsAsync: async () => {
                return colls;
            }
        };

        const remotes = await getRemoteCollectionsAsync(db);
        expect(remotes).to.deep.eq(colls.map(x => x.name));
    });

    it('collection diff - ignores non-local collections', () => {
        const local: LocalDefinitions = {
            coll1: [],
            coll2: []
        };

        const expectedDiff: CollectionDiff = {
            existingCollections: ['coll1', 'coll2'],
            newCollections: [],
        };

        const diff = diffCollections(local, ['coll1', 'coll2', 'coll3']);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('collection diff - detects new local collections', () => {
        const local: LocalDefinitions = {
            coll1: [],
            coll2: []
        };

        const expectedDiff: CollectionDiff = {
            existingCollections: ['coll1'],
            newCollections: ['coll2'],
        };

        const diff = diffCollections(local, ['coll1']);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('collection diff - no local collections', () => {
        const local: LocalDefinitions = {};

        const expectedDiff: CollectionDiff = {
            existingCollections: [],
            newCollections: [],
        };

        const diff = diffCollections(local, ['coll1', 'coll2', 'coll3']);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('index diff - no conflicts', () => {
        const local: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 }
                }
            ]
        };

        const remote: Document[] = [];

        const expectedDiff: IndexDiff = {
            newIndexes: [{
                name: 'index1',
                key: { foo: 1 }
            }],
            conflicts: [],
            unchanged: [],
            staleIndexes: []
        };

        const diff = diffIndexes(remote, local.coll1);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('index diff - no conflicts, stale indexes', () => {
        const local: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 }
                }
            ]
        };

        const remote: Document[] = [{
            name: 'index2',
            key: { bar: 1 }
        }];

        const expectedDiff: IndexDiff = {
            newIndexes: [{
                name: 'index1',
                key: { foo: 1 }
            }],
            conflicts: [],
            unchanged: [],
            staleIndexes: [{
                name: 'index2',
                key: { bar: 1 }
            }]
        };

        const diff = diffIndexes(remote, local.coll1);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('index diff - conflicts', () => {
        const local: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 }
                }
            ]
        };

        const remote: Document[] = [{
            name: 'index1',
            key: { bar: 1 }
        }];

        const expectedDiff: IndexDiff = {
            newIndexes: [],
            conflicts: [{
                local: {
                    name: 'index1',
                    key: { foo: 1 }
                },
                remote: {
                    name: 'index1',
                    key: { bar: 1 }
                }
            }],
            unchanged: [],
            staleIndexes: []
        };

        const diff = diffIndexes(remote, local.coll1);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('index diff - unchanged', () => {
        const local: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 }
                }
            ]
        };

        const remote: Document[] = [{
            name: 'index1',
            key: { foo: 1 }
        }];

        const expectedDiff: IndexDiff = {
            newIndexes: [],
            conflicts: [],
            unchanged: [{
                name: 'index1',
                key: { foo: 1 }
            }],
            staleIndexes: []
        };

        const diff = diffIndexes(remote, local.coll1);
        expect(diff).to.deep.eq(expectedDiff);
    });

    it('end-to-end diff of database', async () => {
        const coll1: any = {
            name: 'coll1',
            getIndexesAsync: async () => {
                return [
                    {
                        name: 'index1',
                        key: { foo: 1 }
                    },
                    {
                        name: 'index2',
                        key: { bar: 1 }
                    }
                ];
            }
        };

        const db: any = {
            name: 'db1',
            getCollection: (name: string) => {
                if (name === 'coll1') return coll1;
                assert.fail(`unexpected collection lookup: ${name}`);
            },
            getCollectionsAsync: async () => {
                return [coll1];
            }
        };

        const local: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 }
                }
            ]
        };

        const expectedDiff: DatabaseDiff = {
            collections: {
              newCollections: [],
              existingCollections: ['coll1']
            },
            indexes: {
                coll1: {
                    newIndexes: [],
                    conflicts: [],
                    unchanged: [{
                        name: 'index1',
                        key: { foo: 1 }
                    }],
                    staleIndexes: [{
                        name: 'index2',
                        key: { bar: 1 }
                    }]
                }
            }
        };

        const diff = await diffDatabaseAsync(db, local);
        expect(diff).to.deep.eq(expectedDiff);
    });
});
