#!/usr/bin/env node
'use strict';

const fs = require('fs');
const https = require('https');
const chokidar = require('chokidar');
const path = require('path');

// We use the more advanced ejs when generating from model templates
const ejs = require('ejs');

// the object documentation is available in a json file at this url (it gets updated as new features are added to the API)
const object_doc_url = "https://www.newgrounds.io/help/objects_and_components.json";

// we'll download a local version of the documentation here
const object_doc_file = path.join(__dirname, 'docs', 'objects_and_components.json');

// We'll store when the documentation was last updated here.  We use this to avoid re-downloading it if we don't need to.
const object_doc_stamp = path.join(__dirname, 'docs', 'last_updated');

// We expect one argument: the path to the config file
if (process.argv.length < 3) {
    console.error("Usage: npx ngio-build <path-to-config-file>\n\nRun 'npx ngio-init <project-destination-path>' to create a new setup first.");
    process.exit(1);
}
let config_file = process.argv[2];

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
console.log("NGIO Model Builder - Loading config file:", config_file);
const config = require(config_file);

const fileExt = config.output_file_extension;

// get the directory our partials are in
const partialDir = path.normalize(config.partials_dir);

/**
 * This object has methods for loading and rendering partial templates within our outer templates.
 */
const partial = {

    /**
     * Checks if a partial template file exists.
     * @param {string} partial The name of the partial template (without extension).
     * @return {boolean} True if the partial exists, false otherwise.
     */
    has(partial) {
        const partialFile = path.join(partialDir, `${partial}.ejs`);
        return fs.existsSync(partialFile);
    },

    /**
     * Loads a partial template file and returns its content.
     * @param {string} partial The name of the partial template (without extension).
     * @param {object} data The data to render the template with.
     * @returns {string} The rendered content of the partial template.
     * @throws {Error} If the partial template file does not exist.
     */
    get(partial, data) {

        const partialFile = path.join(partialDir, `${partial}.ejs`);
        if (!this.has(partial)) {
            throw new Error(`Partial template not found: ${partialFile}`);
        }

        const template = fs.readFileSync(partialFile, 'utf8');
        try {
            return ejs.render(template, data);
        } catch (err) {
            throw new Error(`Error rendering partial template: ${partialFile}\n${err.message}`);
        }
    },

    /**
     * Gets the content of a partial template if it exists, otherwise returns an empty string.
     * @param {string} partial The name of the partial template (without extension).
     * @param {object} data The data to render the template with.
     * @returns {string} The rendered content of the partial template, or an empty string if it doesn't exist.
     */
    getIfExists(partial, data) {
        if (this.has(partial)) {
            return this.get(partial, data);
        }
        return "";
    }
};

/**
 * Fetches the last-modified header from a URL.
 * @param {string} url 
 * @returns {Promise<string>} A promise that resolves to the last-modified date string.
 * @throws {Error} If the request fails.
 */
function getLastModified(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            resolve(res.headers["last-modified"]);
        }).on('error', (err) => {
            if (fs.existsSync(object_doc_stamp)) {
                console.warn(`Warning: Failed to download object documentation (${err.message}), using existing documentation.`);
                resolve(fs.readFileSync(object_doc_stamp, "utf8"));
            } else {
                reject(err);
            }
        });
    });
}

/**
 * @returns {Promise<void>} A promise that resolves when the object documentation is downloaded.
 * @throws {Error} If the download fails.
 */
function downloadObjectDocAsync() {
    return new Promise((resolve, reject) => {
        https.get(object_doc_url, (res) => {

            let error = null;
            if (res.statusCode !== 200) {
                error = new Error(`Failed to download object documentation: ${res.statusCode} ${res.statusMessage}`);
            } else if (!res.headers['content-type'] || !res.headers['content-type'].includes('application/json')) {
                error = new Error(`Invalid content type for object documentation: ${res.headers['content-type']}`);
            }

            if (error) {
                if (fs.existsSync(object_doc_file)) {
                    console.warn(`Warning: Failed to download object documentation (${error.message}), using existing documentation.`);
                    resolve();
                }
                return reject(error);
            }
            
            // make sure object_doc_file target directory exists, create if needed
            if (!fs.existsSync(path.dirname(object_doc_file))) {
                fs.mkdirSync(path.dirname(object_doc_file), { recursive: true });
            }

            const file = fs.createWriteStream(object_doc_file);
            res.pipe(file);
            file.on("finish", () => {
                file.close();
                fs.writeFileSync(object_doc_stamp, res.headers["last-modified"]);
                resolve();
            });
        }).on('error', (err) => {
            if (fs.existsSync(object_doc_file)) {
                console.warn(`Warning: Failed to download object documentation (${err.message}), using existing documentation.`);
                resolve();
            } else {
                reject(err);
            }
        });
    });
}

/**
 * Ensures the latest object documentation is downloaded.
 * If the documentation file does not exist or is outdated, it downloads the latest version.
 * 
 * @returns {Promise<void>} A promise that resolves when the documentation is ensured to be up-to-date.
 * @throws {Error} If the download fails or the file cannot be written.
 */
async function ensureLatestObjectDoc() {
    if (!fs.existsSync(object_doc_file)) {
        console.log("Object documentation file does not exist. Downloading latest version...");
        await downloadObjectDocAsync();
    } else {
        const stamp = fs.existsSync(object_doc_stamp) ? fs.readFileSync(object_doc_stamp, "utf8") : null;
        const new_stamp = await getLastModified(object_doc_url);
        if (new_stamp && new_stamp !== stamp) {
            console.log("Object documentation is outdated. Downloading latest version...");
            await downloadObjectDocAsync();
        } else {
            console.log("Object documentation is up-to-date.");
        }
    }
}


// everything else is wrapped in an async function so we can use await...
(async () => {

    // Make sure we have the latest model documentation.
    await ensureLatestObjectDoc();

    // Load the documentation file
    const object_doc = JSON.parse(fs.readFileSync(object_doc_file, "utf8"));

    // not everything in the object documentation is a model we want to build.
    // we'll keep all the model docs we actually want to build in this object.
    const coreObjects = {};

    // build the base-level object models
    for (const name in object_doc.objects) {

        // this is more of a parent class users could build off of, not a base object.
        // we will make separate result objects for each component.
        if (name === "Result") continue;

        const object = object_doc.objects[name];
        object.name = name;

        coreObjects[name] = object;

        const templateFileName = path.normalize(config.template_files.objects(config));
        const outputFileName = path.normalize(config.model_files.objects(config, name));

        // make sure the template file exists
        if (!fs.existsSync(templateFileName)) {
            console.error(`Object template file not found: ${templateFileName}`);
            process.exit(1);
        }

        // make sure the output directory exists. Create it if it doesn't.
        const outputDir = path.dirname(outputFileName);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // run the object through the template using ejs
        const template = fs.readFileSync(templateFileName, 'utf8');
        try {
            const output = ejs.render(template, {model:object, helpers: config.helpers, partial: partial, config: config});
            fs.writeFileSync(outputFileName, output);
        } catch (err) {
            throw new Error(`Error rendering object template: ${templateFileName}\nObject: ${name}\n${err.message}`);
        }
    }

    console.log("Object models generated.");

    const resultObjects = {};
    const componentObjects = {};
    
    // split up the component and result objects
    for (const component in object_doc.components) {

        // this is more of a parent class users could build off of, not a base object.
        // we will make separate result objects for each component.
        if (component === "Result") continue;

        for (const method in object_doc.components[component].methods) {

            if (!componentObjects[component]) componentObjects[component] = {};
            componentObjects[component][method] = object_doc.components[component].methods[method];
            componentObjects[component][method].component = component;
            componentObjects[component][method].method = method;

            // the method parameters will technically be properties of the model
            // so let's key them as properties for consistency
            componentObjects[component][method].properties = componentObjects[component][method].params;

            // if this component has no return, just use an empty object.
            // it will still have a success, and possible error value, so
            // it's still useful to generate a model for it.
            if (!object_doc.components[component].methods[method].return) {
                object_doc.components[component].methods[method].return = {};
            }

            if (!resultObjects[component]) resultObjects[component] = {};

            resultObjects[component][method] = {
                properties: object_doc.components[component].methods[method].return,
                component: component,
                method: method,
            };
        }
    }

    console.log("Component models generated.");
    
    for (const component in componentObjects) {
        for (const method in componentObjects[component]) {

            const model = componentObjects[component][method];

            const templateFileName = path.normalize(config.template_files.components(config));
            const outputFileName = path.normalize(config.model_files.components(config, component, method));

            // make sure the template file exists
            if (!fs.existsSync(templateFileName)) {
                console.error(`Component template file not found: ${templateFileName}`);
                process.exit(1);
            }

            // make sure the output directory exists. Create it if it doesn't.
            const outputDir = path.dirname(outputFileName);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // run the object through the template using ejs
            const template = fs.readFileSync(templateFileName, 'utf8');
            try {
                const output = ejs.render(template, {model:model, helpers: config.helpers, partial: partial, config: config});
                fs.writeFileSync(outputFileName, output);
            } catch (err) {
                throw new Error(`Error rendering component template: ${templateFileName}\nComponent: ${component}.${method}\n${err.message}`);
            }
        }
    }
    
    for (const component in resultObjects) {
        for (const method in resultObjects[component]) {
            const result = resultObjects[component][method];
            
            const templateFileName = path.normalize(config.template_files.results(config));
            const outputFileName = path.normalize(config.model_files.results(config, component, method));

            // make sure the template file exists
            if (!fs.existsSync(templateFileName)) {
                console.error(`Results template file not found: ${templateFileName}`);
                process.exit(1);
            }

            // make sure the output directory exists. Create it if it doesn't.
            const outputDir = path.dirname(outputFileName);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // run the object through the template using ejs
            const template = fs.readFileSync(templateFileName, 'utf8');
            try {
                const output = ejs.render(template, {model:result, helpers: config.helpers, partial: partial, config: config});
                fs.writeFileSync(outputFileName, output);
            } catch (err) {
                throw new Error(`Error rendering result template: ${templateFileName}\nResult: ${component}.${method}\n${err.message}`);
            }
        }
    }

    console.log("Result models generated.");

    // see if we need to build an object index for this library
    if (config.template_files.object_factory && config.model_files.object_factory) {
        const templateFileName = path.normalize(config.template_files.object_factory(config));
        const outputFileName = path.normalize(config.model_files.object_factory(config));

        // make sure the template file exists
        if (!fs.existsSync(templateFileName)) {
            console.error(`Object index template file not found: ${templateFileName}`);
            process.exit(1);
        }

        // make sure the output directory exists. Create it if it doesn't.
        const outputDir = path.dirname(outputFileName);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // we'll pass all of our model objects to the template
        const models = {
            objects: coreObjects,
            components: componentObjects,
            results: resultObjects
        };

        // run the object through the template using ejs
        const template = fs.readFileSync(templateFileName, 'utf8');
        try {
            const output = ejs.render(template, {models:models, helpers: config.helpers, partial: partial, config: config});
            fs.writeFileSync(outputFileName, output);
        } catch (err) {
            throw new Error(`Error rendering object factory template: ${templateFileName}\n${err.message}`);
        }
    }
})();