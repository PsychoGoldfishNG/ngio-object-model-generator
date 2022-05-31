'use strict';

module.exports = {

	// CLI aliases, eg you can run 'build.js js' instead of 'build.js javascript'
	aliases: {
		js: "javascript"
	},

	// settings for generators
	generators: {

		javascript: {
			objectDir: "./build/objects",
			componentDir: "./build/components",
		}

	}
}