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
import { Document } from 'mongodb';
import chalk from 'chalk';
import { readLocalDefinitionsFromFileAsync } from '../local';
import { connectToDatabaseAsync, LocalDefinitions } from '../shared';
import { CollectionDiff, diffCollections, getRemoteCollectionsAsync } from './collections';
import { diffIndexes, IndexDiff } from './indexes';
import { ICollection, IDatabase, IDatabaseClient } from '../abstractions';

export async function diff (database: any, path: any, opts: { connectionString: any; }) {
    const { connectionString } = opts;
    const localDefinition = await readLocalDefinitionsFromFileAsync(path);

    logger.info('connecting');
    let client: IDatabaseClient | undefined = undefined;
    try {
        client = await connectToDatabaseAsync(connectionString, database);
        if (!client) throw new Error('Client unexpectedly undefined');

        const db = client.getDatabase(database);
        await diffDatabaseAsync(db, localDefinition);
    } finally {
        logger.info('closing connection');
        await client?.closeAsync();
    }
}

export type DatabaseDiff = {
    collections: CollectionDiff;
    indexes: Record<string, IndexDiff>;
};

export async function diffDatabaseAsync (db: IDatabase, localDefinition: LocalDefinitions): Promise<DatabaseDiff> {
    const collections = await getRemoteCollectionsAsync(db);

    logger.info(`diffing collections for database ${chalk.blue(db.name)}`);
    const collectionDiff = diffCollections(localDefinition, collections);

    const output: DatabaseDiff = {
        collections: collectionDiff,
        indexes: {}
    };

    for (const collectionName of collectionDiff.existingCollections) {
        logger.info(`diffing indexes for collection ${chalk.blue(collectionName)}`);
        const collection = await db.getCollection(collectionName);
        const indexes = await getRemoteIndexesAsync(collection);
        output.indexes[collectionName] = diffIndexes(indexes, localDefinition[collectionName]);
    }

    return output;
}

export async function getRemoteIndexesAsync (collection: ICollection): Promise<Document[]> {
    const indexes = await collection.getIndexesAsync();
    logger.debug(`remote indexes: ${JSON.stringify(indexes)}`);
    return indexes.filter((x: any) => x.name !== '_id_');
}
