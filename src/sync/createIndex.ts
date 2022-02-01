import { Collection } from 'mongodb';
import { CreateIndexAction } from '../shared';
import logger from '../logger';

export async function createIndex (collection: Collection, action: CreateIndexAction) {
    logger.debug(`creating index ${action.name} on collection ${action.collection}`);
    await collection.createIndex(action.key, {
        name: action.name,
        ...action.options
    });
}
