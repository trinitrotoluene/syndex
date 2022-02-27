import {it} from 'mocha';
import {Plan} from '../src/shared';
import {ICollection} from '../src/abstractions';
import {executePlanAsync} from '../src/sync';
import {expect} from 'chai';
import {CreateIndexesOptions, IndexSpecification} from 'mongodb';

describe('generate sync queries from plan', () => {
    it('createCollection calls createCollectionAsync with the correct argument', async () => {
        const plan: Plan = [
            {type: 'createCollection', name: 'coll1'}
        ];

        let calledCollName;
        const db = {
            createCollectionAsync: async (name: string) => {
                calledCollName = name;
            }
        };

        await executePlanAsync(plan, db as any);
        expect(calledCollName).to.eq('coll1');
    });

    it('createIndex calls createIndexAsync with the correct arguments', async () => {
        const plan: Plan = [
            {type: 'createIndex', collection: 'coll1', name: 'index1', key: {a: 1}, options: {}}
        ];

        let calledColl, calledSpec, calledOptions;

        const db = {
            getCollection: async (name: string): Promise<ICollection> => {
                calledColl = name;
                return {
                    name: 'coll1',
                    createIndexAsync: async (spec: IndexSpecification, options: CreateIndexesOptions) => {
                        calledSpec = spec;
                        calledOptions = options;
                    }
                } as any;
            }
        };

        await executePlanAsync(plan, db as any);
        expect(calledColl).to.eq('coll1');
        expect(calledSpec).to.deep.eq({a: 1});
        expect(calledOptions).to.deep.eq({name: 'index1'});
    });

    it('deleteIndex calls dropIndexAsync with correct arguments', async () => {
        const plan: Plan = [
            {type: 'deleteIndex', collection: 'coll1', name: 'index1'}
        ];

        let calledColl;
        let calledIndex;

        const db = {
            getCollection: async (name: string): Promise<ICollection> => {
                calledColl = name;
                return {
                    name: 'coll1',
                    dropIndexAsync: async (name: string) => {
                        calledIndex = name;
                    }
                } as any;
            }
        };

        await executePlanAsync(plan, db as any);
        expect(calledColl).to.eq('coll1');
        expect(calledIndex).to.eq('index1');
    });
});