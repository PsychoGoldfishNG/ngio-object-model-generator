'use strict';

/**
 * Generator names should be lowercase, as should the directories their generate.js files are in
 */
module.exports = {

	// CLI aliases, eg you can run 'build.js js' instead of 'build.js javascript'
	aliases: {
		js: "javascript"
	},

	generators: {

		javascript: {

			// generated files will use this extension
			fileExtension: ".js",

			// generated filenames will use these prefixes
			prefixes: {
				objects: "NewgroundsIO_objects_",
				components: "NewgroundsIO_components_"
			},

			// this is where your generated files will be saved
			outputDirs: {
				objects: "./build/objects",
				components: "./build/components"
			},

			// partials (code that will be inserted into generated files) for generated files can be found here
			partialDirs: {
				objects: "./generators/javascript/partials/objects",
				components: "./generators/javascript/partials/components"
			}
		}

	}
}