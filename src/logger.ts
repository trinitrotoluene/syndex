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
