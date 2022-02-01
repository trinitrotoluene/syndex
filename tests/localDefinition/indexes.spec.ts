import { LocalDefinitions } from '../../src/shared';
import { expect } from 'chai';
import { getLocalDefinitionsFromBuffer } from '../../src/local';

describe('index definition validation - success', () => {
    let definitions: LocalDefinitions = {};

    beforeEach(() => {
        definitions = {};
    });

    const getBuffer = () => Buffer.from(JSON.stringify(definitions));

    it('index - single (1)', () => {
        const index = {
            name: 'index1',
            key: { foo: 1 as 1 }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - single (-1)', () => {
        const index = {
            name: 'index1',
            key: { foo: -1 as -1 }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - compound (1, -1)', () => {
        const index = {
            name: 'index1',
            key: { foo: 1 as 1, bar: -1 as -1 }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });
});

describe('index definition validation - failure', () => {

});
