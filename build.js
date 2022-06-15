'use strict';
const fs = require('fs');

var generator_name = process.argv[2];

// Make sure we have a config.js file
if (!fs.existsSync('./config.js')) {

	// create the file
	if (generator_name === 'install') {
		fs.copyFileSync("./default_config.js", "./config.js");
		console.log("Created config.js.  You can now edit this file!");

	// tell the user how to create the file
	} else {
		console.error("Missing config.js.  Use 'node build.js install' to generate.");
	}
	process.exit(1);

// file exists, but user is trying to install it again
// TODO - compare default file and patch new configurations into the config.js file
} else if (generator_name === 'install') {
	console.error("config.js already generated!");
	process.exit(1);
}

// make sure the user has selected a generator to run (or opted to run them all for some insane reason)
if (!generator_name) {
	console.log("Use: node build.js {generator_name|all}\n\nexample:\nnode build.js javascript");
	process.exit(1);
}

// load the config file
var config = require('./config.js');

// load the object document
var json = fs.readFileSync('./docs/objects_and_components.json');
var objectDocs = JSON.parse(String(json));

// figure out what generators we're actually running and throw them in an array
var to_generate = [];
if (generator_name === 'all') {
	for(var i in config.generators) {
		to_generate.push(i);
	}
} else {
	to_generate.push(generator_name);
}

// start generating!
to_generate.forEach(function(generate_as) {

	// get actual generator name if user is using an alias
	if (typeof(config.aliases[generate_as]) === 'string') generate_as = config.aliases[generate_as];

	// attempt to import the generator
	var baseDir = './generators/'+generate_as.toLowerCase();
	if (!fs.existsSync(baseDir+'/generate.js')) {
		console.error("No generator exists for '"+generate_as+"'");
		process.exit(1);
	}
	var generator = require(baseDir+'/generate.js');
	console.log("Generating "+generate_as+"...");

	// pass the config to the generator
	generator.config = config.generators[generate_as.toLowerCase()];

	/**
	 * Checks if a director exists and creates it if needed
	 * @param {string} dir The directory to check
	 * @return {string} The directory that was checked
	 */
	function checkDir(dir) {
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir, { recursive: true });
			if (!fs.existsSync(dir)){
				console.error("Unable to create directory: ",dir);
				process.exit(1);
			}
		}
		return dir;
	}

	// Loop through the object docs and generate a file for each
	for (const [name, obj] of Object.entries(objectDocs.components)) {


		// generate the code
		let output = generator.generateComponent(name,obj);

		// save the file
		let dir = checkDir(generator.config.outputDirs.components);
		let file = dir+"/"+generator.config.prefixes.components+name+generator.config.fileExtension;
		fs.writeFileSync(file, output)

		console.log('created',file);
	}


	// Loop through the object docs and generate a file for each
	for (const [name, obj] of Object.entries(objectDocs.objects)) {

		// generate the code
		let output = generator.generateObject(name,obj);

		// save the file
		let dir = checkDir(generator.config.outputDirs.objects);
		let file = dir+"/"+generator.config.prefixes.objects+name+generator.config.fileExtension;
		fs.writeFileSync(file, output);

		console.log('created',file);
	}
});

console.log("done!");