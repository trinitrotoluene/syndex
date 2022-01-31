import { z } from 'zod';
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

const IndexDefinitionValidator = z.object({
    name: z.string(),
    key: z.record(IndexPropsValidator),
    background: z.boolean().optional()
});

export interface IndexDefinition {
    name: string;
    key: IndexProps;
    background?: boolean;
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
    background: boolean;
}

export interface DeleteIndexAction {
    type: 'deleteIndex';
    collection: string;
    name: string;
}
