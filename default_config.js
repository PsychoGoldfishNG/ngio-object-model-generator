'use strict';

/**
 * Generator names should be lowercase, as should the directories their generate.js files are in
 */
module.exports = {

	// CLI aliases, eg you can run 'build.js js' instead of 'build.js javascript'
	aliases: {
		js: "javascript",
		cs: "csharp"
	},

	generators: {

		javascript: {

			// this is where your generated model files will be saved
			outputDirs: {
				objects: "./build/javascript/newgroundsio/objects",
				components: "./build/javascript/newgroundsio/components",
				component_results: "./build/javascript/newgroundsio/results",
				object_index: "./build/javascript/newgroundsio/objects"
			},

			// partials (code that will be inserted into generated files) for generated files can be found here
			partialDirs: {
				objects: "./generators/javascript/partials/objects",
				components: "./generators/javascript/partials/components",
				component_results: "./generators/javascript/partials/results"
			}
		},

		csharp: {

			// this is where your generated model files will be saved
			outputDirs: {
				objects: "./build/csharp/newgroundsio/objects",
				components: "./build/csharp/newgroundsio/components",
				component_results: "./build/csharp/newgroundsio/results",
				object_index: "./build/csharp/newgroundsio/objects"
			},

			// partials (code that will be inserted into generated files) for generated files can be found here
			partialDirs: {
				objects: "./generators/csharp/partials/objects",
				components: "./generators/csharp/partials/components",
				component_results: "./generators/csharp/partials/results"
			}
		}

	}
}