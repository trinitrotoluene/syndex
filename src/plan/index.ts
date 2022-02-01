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
import { Db, MongoClient } from 'mongodb';
import { DatabaseDiff, diffDatabaseAsync } from '../diff';
import { connectToDatabaseAsync, Plan } from '../shared';
import { planFromCollectionDiff } from './collections';
import { planFromIndexDiff } from './indexes';
import chalk from 'chalk';
import { IDatabaseClient } from '../abstractions';

export async function plan (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await readLocalDefinitionsFromFileAsync(path);

    logger.info('connecting');
    let client: IDatabaseClient | undefined = undefined;
    try {
        client = await connectToDatabaseAsync(connectionString, database);
        if (!client) throw new Error('Client unexpectedly undefined');

        const db = client.getDatabase(database);
        const dbDiff = await diffDatabaseAsync(db, localDefinition);
        await planDatabase(dbDiff);

    } finally {
        logger.info('closing connection');
        await client?.closeAsync();
    }
}

export async function planDatabase(diff: DatabaseDiff): Promise<Plan> {
    let plan = planFromCollectionDiff([], diff.collections);
    for (const collectionName in diff.indexes) {
        plan = planFromIndexDiff(plan, diff.indexes[collectionName], collectionName);
    }

    logger.info('plan summary');
    plan.forEach(action => {
        switch (action.type) {
        case 'deleteIndex':
            logger.info(`${chalk.red('-')}: ${chalk.red(JSON.stringify(action))}`);
            break;
        case 'createIndex':
        case 'createCollection':
            logger.info(`${chalk.green('+')}: ${chalk.green(JSON.stringify(action))}`);
            break;
        default:
            logger.info(`?: ${JSON.stringify(action)}`);
            break;
        }
    });

    return plan;
}
