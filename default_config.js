'use strict';

/**
 * Generator names should be lowercase, as should the directories their generate.js files are in
 */
module.exports = {

	// URL of the ngio object and component documentation in json format
	object_doc_url : "https://www.newgrounds.io/help/objects_and_components.json",

	// CLI aliases, eg you can run 'build.js js' instead of 'build.js javascript'
	aliases: {
		js: "javascript",
		cs: "csharp",
		as2: "actionscript2",
	},

	// Set up generators for different langauges here
	generators: {

		actionscript2: {

			// directories where generated files will be saved, by object type
			outputDirs: {
				objects: "./build/actionscript2/newgroundsio/objects",
				components: "./build/actionscript2/newgroundsio/components",
				component_results: "./build/actionscript2/newgroundsio/results",
				object_index: "./build/actionscript2/newgroundsio/objects"
			},

			// directories where partials (code that will be inserted into generated files) can be found
			partialDirs: {
				objects: "./generators/actionscript2/partials/objects",
				components: "./generators/actionscript2/partials/components",
				component_results: "./generators/actionscript2/partials/results"
			}
		},

		javascript: {

			// directories where generated files will be saved, by object type
			outputDirs: {
				objects: "./build/javascript/newgroundsio/objects",
				components: "./build/javascript/newgroundsio/components",
				component_results: "./build/javascript/newgroundsio/results",
				object_index: "./build/javascript/newgroundsio/objects"
			},

			// directories where partials (code that will be inserted into generated files) can be found
			partialDirs: {
				objects: "./generators/javascript/partials/objects",
				components: "./generators/javascript/partials/components",
				component_results: "./generators/javascript/partials/results"
			}
		},

		csharp: {

			// directories where generated files will be saved, by object type
			outputDirs: {
				objects: "./build/csharp/newgroundsio/objects",
				components: "./build/csharp/newgroundsio/components",
				component_results: "./build/csharp/newgroundsio/results",
				object_index: "./build/csharp/newgroundsio/objects"
			},

			// directories where partials (code that will be inserted into generated files) can be found
			partialDirs: {
				objects: "./generators/csharp/partials/objects",
				components: "./generators/csharp/partials/components",
				component_results: "./generators/csharp/partials/results"
			}
		}

	}
}