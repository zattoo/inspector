import * as path from 'path';
import fse from 'fs-extra';
import glob from 'glob-promise';

import * as messages from './constants/messages.js';

const CAMEL_CASE_PATTERN = new RegExp('^([a-z0-9]*)([~/@.-][.@a-z0-9]+)*$');

/**
 * retrieve configuration file
 * @returns {Promise<Configuration>}
 */
export const getConfigFile = async () => {
    const argument = process.argv.find((arg) => arg.includes('--configFile'));

    // configFile argument is required
    if (argument) {
        const pathToFile = argument.split('=')[1];

        if ((await glob(pathToFile)).length > 0) {
            if (argument.endsWith('.json')) {
                return fse.readJSON(pathToFile);
            } else {
                const config = await import(path.join(process.cwd(), pathToFile));
                return config[Object.keys(config)[0]];
            }
        }
        throw new Error(messages.NO_CONFIG_FOR_ARGUMENT);
    }
    throw new Error(messages.NO_CONFIG_FILE);
};

/**
 * retrieve ignore list
 * @param {Configuration} config
 * @returns {string[] | undefined}
 */
export const getIgnoreList = (config) => {
    if (config.ignore && Array.isArray(config.ignore)) {
        config.ignore.forEach((word) => {
            if (typeof word !== 'string') {
                throw new Error(messages.IGNORE_WORD_NOT_STRING);
            }
        });
        return config.ignore;
    } else if (config.ignore) {
        throw new Error(messages.IGNORE_NOT_ARRAY);
    }
    return undefined;
};

/**
 * retrieve all files in the given path or root by default including dot files excluding ignoreList,
 * @param {string | undefined} directory
 * @param {string[] | undefined} ignoreList
 * @returns {Promise<string[]>}
 */
export const getFiles = (directory, ignoreList) => {
    const _directory = directory ? `${directory}/**` : '**';
    const _ignoreList = ignoreList && ignoreList.map((file) => {
        return `${_directory}/${file}`;
    });

    return glob(_directory, {
        ignore: _ignoreList,
        dot: true,
        nodir: true,
    });
};

/**
 * testing files and folders against RegExp
 * @param {string[]} files
 * @returns {string[]}
 */
export const testRegExp = (files) => {
    return files.filter((filePath) => {
        // Convert window-style backslashes to a POSIX path.
        filePath = filePath.replace('\\', '/');

        return !CAMEL_CASE_PATTERN.test(filePath);
    });
};

/** @typedef {import('./interfaces').Configuration} Configuration */
