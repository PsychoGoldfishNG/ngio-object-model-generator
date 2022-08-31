'use strict';
const fs = require('fs');
const chokidar = require('chokidar');
const { exec } = require("child_process");

var generator_name = process.argv.length > 2 ? process.argv.pop() : false;

var flags = {
	help:	false,
	install:	false,
	watch:	false
};

if (generator_name[0] === "-") {
	process.argv.push(generator_name);
	generator_name = false;
}

var options = [
	["-help",		"help",		"View all the options for this script"],
	["-install",	"install",	"Run this before anything else to generate your config.js file!"],
	["-w",			"watch",	"Watch for changes to generator and partial scripts and auto-build"]
];

while (process.argv.length > 2) {
	let arg = process.argv.pop();

	let valid = false;

	for (let i=0; i<options.length; i++) {
		if (arg === options[i][0]) {
			valid = true;
			flags[options[i][1]] = true;
			break;
		}
	}

	if (!valid) {
		console.error("Invalid argument:",arg);
		process.exit();
	}
}

var file_contents,file_name;

// Make sure we have a config.js file
if (!fs.existsSync('./config.js')) {

	// create the file
	if (generator_name === '-install') {
		fs.copyFileSync("./default_config.js", "./config.js");
		console.log("Created config.js.  You can now edit this file!");

	// tell the user how to create the file
	} else {
		console.error("Missing config.js.  Use 'node build.js -install' to generate.");
	}
	process.exit(1);

// file exists, but user is trying to install it again
// TODO - compare default file and patch new configurations into the config.js file
} else if (flags.install) {
	console.error("config.js already generated!");
	process.exit(1);
}

// make sure the user has selected a generator to run (or opted to run them all for some insane reason)
if (flags.help || !generator_name) {
	console.log("Use: node build.js {options} {generator_name|all}\n\nexample:\nnode build.js -w javascript\n\nValid Options:\n");
	options.forEach(option => {
		console.log("  ",option[0],(" ").repeat(16 - option[0].length), option[2]);
	});
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
	if (typeof(config.aliases[generator_name]) === 'string') generator_name = config.aliases[generator_name];
	to_generate.push(generator_name);
}

function generate(generate_as)
{
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

	function checkFilePath(path)
	{
		path = path.replaceAll("\\","/").split("/");

		let name = path.pop();
		path = checkDir(path.join("/"));

		return path+"/"+name;
	}

	var objectLists = {
		objects: [],
		components: [],
		results: []
	};

	// Loop through the docs and generate request and response files for each component/method
	for (const [name, obj] of Object.entries(objectDocs.components)) {
		for (const [method, data] of Object.entries(obj.methods)) {
		
			objectLists.components.push(name+"."+method);

			if (generator.generateComponentObject) {
				// create a request object file for each method
				[file_name,file_contents] = generator.generateComponentObject(name,method,data);

				// save the file
				file_name = checkFilePath(generator.config.outputDirs.components + "/" +file_name);
				fs.writeFileSync(file_name, file_contents);

				//console.log('created',file_name);
			}

			// create a result object file for each method
			if (data.return) {

				objectLists.results.push(name+"."+method);
				
				if (generator.generateResultObject) {
					// generate the code
					[file_name,file_contents] = generator.generateResultObject(name,method,data.return);

					// save the file
					file_name = checkFilePath(generator.config.outputDirs.component_results + "/" +file_name);
					fs.writeFileSync(file_name, file_contents);

					//console.log('created',file_name);
				}
			}
		}
	}

	// Loop through the docs and generate a file for each object
	for (const [name, obj] of Object.entries(objectDocs.objects)) {

		objectLists.objects.push(name);

		let partials = null;
		if (generator.config.partialDirs && generator.config.partialDirs.objects) {
			let partial_file = generator.config.partialDirs.objects+"/"+name+".js";

			if (fs.existsSync(partial_file))
				partials = require(partial_file);
		}

		if (generator.generateObject) {
			// generate the code
			[file_name,file_contents] = generator.generateObject(name,obj,partials);

			if (!file_contents) continue;
			
			// save the file
			file_name = checkFilePath(generator.config.outputDirs.objects + "/" +file_name);
			fs.writeFileSync(file_name, file_contents);

			//console.log('created',file_name);
		}
	}

	if (generator.generateObjectIndex) {
		[file_name,file_contents] = generator.generateObjectIndex(objectLists);

		if (file_contents) {
			// save the file
			file_name = checkFilePath(generator.config.outputDirs.object_index + "/" +file_name);
			fs.writeFileSync(file_name, file_contents);

			//console.log('created',file_name);
		}
	}

	console.log("done!");
}

// start generating!
to_generate.forEach(function(generate_as) {
	generate(generate_as);
});


if (flags.watch) {
	let scanned = false;

	to_generate.forEach(function(generate_as) {

		let queued = false;

		function onChange(file) {
			if (!scanned || queued) return;

			queued = true;

			setTimeout(()=>{
				exec("node "+__dirname+"/build.js "+generate_as, (error, stdout, stderr) => {
					if (error) {
						console.log(`error: ${error.message}`);
						process.exit();
					}
					if (stderr) {
						console.log(`stderr: ${stderr}`);
						process.exit();
					}
					console.log(stdout);
					console.log(file, "updated at "+(new Date()).toLocaleString());

					queued = false;
				});
			},100);
		}

		let watcher = chokidar.watch("./generators/"+to_generate+"/", {persistent: true});

		watcher
          .on('add', onChange)
          .on('change', onChange)
          .on('unlink', onChange)
          .on('unlinkDir', onChange)
        ;

		console.log("Watching "+generate_as+"...");
	});

	setTimeout(()=>{
		scanned = true;
	},500);
}