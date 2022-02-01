import { LocalDefinitions } from '../../src/shared';
import { readLocalDefinitionsFromFileAsync } from '../../src/local';
import { expect } from 'chai';

describe('read local definitions from file - success', () => {
    it('reads tests/indexes.json correctly', async () => {
        const expectedDefinitions: LocalDefinitions = {
            coll1: [
                {
                    name: 'index1',
                    key: { foo: 1 },
                    options: {
                        background: true
                    }
                }
            ]
        };

        const definition = await readLocalDefinitionsFromFileAsync('tests/indexes.json');
        expect(definition).to.deep.eq(expectedDefinitions);
    });
});
