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
