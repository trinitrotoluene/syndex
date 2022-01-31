import chalk from 'chalk';

export enum LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

type MapFn = (str: string) => string;

class Logger {
    logLevel: LogLevel = LogLevel.INFO;

    setLevel (level: LogLevel) {
        this.logLevel = level;
    }

    debug (str: string) {
        this.log(str, chalk.gray, LogLevel.DEBUG);
    }

    info (str: string) {
        this.log(str, chalk.white, LogLevel.INFO);
    }

    warn (str: string) {
        this.log(str, chalk.yellow, LogLevel.WARN);
    }

    error (str: string) {
        this.log(str, chalk.red, LogLevel.ERROR);
    }

    log (str: string, mapFn: MapFn, level: LogLevel) {
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        this.logLevel <= level && console.log(timeStr + ' ' + mapFn(str));
    }
}

export default new Logger();
