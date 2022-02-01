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

import { getLocalDefinitionsAsync } from '../local';
import logger from '../logger';
import { MongoClient } from 'mongodb';
import { connectToDatabaseAsync } from '../shared';
import { diffDatabase } from '../diff';
import { planDatabase } from '../plan';
import { createCollection } from './createCollection';
import { createIndex } from './createIndex';
import { deleteIndex } from './deleteIndex';

export async function sync (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await getLocalDefinitionsAsync(path);

    logger.info('connecting');
    const client = new MongoClient(connectionString);

    try {
        const db = await connectToDatabaseAsync(client, database);
        const dbDiff = await diffDatabase(db, localDefinition);
        const plan = await planDatabase(db, dbDiff);

        for (const action of plan) {
            switch (action.type) {
            case 'createCollection':
                await createCollection(db, action);
                break;
            case 'createIndex':
                await createIndex(db.collection(action.collection), action);
                break;
            case 'deleteIndex':
                await deleteIndex(db.collection(action.collection), action);
                break;
            }
        }
    } finally {
        logger.info('closing connection');
        await client.close();
    }
}
