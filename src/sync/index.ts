import { readLocalDefinitionsFromFileAsync } from '../local';
import logger from '../logger';
import { MongoClient } from 'mongodb';
import { connectToDatabaseAsync } from '../shared';
import { diffDatabase } from '../diff';
import { planDatabase } from '../plan';
import { createCollection } from './createCollection';
import { createIndex } from './createIndex';
import { deleteIndex } from './deleteIndex';

export async function sync (database: any, path: any, opts: { connectionString: any; }) {
    let { connectionString } = opts;
    const localDefinition = await readLocalDefinitionsFromFileAsync(path);

    logger.info('connecting');
    const client = new MongoClient(connectionString);

    try {
        const db = await connectToDatabaseAsync(client, database);
        const dbDiff = await diffDatabase(db, localDefinition);
        const plan = await planDatabase(db, dbDiff);

        for (let action of plan) {
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
