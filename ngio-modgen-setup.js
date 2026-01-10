#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

// make sure we have 1 argument for the setup path
if (process.argv.length < 3) {
	console.error('Usage: npx ngio-modgen-setup <project-destination-path>');
	process.exit(1);
}

let setupPath = process.argv[2];
const forceSetup = process.argv.includes('--force');

// setup path may be relative, let's make it absolute
if (!path.isAbsolute(setupPath)) {
	setupPath = path.join(process.cwd(), setupPath);
}

// get the directory path containing THIS file
const thisFileDir = path.dirname(__filename);

// check if config.js, helpers.js, or templates directory already exist
const configPath = path.join(setupPath, 'config.js');
const helpersPath = path.join(setupPath, 'helpers.js');
const templatesDir = path.join(setupPath, 'templates');

if (!forceSetup) {
    if (fs.existsSync(configPath)) {
        console.error(`Error: ${configPath} already exists.`);
        process.exit(1);
    }
    if (fs.existsSync(helpersPath)) {
        console.error(`Error: ${helpersPath} already exists.`);
        process.exit(1);
    }
    if (fs.existsSync(templatesDir)) {
        console.error(`Error: ${templatesDir} directory already exists.`);
        process.exit(1);
    }
}

// create the setup directory if it doesn't exist
fsExtra.ensureDirSync(setupPath);

// copy our sample config and helper files
fs.copyFileSync(path.join(thisFileDir, 'config.sample.js'), configPath);
fs.copyFileSync(path.join(thisFileDir, 'helpers.sample.js'), helpersPath);

// recursively copy the template_samples dir to templates
const templateSamplesDir = path.join(thisFileDir, 'template_samples');
fsExtra.copySync(templateSamplesDir, templatesDir);
