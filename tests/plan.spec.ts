import {describe} from 'mocha';
import {Plan} from '../src/shared';
import {planFromCollectionDiff} from '../src/plan/collections';
import {CollectionDiff} from '../src/diff/collections';
import {expect} from 'chai';
import {planFromIndexDiff} from '../src/plan/indexes';
import {IndexDiff} from '../src/diff/indexes';
import {DatabaseDiff} from '../src/diff';
import {planDatabase} from '../src/plan';

describe('generate plan - collection diffs', () => {
    const newCollectionsDiff: CollectionDiff = {
        newCollections: ['coll1'],
        existingCollections: []
    };

    const existingCollectionsOnlyDiff: CollectionDiff = {
        newCollections: [],
        existingCollections: ['coll1']
    };

    const newAndExistingCollectionsDiff: CollectionDiff = {
        newCollections: ['coll1'],
        existingCollections: ['coll2']
    };

    it('new collections', () => {
        const expectedPlan: Plan = [
            {type: 'createCollection', name: 'coll1'}
        ];

        const generatedPlan = planFromCollectionDiff([], newCollectionsDiff);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('existing collections only', () => {
        const expectedPlan: Plan = [];
        const generatedPlan = planFromCollectionDiff([], existingCollectionsOnlyDiff);

        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('new and existing collections', () => {
        const expectedPlan: Plan = [
            {type: 'createCollection', name: 'coll1'}
        ];

        const generatedPlan = planFromCollectionDiff([], newAndExistingCollectionsDiff);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });
});

describe('generate plan - index diffs', () => {
    const collName = 'coll1';

    const noIndexes: IndexDiff = {
        newIndexes: [],
        staleIndexes: [],
        conflicts: [],
        unchanged: []
    };

    const unchangedIndexes: IndexDiff = {
        newIndexes: [],
        staleIndexes: [],
        conflicts: [],
        unchanged: [{
            name: 'index1',
            key: {a: 1},
            options: {}
        }]
    };

    const newIndexes: IndexDiff = {
        newIndexes: [{
            name: 'index1',
            key: {a: 1},
            options: {}
        }],
        staleIndexes: [],
        conflicts: [],
        unchanged: []
    };

    const staleIndexes: IndexDiff = {
        newIndexes: [],
        staleIndexes: [{
            name: 'index1',
            key: {a: 1},
            options: {}
        }],
        conflicts: [],
        unchanged: []
    };

    const conflictedIndexes: IndexDiff = {
        newIndexes: [],
        staleIndexes: [],
        conflicts: [{
            remote: {
                name: 'index1',
                key: {a: 1},
                options: {}
            },
            local: {
                name: 'index1',
                key: {b: 1},
                options: {}
            }
        }],
        unchanged: []
    };

    it('no indexes', () => {
        const expectedPlan: Plan = [];
        const generatedPlan = planFromIndexDiff([], noIndexes, collName);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('unchanged indexes only', () => {
        const expectedPlan: Plan = [];
        const generatedPlan = planFromIndexDiff([], unchangedIndexes, collName);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('new indexes only', () => {
        const expectedPlan: Plan = [{
            type: 'createIndex',
            collection: collName,
            name: 'index1',
            key: {a: 1},
            options: {}
        }];

        const generatedPlan = planFromIndexDiff([], newIndexes, collName);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('stale indexes only', () => {
        const expectedPlan: Plan = [{
            type: 'deleteIndex',
            collection: collName,
            name: 'index1'
        }];

        const generatedPlan = planFromIndexDiff([], staleIndexes, collName);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });

    it('conflicts only', () => {
        const expectedPlan: Plan = [
            {
                type: 'deleteIndex',
                collection: collName,
                name: 'index1'
            },
            {
                type: 'createIndex',
                collection: collName,
                name: 'index1',
                key: {b: 1},
                options: {}
            }
        ];

        const generatedPlan = planFromIndexDiff([], conflictedIndexes, collName);
        expect(generatedPlan).to.deep.eq(expectedPlan);
    });
});

describe('generate plan', () => {
    const diff: DatabaseDiff = {
        collections: {
            existingCollections: ['coll1', 'coll2'],
            newCollections: ['coll3', 'coll4']
        },
        indexes: {
            coll1: {
                unchanged: [{name: 'index1', key: {a: 1}}],
                newIndexes: [
                    {name: 'index2', key: {b: 1}},
                    {name: 'index3', key: {c: 1}, options: {background: true}}
                ],
                conflicts: [{
                    remote: {name: 'index4', key: {d: 1}},
                    local: {name: 'index4', key: {d: 1, e: 1}}
                }],
                staleIndexes: [{name: 'index5', key: {f: 1}}]
            }
        },
    };

    it('end to end plan generation', async () => {
        const expectedPlan: Plan = [
            {type: 'createCollection', name: 'coll3'},
            {type: 'createCollection', name: 'coll4'},
            {type: 'deleteIndex', collection: 'coll1', name: 'index5'},
            {type: 'deleteIndex', collection: 'coll1', name: 'index4'},
            {type: 'createIndex', collection: 'coll1', name: 'index4', key: {d: 1, e: 1}, options: {}},
            {type: 'createIndex', collection: 'coll1', name: 'index2', key: {b: 1}, options: {}},
            {type: 'createIndex', collection: 'coll1', name: 'index3', key: {c: 1}, options: {background: true}},
        ];
        const plan = await planDatabase(diff);

        expect(plan).to.deep.eq(expectedPlan);
    });
});