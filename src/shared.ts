/**
 * Copyright 2022 trinitrotoluene
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Schema, z } from 'zod';
import { MongoClient } from 'mongodb';
import logger from './logger';
import { DatabaseClient, IDatabaseClient } from './abstractions';

export async function connectToDatabaseAsync (connectionString: string, database: string): Promise<IDatabaseClient> {
    const client = new MongoClient(connectionString);
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    logger.debug('connected');
    return DatabaseClient(client);
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
    backwards: z.boolean().optional(),
    normalization: z.boolean().optional()
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
    normalization?: boolean;
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
