import { Schema, z } from 'zod';
import { Db, MongoClient } from 'mongodb';
import logger from './logger';

export async function connectToDatabaseAsync (client: MongoClient, database: string): Promise<Db> {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    logger.debug('connected');
    return client.db(database);
}

const IndexPropsValidator = z.union([z.literal(1), z.literal(-1)]);

interface IndexProps {
    [key: string]: 1 | -1;
}

const CollationOptionsValidator: Schema<CollationOptions> = z.object({
    locale: z.string(),
    caseLevel: z.boolean().optional(),
    caseFirst: z.string().optional(),
    strength: z.number().optional(),
    numericOrdering: z.boolean().optional(),
    alternate: z.string().optional(),
    maxVariable: z.string().optional(),
    backwards: z.boolean().optional()
});

interface CollationOptions {
    locale: string;
    caseLevel?: boolean;
    caseFirst?: string;
    strength?: number;
    numericOrdering?: boolean;
    alternate?: string;
    maxVariable?: string;
    backwards?: boolean;
}

const IndexOptionsValidator: Schema<IndexOptions> = z.object({
    background: z.boolean().optional(),
    unique: z.boolean().optional(),
    sparse: z.boolean().optional(),
    expireAfterSeconds: z.number().optional(),
    weights: z.record(z.number()).optional(),
    collation: CollationOptionsValidator.optional()
});

interface IndexOptions {
    background?: boolean;
    unique?: boolean;
    sparse?: boolean;
    expireAfterSeconds?: number;
    weights?: Record<string, number>;
    collation?: CollationOptions;
}

const IndexDefinitionValidator: Schema<IndexDefinition> = z.object({
    name: z.string(),
    key: z.record(IndexPropsValidator),
    options: IndexOptionsValidator.optional()
});

export interface IndexDefinition {
    name: string;
    key: IndexProps;
    options?: IndexOptions;
}

export const LocalDefinitionsValidator = z.record(z.array(IndexDefinitionValidator));

export interface LocalDefinitions {
    [collection: string]: IndexDefinition[];
}

export type Plan = Action[];

export type Action =
    | CreateCollectionAction
    | CreateIndexAction
    | DeleteIndexAction;

export interface CreateCollectionAction {
    type: 'createCollection';
    name: string;
}

export interface CreateIndexAction {
    type: 'createIndex';
    collection: string;
    name: string;
    key: IndexProps;
    options: IndexOptions;
}

export interface DeleteIndexAction {
    type: 'deleteIndex';
    collection: string;
    name: string;
}
