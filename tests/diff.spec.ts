import { getLocalDefinitionsAsync } from '../src/local';
import { assert, expect } from 'chai';

describe('diff - success', () => {
    it('Reads the sample file', async () => {
        const localDefs = await getLocalDefinitionsAsync('tests/indexes.json');
        expect(Object.keys(localDefs)).to.deep.eq(['test2']);
        const vals = localDefs['test2'];
        expect(vals).to.deep.eq([{
            name: 'test_index',
            key: {
                height: 1,
                weight: 1
            }
        }]);
    });
});

describe('diff - failure', () => {
    it('Throws with keys with non-array values', async () => {
        try {
            await getLocalDefinitionsAsync('tests/indexes_non_array_values.json');
            assert.fail();
        } catch (e) {
        }
    });

    it('Throws with malformed index objects', async () => {
        try {
            await getLocalDefinitionsAsync('tests/indexes_malformed_indexes.json');
            assert.fail();
        } catch (e) {
        }
    });
});
