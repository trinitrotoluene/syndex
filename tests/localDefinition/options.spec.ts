import { LocalDefinitions } from '../../src/shared';
import { expect } from 'chai';
import { getLocalDefinitionsFromBuffer } from '../../src/local';

let definitionTemplate: LocalDefinitions = {
    coll1: [
        {
            name: 'index1',
            key: { weight: 1 },
        }
    ]
};

describe('index options validation - success', () => {
    let definitions = definitionTemplate;

    beforeEach(() => {
        definitions = definitionTemplate;
    });

    const getBuffer = () => Buffer.from(JSON.stringify(definitions));

    it('background', async () => {
        definitions.coll1[0].options = {
            background: true
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('unique', async () => {
        definitions.coll1[0].options = {
            unique: true
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('sparse', async () => {
        definitions.coll1[0].options = {
            sparse: true
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('expireAfterSeconds', async () => {
        definitions.coll1[0].options = {
            expireAfterSeconds: 500
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('weights', async () => {
        definitions.coll1[0].options = {
            weights: {
                weight1: 5,
                weight2: 10
            }
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });

    it('collation', async () => {
        definitions.coll1[0].options = {
            collation: {
                locale: 'en',
                strength: 5,
                caseLevel: true,
                caseFirst: 'upper',
                numericOrdering: true,
                alternate: 'non-ignorable',
                maxVariable: 'space',
                backwards: false,
                normalization: false
            }
        };

        expect(getLocalDefinitionsFromBuffer(getBuffer())).to.deep.eq(definitions);
    });
});

describe('index options validation - failure', () => {
    let definitions: any = definitionTemplate;

    beforeEach(() => {
        definitions = definitionTemplate;
    });

    const getBuffer = () => Buffer.from(JSON.stringify(definitions));

    it('background - not a boolean', () => {
        definitions.coll1[0].options = {
            background: 1
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('unique - not a boolean', () => {
        definitions.coll1[0].options = {
            unique: 1
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('sparse - not a boolean', () => {
        definitions.coll1[0].options = {
            background: 1
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('expireAfterSeconds - not a number', () => {
        definitions.coll1[0].options = {
            expireAfterSeconds: '1'
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('weights - record value not a number', () => {
        definitions.coll1[0].options = {
            weights: {
                weight1: '1'
            }
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('weights - not a record', () => {
        definitions.coll1[0].options = {
            weights: 1
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('collation - unknown option', () => {
        definitions.coll1[0].options = {
            collation: {
                unknownOption: 1
            }
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });

    it('collation - not a record', () => {
        definitions.coll1[0].options = {
            collation: 1
        };

        expect(() => getLocalDefinitionsFromBuffer(getBuffer())).to.throw();
    });
});
