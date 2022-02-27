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

import { readLocalDefinitionsFromFileAsync } from '../local';
import logger from '../logger';
import {connectToDatabaseAsync, Plan} from '../shared';
import { diffDatabaseAsync } from '../diff';
import { planDatabase } from '../plan';
import { createCollection } from './createCollection';
import { createIndex } from './createIndex';
import { deleteIndex } from './deleteIndex';
import {IDatabase, IDatabaseClient} from '../abstractions';

export async function sync (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await readLocalDefinitionsFromFileAsync(path);

    logger.info('connecting');
    let client: IDatabaseClient | undefined = undefined;
    try {
        client = await connectToDatabaseAsync(connectionString);
        if (!client) throw new Error('Client unexpectedly undefined');

        const db = client.getDatabase(database);
        const dbDiff = await diffDatabaseAsync(db, localDefinition);
        const plan = await planDatabase(dbDiff);

        await executePlanAsync(plan, db);
    } finally {
        logger.info('closing connection');
        await client?.closeAsync();
    }
}

export async function executePlanAsync(plan: Plan, db: IDatabase) {
    for (const action of plan) {
        switch (action.type) {
        case 'createCollection':
            await createCollection(db, action);
            break;
        case 'createIndex':
            await createIndex(await db.getCollection(action.collection), action);
            break;
        case 'deleteIndex':
            await deleteIndex(await db.getCollection(action.collection), action);
            break;
        }
    }
}
