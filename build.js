'use strict';
const fs = require('fs');
const https = require('https');
const chokidar = require('chokidar');
const { exec } = require("child_process");
const path = require('path');
const { pathToFileURL } = require('url');

// use simple mustache templating for filename generation
const mustache = require('mustache');

// use more advanced ejs for the model templates
const ejs = require('ejs');

// the object documentation is available in a json file at this url
const object_doc_url = "https://www.newgrounds.io/help/objects_and_components.json";

// we'll save the downloaded object documentation here
const object_doc_file = path.join(__dirname, 'docs', 'objects_and_components.json');

// and note the last updated time here
// this is used to check if the documentation is up-to-date so we don't download it every time we run the script
const object_doc_stamp = path.join(__dirname, 'docs', 'last_updated');

// we should have one extra argument, pointing at the config file, relative to the project path
if (process.argv.length < 3) {
    console.error("Usage: node build.js <config_file>");
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

// load the config file
console.log("NGIO Model Builder - Loading config file:", config_file);
const config = require(config_file);

// get the directory the config file is in.  Most of the paths in there will be relative to this directory.
const configDir = path.dirname(config_file);

// when checking paths in the config file, there are a few mustache variables we can use
// {{__dirname}} will be replaced with the directory the config file is in
// {{name}} will be replaced with the name of object models
// {{component}} will be replaced with the compnent namespace that component methods and result objects belong to
// {{method}} will be replaced with the method name of component methods and their result objects

// get the directory our partials are in
const partialDir = path.normalize(mustache.render(config.partials_dir ?? `${configDir}/partials`, {__dirname: configDir}));

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
        return ejs.render(template, data);
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
            
            // make sure object_doc_file target direct exists, create if needed
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

    // if we have a path set for a helper module, load that, or just use an empty object.
    // this helper variable will be injected into the templates, so users can add custom functions to help with rendering.
    let helper = {};
    if (config.helper_module) {

        // load the helper module if it exists
        const helperModulePath = path.normalize(mustache.render(config.helper_module, {__dirname: configDir}));

        if (fs.existsSync(helperModulePath)) {
            helper = require(helperModulePath);
        } else {
            console.error(`Helper module not found: ${helperModulePath}`);
            process.exit(1);
        }
    }

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

        const templateFileName = path.normalize(mustache.render(config.template_files.objects, {__dirname: configDir}));
        const outputFileName = path.normalize(mustache.render(config.output_files.objects, {__dirname: configDir, name: name}));

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
        const output = ejs.render(template, {model:object, helper: helper, partial: partial, config: config});
        fs.writeFileSync(outputFileName, output);
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

            // if this component has no return, we won't need to model a result object
            if (!object_doc.components[component].methods[method].return) continue;

            if (!resultObjects[component]) resultObjects[component] = {};

            resultObjects[component][method] = {
                properties: object_doc.components[component].methods[method].return,
                component: component,
                method: method
            };
        }
    }

    console.log("Component models generated.");
    
    for (const component in componentObjects) {
        for (const method in componentObjects[component]) {

            const model = componentObjects[component][method];

            const templateFileName = path.normalize(mustache.render(config.template_files.components, {__dirname: configDir}));
            const outputFileName = path.normalize(mustache.render(config.output_files.components, {__dirname: configDir, component: component, method: method}));

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
            const output = ejs.render(template, {model:model, helper: helper, partial: partial, config: config});
            fs.writeFileSync(outputFileName, output);
        }
    }
    
    for (const component in resultObjects) {
        for (const method in resultObjects[component]) {
            const result = resultObjects[component][method];
            
            const templateFileName = path.normalize(mustache.render(config.template_files.results, {__dirname: configDir}));
            const outputFileName = path.normalize(mustache.render(config.output_files.results, {__dirname: configDir, component: component, method: method}));

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
            const output = ejs.render(template, {model:result, helper: helper, partial: partial, config: config});
            fs.writeFileSync(outputFileName, output);
        }
    }

    console.log("Result models generated.");

    // see if we need to build an object index for this library
    if (config.template_files.object_index && config.output_files.object_index) {
        const templateFileName = path.normalize(mustache.render(config.template_files.object_index, {__dirname: configDir}));
        const outputFileName = path.normalize(mustache.render(config.output_files.object_index, {__dirname: configDir}));

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
        const output = ejs.render(template, {models:models, helper: helper, partial: partial, config: config});
        fs.writeFileSync(outputFileName, output);
    }
})();