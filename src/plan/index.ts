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
import { Db, MongoClient } from 'mongodb';
import { DatabaseDiff, diffDatabase } from '../diff';
import { connectToDatabaseAsync, Plan } from '../shared';
import { planFromCollectionDiff } from './collections';
import { planFromIndexDiff } from './indexes';
import chalk from 'chalk';

export async function plan (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await getLocalDefinitionsAsync(path);

    logger.info('connecting');
    const client = new MongoClient(connectionString);

    try {
        const db = await connectToDatabaseAsync(client, database);
        const dbDiff = await diffDatabase(db, localDefinition);
        await planDatabase(db, dbDiff);

    } finally {
        logger.info('closing connection');
        await client.close();
    }
}

export async function planDatabase(db: Db, diff: DatabaseDiff): Promise<Plan> {
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
