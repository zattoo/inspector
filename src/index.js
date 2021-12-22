#!/usr/bin/env node
const core = require('@actions/core');

const _chalk = require('chalk') 
const utils = require('./utils.js')

const chalk = new _chalk.Instance({
    level: 3,
});

/**
 * @param {string[]} errors
 */
const outputError = (errors) => {
    errors.forEach((error) => {
        console.log(error);
    });

    throw new Error(chalk.red.bold(`\n✖ Found ${errors.length} Forbidden files/folders-names - structure must follow kebab-case style`));
};

const check = async () => {
    const config = await utils.getConfigFile();
    const ignoreList = utils.getIgnoreList(config);
    const files = await utils.getFiles(config.path, ignoreList);
    const errors = utils.testRegExp(files);

    try {
        if (errors.length) {
            outputError(errors);
            process.exit(1);
        } else {
            console.log(chalk.green.bold('✓ Structure is valid'));
            process.exit(0);
        }

    } catch (error) {
        core.setFailed(error.message);
        process.exit(1);
    }
}

check();
