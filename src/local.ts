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

import { LocalDefinitions, LocalDefinitionsValidator } from './shared';
import logger from './logger';
import chalk from 'chalk';

import { promises as fs } from 'fs';

export async function getLocalDefinitionsAsync (path: string): Promise<LocalDefinitions> {
    logger.info(`reading index definitions from '${chalk.blue(path)}'`);
    const buffer = await fs.readFile(path);
    const inputJson = JSON.parse(buffer.toString());
    const definitions =  LocalDefinitionsValidator.parse(inputJson);

    logger.debug('local index definitions:');
    logger.debug(JSON.stringify(definitions));

    return definitions;
}
