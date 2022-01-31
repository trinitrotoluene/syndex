import { Collection } from 'mongodb';
import { DeleteIndexAction } from '../shared';
import logger from '../logger';

export async function deleteIndex (collection: Collection, action: DeleteIndexAction) {
    logger.debug(`deleting index ${action.name} on collection ${action.collection}`);
    await collection.dropIndex(action.name);
}
