'use strict';
const fs = require('fs');

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {
	
	/* =========================================== CODE GENERATORS =========================================== */

	/**
	 * Generates the JS code for a component class
	 * @param {string} componentName The name of the component
	 * @param {string} methodName The name of the method
	 * @param {object} methodData All the data about the method
	 * @param {object} partials An optional partials module for this class
	 * @return {string}
	 */
	generateComponentObject: function(componentName,methodName,methodData,partials) 
	{
		var out = "";

		// class definition and constructor
		out +=					"/**\n";
		out +=					" * Used to call the "+componentName+"."+methodName+" component.\n";
		out +=					" */\n";
		out +=	 				"class NewgroundsIO_components_"+componentName+"_"+methodName+" extends NewgroundsIO_components {\n\n";

		out +=					"	/**\n";
		out +=					"	 * Constructor\n";
		if (methodData.params && Object.keys(methodData.params).length > 0)
			out +=				"	 * @param {object} props An object of initial properties for this instance\n";
		out +=					"	 */\n";
		out +=					"	constructor("+(methodData.params ? 'props':'')+")\n";
		out +=					"	{\n";
		out +=					"		super();\n\n";
		out +=					"		this.__object = \""+componentName+"."+methodName+"\";\n";
		let props = [];
		let required = [];
		if (methodData.params) {
			for (const [property, data] of Object.entries(methodData.params)) {
				if (data.required === true) required.push(property);
				out +=			"		this._"+property+" = null;\n";
				props.push(property);
			}
		}

		if (required.length > 0)
			out +=				"		this.__required = "+JSON.stringify(required)+";\n";

		if (methodData.secure === true)
			out +=				"		this.__isSecure = true;\n";

		if (methodData.require_session === true)
			out +=				"		this.__requireSession = true;\n";

		if (props.length > 0) {
			out +=				"		this.__properties = this.__properties.concat("+JSON.stringify(props)+");\n";
			out +=				"		if (typeof(props) === 'object') {\n";
			out +=				"			for(var i=0; i<this.__properties.length; i++) {\n";
			out +=				"				if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];\n";
			out +=				"			}\n";
			out +=				"		}\n";
		}

		// add any partial code that may exist for the constructor function
		if (partials && partials.getConstructorPartial) out += partials.getConstructorPartial();
		
		out +=					"	}\n\n";

		if (methodData.params) {
			for (const [property, data] of Object.entries(methodData.params)) {
				out +=			"	/**\n";
				if (data.description) {
					out +=		"	 * "+this.formatJSDocDescription(data.description, "	")+"\n";
				}
				out +=			"	 * @type {"+this.getJSDocCastType(data)+"}\n";

				out +=			"	 */\n";
				out += 			"	get "+property+"()\n";
				out += 			"	{\n";
				out += 			"		return this._"+property+";\n";
				out += 			"	}\n\n";

				out += 			"	set "+property+"(_"+property+")\n";
				out += 			"	{\n";
				if (data.object) {
					out += 		"		"+(this.castObject('this._'+property, '_'+property, data.object, '		'))+"\n";
				} else if (data.type) {
					out += 		"		"+(this.castValue('this._'+property, '_'+property, data.type, '		'))+"\n";
				}
				out += 			"	}\n\n";
			}
		}

		// add any partial code that may exist for the overall class
		if (partials && partials.getClassPartial) out += partials.getClassPartial();

		out += 					"}\n\n";

		out += 					"// Make an alias for this class so it can be used dynamically with string names\n";
		out += 					"if (typeof(NewgroundsIO.components."+componentName+") === 'undefined') NewgroundsIO.components."+componentName+" = {};\n";
		out += 					"NewgroundsIO.components."+componentName+"."+methodName+" = NewgroundsIO_components_"+componentName+"_"+methodName+";";

		let filename = componentName+"/"+methodName+".js";
		return [filename,out];
	},

	/**
	 * Generates the JS code for a component class
	 * @param {string} componentName The name of the component
	 * @param {string} methodName The name of the method
	 * @param {object} resultData All the data about the result object
	 * @param {object} partials An optional partials module for this class
	 * @return {string}
	 */
	generateResultObject: function(componentName,methodName,resultData,partials) 
	{
		var out = "";

		// class definition and constructor
		out +=					"/**\n";
		out +=					" * Returned when "+componentName+"."+methodName+" component is called\n";
		out +=					" */\n";
		out +=	 				"class NewgroundsIO_results_"+componentName+"_"+methodName+" extends NewgroundsIO_results {\n\n";

		out +=					"	/**\n";
		out +=					"	 * Constructor\n";
		if (resultData && Object.keys(resultData).length > 0) 
			out +=				"	 * @param {object} props An object of initial properties for this instance\n";
		out +=					"	 */\n";
		out +=					"	constructor("+(resultData ? 'props':'')+")\n";
		out +=					"	{\n";
		out +=					"		super();\n\n";
		out +=					"		this.__object = \""+componentName+"."+methodName+"\";\n";
		let props = [];
		for (const [property, data] of Object.entries(resultData)) {
			props.push(property)
			out +=				"		this._"+property+" = null;\n";
		}
		if (props.length > 0) {
			out +=				"		this.__properties = this.__properties.concat("+JSON.stringify(props)+");\n";
			out +=				"		if (typeof(props) === 'object') {\n";
			out +=				"			for(var i=0; i<this.__properties.length; i++) {\n";
			out +=				"				if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];\n";
			out +=				"			}\n";
			out +=				"		}\n";
		}
		
		// add any partial code that may exist for the constructor function
		if (partials && partials.getConstructorPartial) out += partials.getConstructorPartial();

		out +=					"	}\n\n";

		for (const [property, data] of Object.entries(resultData)) {
			out +=				"	/**\n";
			if (data.description) {
				out +=			"	 * "+this.formatJSDocDescription(data.description, "	")+"\n";
			}
			out +=				"	 * @type {"+this.getJSDocCastType(data)+"}\n";

			out +=				"	 */\n";
			out += 				"	get "+property+"()\n";
			out += 				"	{\n";
			out += 				"		return this._"+property+";\n";
			out += 				"	}\n\n";

			out += 				"	set "+property+"(_"+property+")\n";
			out += 				"	{\n";

			if (data.object) {
				out += 			"		if (!(_"+property+" instanceof NewgroundsIO_objects_"+data.object+") && typeof(_"+property+") === 'object')\n";
				out += 			" 			_"+property+" = new NewgroundsIO_objects_"+data.object+"(_"+property+");\n\n";
			}

			if (data.object) {
				out += 			"		"+(this.castObject('this._'+property, '_'+property, data.object, '		'))+"\n";
			} else if (data.type) {
				out += 			"		"+(this.castValue('this._'+property, '_'+property, data.type, '		'))+"\n";
			}
			out += 				"	}\n\n";
		}

		// add any partial code that may exist for the overall class
		if (partials && partials.getClassPartial) out += partials.getClassPartial();
		
		out += 					"}\n\n";

		out += 					"// Make an alias for this class so it can be used dynamically with string names\n";
		out += 					"NewgroundsIO_results.registerComponent('"+componentName+"."+methodName+"', NewgroundsIO_results_"+componentName+"_"+methodName+");\n";
		out += 					"if (typeof(NewgroundsIO.results."+componentName+") === 'undefined') NewgroundsIO.results."+componentName+" = {};\n";
		out += 					"NewgroundsIO.results."+componentName+"."+methodName+" = NewgroundsIO_results_"+componentName+"_"+methodName+";";

		let filename = componentName+"/"+methodName+".js";
		return [filename,out];
	},

	/**
	 * Generates the JS code for an object class
	 * @param {string} objectName The name of the object being generated
	 * @param {object} objectData All the data about the object from the main document
	 * @param {object} partials An optional partials module for this class
	 * @return {string}
	 */
	generateObject: function(objectName,objectData,partials) 
	{
		// don't make a model for this...
		if (objectName === "Result") return "";

		var out = "";

		// class description	
		out += 					"/**\n";
		if (objectData.description)
			out += 				" * "+this.formatJSDocDescription(objectData.description, "")+"\n";
		out += 					" */\n";

		// class definition.  We will be extending a
		out += 					"class NewgroundsIO_objects_"+objectName+" extends NewgroundsIO_objects {\n\n";


		// constructor
		out += 					"	/**\n";
		out += 					"	 * Constructor\n";
		if (objectData.properties  && Object.keys(objectData.properties).length > 0)
			out +=				"	 * @param {object} props An object of initial properties for this instance\n";
		out += 					"	 */\n";
		out += 					"	constructor("+(objectData.properties ? 'props':'')+")\n";
		out += 					"	{\n";
		out +=					"		super();\n\n";
		out +=					"		this.__object = '"+objectName+"';\n\n";

		let _required = [];

		// set initial property values
		let props = [];
		for (const [name, obj] of Object.entries(objectData.properties)) {

			props.push(name);
			// prefixing actual properties with "_" because end-user will be accessing via get/set methods
			// initial values can be set in the constructor, or will be null by default
			out +=				"			this._"+name+" = null;\n";

			// keep track of required properties
			if (obj.required === true) _required.push(name);
		}
		
		// set properties from props object
		if (props.length > 0) {
			out +=				"			this.__properties = this.__properties.concat("+JSON.stringify(props)+");\n";
			out += 				"			if (typeof(props) === 'object') {\n";
			out +=				"				for(var i=0; i<this.__properties.length; i++) {\n";
			out +=				"					if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];\n";
			out +=				"				}\n";
			out += 				"			}\n\n";
		}


		// note required properties
		if (_required.length > 0)
			out += 				"		this.__required = "+JSON.stringify(_required)+";\n";


		// add any partial code that may exist for the constructor function
		if (partials && partials.getConstructorPartial) out += partials.getConstructorPartial();

		out += 					"	}\n\n";
		// end constructor


		// getter/setters for properties
		for (const [name, obj] of Object.entries(objectData.properties)) {

			// Override how the result propert of the Repsonse object is defined
			if (objectName === "Response" && name === "result") {
				delete obj.object;
				obj.type = "NewgroundsIO_results";
				obj.array = {
					type: "NewgroundsIO_results"
				};
				obj.description = "This will be a NewgroundsIO_results object, or an array containing one-or-more NewgroundsIO_results objects."
			}

			// JSDoc description
			out +=				"	/**\n";
			if (obj.description)
				out +=			"	 * "+this.formatJSDocDescription(obj.description, "	")+"\n";
			out += 				"	 * @type {"+this.getJSDocCastType(obj)+"}\n";
			out +=				"	 */\n";

			// Getter
			out += 				"	get "+name+"()\n";
			out += 				"	{\n";
			out += 				"		return this._"+name+";\n";
			out += 				"	}\n\n";

			out += 				"	set "+name+"(_"+name+")\n";
			out += 				"	{\n";

			// handle properties that can be passed as typed arrays
			if (obj.array) {

				out += 			"		if (Array.isArray(_"+name+")) {\n";

				if (obj.array.type === 'mixed') {

					out += 		"			"+(this.castValue('this._'+name, '_'+name, obj.array, '			'))+"\n";

				} else {

					out += 		"			let newArr = [];\n";
					out += 		"			_"+name+".forEach(function(val,index) {\n";

					if (obj.array.object) {
						out += 	"				"+(this.castObject('newArr[index]', 'val', obj.array.object, '				'))+"\n";
					} else {
						out += 	"				"+(this.castValue('newArr[index]', 'val', obj.array.type, '				'))+"\n";
					}
					out += 		"			});\n";
					out += 		"			this._"+name+" = newArr;\n";

				}

				out += 			"			return;\n";
				out += 			"		}\n\n";
			}

			if (obj.object) {
				out += 			"		"+(this.castObject('this._'+name, '_'+name, obj.object, '		'))+"\n";
			} else if (obj.type) {
				out += 			"		"+(this.castValue('this._'+name, '_'+name, obj.type, '		'))+"\n";
			}

			out += 				"	}\n\n";
		}
		// end getter/setters for properties

		// add any partial code that may exist for the main class
		if (partials && partials.getClassPartial) out += partials.getClassPartial();

		out +=					"}\n\n";
		// end class

		out +=					"// Alias to the NewgroundsIO.objects namespace\n";
		out +=					"NewgroundsIO.objects."+objectName+" = NewgroundsIO_objects_"+objectName+";";

		let filename = objectName+".js";
		return [filename,out];
	},


	/* =========================================== HELPER METHODS =========================================== */

	/**
	 * Converts type names from the object document to native JavaScript types
	 * @param {string} type_from_doc The data type as defined in the document
	 * @return {string} The comparable JavaScript type
	 */
	getJSNativeType: function(type_from_doc)
	{
		var replace = [
			[ 'int',    'float',  'string', 'boolean', 'object' ],
			[ 'Number', 'Number', 'String', 'Boolean', 'Object' ]
		];

		let i = replace[0].indexOf(type_from_doc);

		return i >= 0 ? replace[1][i] : type_from_doc;
	},


	/**
	 * Gets the type(s) a poperty can use, for JSDoc comments
	 * @param {object} property The property object from the objects document
	 * @returns {string} a JSDoc-friendly type string
	 */
	getJSDocCastType: function(property) 
	{
		// convert types from the doc to native JS types

		// this property can accept an array of values
		if (typeof(property.array) !== 'undefined') {
			let atype = this.getJSDocCastType(property.array);
			let otype = this.getJSDocCastType({type: property.type, object: property.object});

			// this property can accept either a flat value, OR an array of values
			if (typeof(otype) !== 'undefined') {
				return "("+otype+"|Array.<"+atype+">)";

			// this property can ONLY accept an array of values
			} else {
				return "Array.<"+atype+">";
			}
		}

		// this property needs to be an instance of another NGIO object
		if (typeof(property.object) !== 'undefined') return 'NewgroundsIO_objects_'+property.object;

		// this is a flat type
		return this.getJSNativeType(property.type);
	},


	/**
	 * Formats descriptions, from the object document, to JSDoc-friendly strings
	 * @param {string} description The original description text
	 * @param {string} tab Any additional indentation to add to new lines
	 * @return {string}
	 */
	formatJSDocDescription: function(description, tab) 
	{
		// replaces # notations with full class paths, and adds * and indentation to any newlines in the string.
		return description.replaceAll("\n\n","\n").replaceAll("#","NewgroundsIO_objects_").split("\n").join("\n"+tab+" *        ");
	},


	/**
	 * Generates code for typecasting and error checking of native datatypes in setter methods
	 * @param {string} key The property or variable name that needs strict casting
	 * @param {string} value The name of the value variable
	 * @param {string} type The value type from the document (may need translating)
	 * @param {string} tab Any additional indenting to apply to new lines
	 * @returns {string} JavaScript code to handle strict typecasting
	 */
	castValue: function(key,value,type,tab) 
	{
		let _out = "";
		let is_int = false;

		switch (type) {

			// handle numeric types
			case "int":
				is_int = true;
			case "float":

				_out +=			"if (typeof("+value+") !== 'number') console.warn('NewgroundsIO Type Mismatch: Value should be a number, got a '+typeof("+value+"));\n";
				if (is_int) {
					_out += 	tab+"else if (!Number.isInteger("+value+")) console.warn('NewgroundsIO Type Mismatch: Value should be an integer, got a float');\n";
				}
				_out +=			tab+key+" = Number("+value+");\n";
				_out +=			tab+"if (isNaN("+key+")) "+key+" = null;\n";
				break;

			// handle strings
			case "string":
				_out +=			"if (typeof("+value+") !== 'string') console.warn('NewgroundsIO Type Mismatch: Value should be a string, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = String("+value+");\n";
				break;

			// handle booleans
			case "boolean":
				_out +=			"if (typeof("+value+") !== 'boolean') console.warn('NewgroundsIO Type Mismatch: Value should be a boolean, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = "+value+" ? true:false;\n";
				break;

			case "object":
				_out +=			"if (typeof("+value+") !== 'object') console.warn('NewgroundsIO Type Mismatch: Value should be a object, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO_objects":
				_out +=			"if (!("+value+" instanceof NewgroundsIO_objects)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_objects instance, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO_components":
				_out +=			"if (!("+value+" instanceof NewgroundsIO_components)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_components instance, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO_results":
				_out +=			"if (!("+value+" instanceof NewgroundsIO_results)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_results instance, got a '+typeof("+value+"));\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			// everything else
			default:
				_out +=			key+" = "+value+"; // "+type+"\n";
		}

		return _out;
	},


	/**
	 * Generates code for typecasting and error checking of class instances in setter methods
	 * @param {string} key The property or variable name that needs strict casting
	 * @param {string} value The name of the value variable
	 * @param {string} obj The class name the value is expected to be an instance of
	 * @param {string} tab Any additional indenting to apply to new lines
	 * @returns {string} JavaScript code to handle strict typecasting
	 */
	castObject: function(key,value,obj,tab) 
	{
		let _out = "";

		_out +=					"if (!("+value+" instanceof NewgroundsIO_objects_"+obj+"))\n";
		_out +=	tab +			"	console.warn(\"Type Mismatch: expecting NewgroundsIO_objects_"+obj+", got \"+typeof("+value+"));\n\n"
		_out +=	tab +			key+" = "+value+";";
		
		return _out;
	}

}