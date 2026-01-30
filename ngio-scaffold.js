#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');

// We expect one argument: the path to the config file
if (process.argv.length < 3) {
    console.error("Usage: npx ngio-scaffold <path-to-config-file>\n\nThis will create template and skeleton files based on your config.\nRun 'npx ngio-init <project-destination-path>' to create a config file first.");
    process.exit(1);
}

let config_file = process.argv[2];
const forceScaffold = process.argv.includes('--force');

// if config file isn't being loaded with an absolute path, we assume it's relative to the current working directory
if (!path.isAbsolute(config_file)) {
    config_file = path.join(process.cwd(), config_file);
}

// make sure config_file exists
if (!fs.existsSync(config_file)) {
    console.error(`Config file not found: ${config_file}`);
    process.exit(1);
}

// if config_file is a directory, we assume the config.js file is inside it
if (fs.lstatSync(config_file).isDirectory()) {
    config_file = path.join(config_file, 'config.js');

    // but, does it exist?
    if (!fs.existsSync(config_file)) {
        console.error(`Config file not found in directory: ${config_file}`);
        process.exit(1);
    }
}

// load the config file
console.log("NGIO Scaffold - Loading config file:", config_file);
const config = require(config_file);

// get the directory the config file is in
const configDir = path.dirname(config_file);

// get the directory path containing THIS file (the ngio-scaffold.js script)
const thisFileDir = path.dirname(__filename);

console.log("\n=== Scaffolding Templates ===\n");

// Copy template files from samples/templates to the user's template directory
const sampleTemplatesDir = path.join(thisFileDir, 'samples/templates');
const targetTemplateDir = config.template_dir;

if (!forceScaffold && fs.existsSync(targetTemplateDir)) {
    console.error(`Error: Template directory already exists: ${targetTemplateDir}`);
    console.error(`Use --force to overwrite existing files.`);
    process.exit(1);
}

// Ensure the target template directory exists
fsExtra.ensureDirSync(targetTemplateDir);

// Copy all template files
console.log(`Copying template files to: ${targetTemplateDir}`);
fsExtra.copySync(sampleTemplatesDir, targetTemplateDir);
console.log("✓ Templates copied successfully");

console.log("\n=== Scaffolding Core/Skeleton Files ===\n");

// Check if core file generation is enabled
if (!config.core_files || !config.core_files.enabled) {
    console.log("Core file generation is disabled in config. Skipping skeleton files.");
} else {
    // Map of skeleton file names in samples/skeletons to config keys
    const skeletonMapping = {
        'NGIO.pseudo': 'NGIO',
        'NewgroundsIO/Core.pseudo': 'Core',
        'NewgroundsIO/Errors.pseudo': 'Errors',
        'NewgroundsIO/AppState.pseudo': 'AppState',
        'NewgroundsIO/SessionStatus.pseudo': 'SessionStatus',
        'NewgroundsIO/models/BaseObject.pseudo': 'BaseObject',
        'NewgroundsIO/models/BaseComponent.pseudo': 'BaseComponent',
        'NewgroundsIO/models/BaseResult.pseudo': 'BaseResult',
        'IMPLEMENTATION-GUIDE.txt': 'ImplementationGuide'
    };

    const sampleSkeletonsDir = path.join(thisFileDir, 'samples/skeletons');

    for (const [skeletonPath, configKey] of Object.entries(skeletonMapping)) {
        // Check if this skeleton is defined in the config
        if (!config.core_files.files || !config.core_files.files[configKey]) {
            // ImplementationGuide is optional, so don't warn if missing
            if (configKey !== 'ImplementationGuide') {
                console.log(`Skipping ${configKey}: not defined in config`);
            }
            continue;
        }

        // Get the target path from the config
        const targetPath = config.core_files.files[configKey](config);
        const sourcePath = path.join(sampleSkeletonsDir, skeletonPath);

        // Check if source skeleton exists
        if (!fs.existsSync(sourcePath)) {
            console.warn(`Warning: Skeleton file not found: ${sourcePath}`);
            continue;
        }

        // Check if target already exists and overwrite is disabled
        if (!forceScaffold && !config.core_files.overwrite && fs.existsSync(targetPath)) {
            console.log(`Skipping ${configKey}: file already exists at ${targetPath}`);
            continue;
        }

        // Ensure target directory exists
        fsExtra.ensureDirSync(path.dirname(targetPath));

        // Copy the skeleton file
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✓ Created ${configKey}: ${targetPath}`);
    }

    console.log("\nCore/skeleton files scaffolded successfully!");
}

console.log("\n=== Scaffolding Complete ===\n");
console.log("Next steps:");
console.log("1. Review TEMPLATE_GUIDE.txt in:", targetTemplateDir);
console.log("2. Customize the template files in:", targetTemplateDir);
console.log("3. Translate the skeleton files from pseudo-code to your target language");
console.log("4. Run: npx ngio-build <path-to-config.js>");
console.log("   This will generate the final model files.\n");
