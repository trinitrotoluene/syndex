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

import { IndexDefinition } from '../shared';
import { Document } from 'mongodb';
import logger from '../logger';
import chalk from 'chalk';
import deepEqual from 'deep-equal';

interface IndexConflict {
    remote: IndexDefinition,
    local: IndexDefinition
}

export interface IndexDiff {
    newIndexes: IndexDefinition[],
    conflicts: IndexConflict[],
    unchanged: IndexDefinition[],
    staleIndexes: IndexDefinition[]
}

export function diffIndexes (remoteIndexes: Document[], localIndexes: IndexDefinition[]): IndexDiff {
    const conflicts: IndexConflict[] = [];
    const unchanged: IndexDefinition[] = [];

    for (const remoteIndex of remoteIndexes) {
        const localIndex = localIndexes.find(x => x.name === remoteIndex.name);
        if (!localIndex) continue;

        const conflict: IndexConflict = {
            local: localIndex,
            remote: {
                name: remoteIndex.name,
                key: remoteIndex.key
            }
        };

        if (deepEqual(conflict.local.key, conflict.remote.key)) {
            unchanged.push(conflict.local);
        } else {
            conflicts.push(conflict);
        }
    }

    const newIndexes = localIndexes.filter(x =>
        !(conflicts.find(y => y.remote.name === x.name) || unchanged.find(y => y.name === x.name))
    );
    const staleIndexes = remoteIndexes.filter(x =>
        !(conflicts.find(y => y.remote.name === x.name) || unchanged.find(y => y.name === x.name))
    ).map(x => ({
        name: x.name,
        key: x.key
    }));

    logger.info(`${chalk.white('unchanged')} / ${chalk.blue('conflict')} / ${chalk.red('stale')} / ${chalk.green('new')}`);

    unchanged.forEach(unchangedIndex => {
        logger.info(`${chalk.white('/')}: ${chalk.white(JSON.stringify(unchangedIndex))}`);
    });

    conflicts.forEach(conflict => {
        logger.info(`${chalk.blue('~     ')} : ${conflict.local.name}`);
        logger.info(`${chalk.blue('remote')} : ${chalk.blue(JSON.stringify(conflict.remote.key))}`);
        logger.info(`${chalk.blue('local ')} : ${chalk.blue(JSON.stringify(conflict.local.key))}`);
    });

    staleIndexes.forEach(index => {
        logger.info(`${chalk.red('-')}: ${chalk.red(JSON.stringify(index))}`);
    });

    newIndexes.forEach(index => {
        logger.info(`${chalk.green('+')}: ${chalk.green(JSON.stringify(index))}`);
    });

    return {
        newIndexes,
        conflicts,
        unchanged,
        staleIndexes
    };
}
