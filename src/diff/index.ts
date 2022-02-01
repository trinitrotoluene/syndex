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

import logger from '../logger';
import { Collection, Db, Document, MongoClient } from 'mongodb';
import chalk from 'chalk';
import { getLocalDefinitionsAsync } from '../local';
import { connectToDatabaseAsync, LocalDefinitions } from '../shared';
import { CollectionDiff, diffCollections, getRemoteCollectionsAsync } from './collections';
import { diffIndexes, IndexDiff } from './indexes';

export async function diff (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await getLocalDefinitionsAsync(path);

    logger.info('connecting');
    const client = new MongoClient(connectionString);

    try {
        const db = await connectToDatabaseAsync(client, database);
        await diffDatabase(db, localDefinition);
    } finally {
        logger.info('closing connection');
        await client.close();
    }
}

export type DatabaseDiff = {
    collections: CollectionDiff,
    indexes: Record<string, IndexDiff>
};

export async function diffDatabase (db: Db, localDefinition: LocalDefinitions): Promise<DatabaseDiff> {
    const collections = await getRemoteCollectionsAsync(db);

    logger.info(`diffing collections for database ${chalk.blue(db.databaseName)}`);
    const collectionDiff = diffCollections(localDefinition, collections);

    const output: DatabaseDiff = {
        collections: collectionDiff,
        indexes: {}
    };

    for (const collectionName of collectionDiff.existingCollections) {
        logger.info(`diffing indexes for collection ${chalk.blue(collectionName)}`);
        const collection = db.collection(collectionName);
        const indexes = await getRemoteIndexesAsync(collection);
        output.indexes[collectionName] = diffIndexes(indexes, localDefinition[collectionName]);
    }

    return output;
}

async function getRemoteIndexesAsync (collection: Collection): Promise<Document[]> {
    const indexes = await collection.indexes();
    return indexes.filter(x => x.name !== '_id_');
}
