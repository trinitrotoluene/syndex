import { Db } from 'mongodb';
import { LocalDefinitions } from '../shared';
import logger from '../logger';
import chalk from 'chalk';

export async function getRemoteCollectionsAsync (db: Db): Promise<string[]> {
    const collections = await db.collections();
    return collections.map(x => x.collectionName);
}

export type CollectionDiff = { existingCollections: string[], newCollections: string[] };

export function diffCollections (local: LocalDefinitions, remote: string[]): CollectionDiff {
    const localCollections = Object.keys(local);

    const existingCollections = remote.filter(x => localCollections.find(y => y === x));
    const ignoredCollections = remote.filter(x => !existingCollections.find(y => y === x));
    const newCollections = localCollections.filter(x => !existingCollections.find(y => y === x));

    logger.info(`${chalk.blue('existing')} / ${chalk.gray('ignored')} / ${chalk.green('new')}`);
    logger.info(`${chalk.blue('~')}: [${chalk.blue(existingCollections.join(', '))}]`);
    logger.info(`${chalk.gray('/')}: [${chalk.gray(ignoredCollections.join(', '))}]`);
    logger.info(`${chalk.green('+')}: [${chalk.green(newCollections.join(', '))}]`);

    return {
        existingCollections,
        newCollections
    };
}
