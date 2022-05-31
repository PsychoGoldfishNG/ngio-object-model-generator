'use strict';
const fs = require('fs');

var config = require('./config.js');

var json = fs.readFileSync('./docs/objects_and_models.json');
var objectDocs = JSON.parse(String(json));

var generate_as = process.argv[2];
if (!generate_as) {
	console.log("Use: build.js {generatorName}\n\nexample:\nnode build.js javascript");
	process.exit(1);
}

if (typeof(config.aliases[generate_as]) === 'string') generate_as = config.aliases[generate_as];

var baseDir = './generators/'+generate_as.toLowerCase();

if (!fs.existsSync(baseDir+'/generate.js')) {
	console.error("No generator exists for '"+generate_as+"'");
	process.exit(1);
}

var generator = require(baseDir+'/generate.js');
generator.baseDir = baseDir;
generator.config = config.generators[generate_as.toLowerCase()];

function checkDir(dir) {
	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}

for (const [name, obj] of Object.entries(objectDocs.objects)) {
	console.log(generator.generateObject(name,obj));
	break;
}
