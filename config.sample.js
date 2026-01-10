/**
 * In this config, we use a few mustache-style variables
 * that will be replaced by the build script.
 * For example, {{__dirname}} will be replaced with the directory this file is in.
 * This allows us to easily use relative paths in the config file.
 */
module.exports = {

    // path to a module with any helper methods you want to use in your templates
	// helpers come in handy if you want to add custom logic to your templates without
	// cluttering them with too much logic.
    helper_module : "{{__dirname}}/helpers.js",
    
    // path to the directory containing the partial templates
	// Partials are a good way to add extra functionality to your templates, 
	// for example, adding an unlock method to medal objects.
    partials_dir: "{{__dirname}}/templates/partials",

    // template files for the model builder
    template_files: {

		// templates for your core objects
        objects: "{{__dirname}}/templates/object.ejs",

		// templates for component objects
        components: "{{__dirname}}/templates/component.ejs",

		// templates for component results objects
        results: "{{__dirname}}/templates/result.ejs",

		// template for an object factory class (used to create instances using object and component names)
		// Note: If you don't need an object factory class, you can remove this line.
        object_factory: "{{__dirname}}/templates/object_factory.ejs"
    },

    /**
     * output directories for the generated files
     * 
     * For objects, {{name}} will be replaced with the name of the object.
     * For components, {{component}} will be the component namespace, and {{method}} will be the method name.
     * 
     * Note:
     * objects, components and results are treated like classes and are in UpperCamelCase, so these templates would have file and path names like "ScoreBoard".
     * component and result methods use lowerCamelCase, so "getScores" would be the filename
     * 
     * If the best practices for naming files in your target language are different, you can prefix these variables with the following:
     *  'lc_' - lowercase (eg, 'ScoreBoard' becomes 'scoreboard')
     *  'uc_' - UPPERCASE (eg, 'getScores' becomes 'GETSCORES')
     *  'lcc_' - lowerCamelCase (eg, 'ScoreBoard' becomes 'scoreBoard')
     *  'ucc_' - UpperCamelCase (eg, 'getScores' becomes 'GetScores')
	 * 
	 * Also, be sure to use the correct file extension for your object models!
     */
    output_files: {

		// path to where your object models will be saved
        objects: "{{__dirname}}/ngio/models/objects/{{name}}.ext",

		// path to where your component models will be saved
        components: "{{__dirname}}/ngio/models/components/{{component}}/{{method}}.ext",

		// path to where your component results models will be saved
        results: "{{__dirname}}/ngio/models/results/{{component}}/{{method}}.ext",

		// path to where the object index file will be saved
		// Note: If you don't need an object index file, you can remove this line.
        object_factory: "{{__dirname}}/ngio/models/objects/ObjectIndex.ext"
    }
};