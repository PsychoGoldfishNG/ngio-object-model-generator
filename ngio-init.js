#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

// make sure we have 1 argument for the setup path
if (process.argv.length < 3) {
	console.error('Usage: npx ngio-init <project-destination-path>');
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

// check if config.js or helpers.js already exist
const configPath = path.join(setupPath, 'config.js');
const helpersPath = path.join(setupPath, 'helpers.js');
const gettingStartedPath = path.join(setupPath, 'GETTING_STARTED.txt');

if (!forceSetup) {
    if (fs.existsSync(configPath)) {
        console.error(`Error: ${configPath} already exists.`);
        process.exit(1);
    }
    if (fs.existsSync(helpersPath)) {
        console.error(`Error: ${helpersPath} already exists.`);
        process.exit(1);
    }
}

// create the setup directory if it doesn't exist
fsExtra.ensureDirSync(setupPath);

// copy our sample config and helper files
fs.copyFileSync(path.join(thisFileDir, 'samples/config.js'), configPath);
fs.copyFileSync(path.join(thisFileDir, 'samples/helpers.js'), helpersPath);
fs.copyFileSync(path.join(thisFileDir, 'samples/GETTING_STARTED.txt'), gettingStartedPath);

console.log('\nProject initialized successfully!');
console.log('\nFiles created:');
console.log('  - config.js');
console.log('  - helpers.js');
console.log('  - GETTING_STARTED.txt');
console.log('\nNext steps:');
console.log('1. Read GETTING_STARTED.txt for a complete overview');
console.log('2. Edit config.js - Set your target language and paths');
console.log('3. Edit helpers.js - Customize type conversions for your language');
console.log('4. Run: npx ngio-scaffold <path-to-config.js>');
console.log('   This will create template and skeleton files.\n');
