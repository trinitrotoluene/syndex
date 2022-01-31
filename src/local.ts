import { LocalDefinitions, LocalDefinitionsValidator } from './shared';
import logger from './logger';
import chalk from 'chalk';

const { promises: fs } = require('fs');

export async function getLocalDefinitionsAsync (path: string): Promise<LocalDefinitions> {
    logger.info(`reading index definitions from '${chalk.blue(path)}'`);
    const buffer = await fs.readFile(path);
    const inputJson = JSON.parse(buffer);
    const definitions =  LocalDefinitionsValidator.parse(inputJson);

    logger.debug('local index definitions:');
    logger.debug(JSON.stringify(definitions));

    return definitions;
}
