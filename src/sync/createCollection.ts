import { Db } from 'mongodb';
import { CreateCollectionAction } from '../shared';
import logger from '../logger';

export async function createCollection (db: Db, action: CreateCollectionAction) {
    logger.debug(`creating collection ${action.name}`);
    await db.createCollection(action.name);
}
