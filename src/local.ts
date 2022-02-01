import { LocalDefinitions, LocalDefinitionsValidator } from './shared';
import logger from './logger';
import chalk from 'chalk';

const { promises: fs } = require('fs');

export async function readLocalDefinitionsFromFileAsync (path: string): Promise<LocalDefinitions> {
    logger.info(`reading index definitions from '${chalk.blue(path)}'`);
    const buffer = await fs.readFile(path);
    return getLocalDefinitionsFromBuffer(buffer)
}

export function getLocalDefinitionsFromBuffer(buffer: Buffer): LocalDefinitions {
    const inputJson = JSON.parse(buffer.toString());
    const definitions =  LocalDefinitionsValidator.parse(inputJson);

    logger.debug('local index definitions:');
    logger.debug(JSON.stringify(definitions));

    return definitions;
}
