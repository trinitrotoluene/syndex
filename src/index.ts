import { program } from 'commander';
import packageJson from '../package.json';
import { diff } from './diff';
import logger, { LogLevel } from './logger';
import { plan } from './plan';
import { sync } from './sync';

program.name(packageJson.name);
program.description(packageJson.description);
program.version(packageJson.version);
program.option('--debug', 'Enable more verbose logging');
program.hook('preAction', () => {
    program.opts().debug && logger.setLevel(LogLevel.DEBUG);
});

program.command('diff')
    .description(`
        Diffs the database for collections that need to be created for new indexes, as well as changes that need to be
        made at the collection-level to sync the state of the database with the local index definition.
    `)
    .argument('database', 'Name of the database to diff')
    .argument('path', 'Location of the JSON index definition')
    .option('-cs, --connection-string <string>', 'MongoDB connection string')
    .action(diff);

program.command('plan')
    .description(`
        Performs the diffing stage and then generates the plan that will be used to sync changes to the database. This
        command will not write the plan to the database, but is intended to be used to verify that the diff will be
        correctly applied.
    `)
    .argument('database', 'Name of the database to plan')
    .argument('path', 'Location of the JSON index definition')
    .option('-cs, --connection-string <string>', 'MongoDB connection string')
    .action(plan);

program.command('sync')
    .description(`
        Diffs, builds a plan - and then applies it to your database.
    `)
    .argument('database', 'Name of the database to sync to')
    .argument('path', 'Location of the JSON index definition')
    .option('-cs, --connection-string <string>', 'MongoDB connection string')
    .action(sync);

program.parse();
