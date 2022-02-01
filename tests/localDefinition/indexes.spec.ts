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
            key: {
                foo: 1 as 1,
                bar: -1 as -1
            }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - single (2d)', () => {
        const index = {
            name: 'index1',
            key: {
                foo: '2d' as '2d'
            }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - single (2dsphere)', () => {
        const index = {
            name: 'index1',
            key: {
                foo: '2dsphere' as '2dsphere'
            }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - single (text)', () => {
        const index = {
            name: 'index1',
            key: {
                foo: 'text' as 'text'
            }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('index - single (geoHaystack)', () => {
        const index = {
            name: 'index1',
            key: {
                foo: 'geoHaystack' as 'geoHaystack'
            }
        };
        definitions.coll1 = [index];

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });
});

describe('index definition validation - failure', () => {
    let definitions: any = {};

    beforeEach(() => {
        definitions = {};
    });

    const getBuffer = () => Buffer.from(JSON.stringify(definitions));

    it('name - not a string', () => {
        const index = {
            name: 1,
            key: {}
        };
        definitions.coll1 = [index];

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('key - not an object', () => {
        const index = {
            name: '1',
            key: 1
        };
        definitions.coll1 = [index];

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('key - too deeply nested', () => {
        const index = {
            name: '1',
            key: {
                a: {
                    b: 1
                }
            }
        };
        definitions.coll1 = [index];

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('key - invalid index type', () => {
        const index = {
            name: '1',
            key: {
                a: 'foo'
            }
        };
        definitions.coll1 = [index];

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });
});
