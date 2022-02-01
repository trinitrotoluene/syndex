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

import { Db } from 'mongodb';
import { LocalDefinitions } from '../shared';
import logger from '../logger';
import chalk from 'chalk';
import { IDatabase } from '../abstractions';

export async function getRemoteCollectionsAsync (db: IDatabase): Promise<string[]> {
    const collections = await db.getCollectionsAsync();
    return collections.map(x => x.name);
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
