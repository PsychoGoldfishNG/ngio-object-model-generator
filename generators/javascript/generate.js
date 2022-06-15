'use strict';
const fs = require('fs');

module.exports = {
	
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

				_out +=		"if (typeof("+value+") !== 'number') console.warn('Type Mismatch: Value should be a number, got a '+typeof("+value+"));\n";
				if (is_int) {
					_out += tab+"else if (!Number.isInteger("+value+")) console.warn('Type Mismatch: Value should be an integer, got a float');\n";
				}
				_out +=		tab+key+" = Number("+value+");\n";
				break;

			// handle strings
			case "string":
				_out +=		"if (typeof("+value+") !== 'string') console.warn('Type Mismatch: Value should be a string, got a '+typeof("+value+"));\n";
				_out +=		tab+key+" = String("+value+");\n";
				break;

			// handle booleans
			case "boolean":
				_out +=		"if (typeof("+value+") !== 'boolean') console.warn('Type Mismatch: Value should be a boolean, got a '+typeof("+value+"));\n";
				_out +=		tab+key+" = "+value+" ? true:false;\n";
				break;

			case "object":
				_out +=		"if (typeof("+value+") !== 'object') console.warn('Type Mismatch: Value should be a object, got a '+typeof("+value+"));\n";
				_out +=		tab+key+" = "+value+"\n";
				break;

			// everything else
			default:
				_out +=		key+" = "+value+"; // "+type+"\n";
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

		_out +=			"if (!("+value+" instanceof NewgroundsIO_objects_"+obj+"))\n";
		_out +=	tab +	"	console.warn(\"Type Mismatch: expecting NewgroundsIO_objects_"+obj+", got \"+typeof("+value+"));\n\n"
		_out +=	tab +	key+" = "+value+";";
		
		return _out;
	},


	/**
	 * Generates the JS code for a component class
	 * @param {string} componentName The name of the object beinggenerated
	 * @param {object} componentData All the data about the object from the main document
	 * @return {string}
	 */
	generateComponent: function(componentName,componentData) 
	{
		var out = "";

		// class description	
		if (componentData.description) {

			out +=				"/**\n";
			out +=				" * "+this.formatJSDocDescription(componentData.description, "")+"\n";
			out +=				" */\n";
		}

		// class definition and constructor
		out +=	 				"class NewgroundsIO_components_"+componentName+" {\n\n";

		out +=					"	/**\n";
		out +=					"	 * Constructor\n";
		out +=					"	 * @param {NegroundsIO} ngio_core A core NewgroundsIO instance\n";
		out +=					"	 */\n";
		out +=					"	constructor(ngio_core)\n";
		out +=					"	{\n";
		out +=					"		if (!(ngio_core instanceof NewgroundsIO))\n";
		out +=					"			throw('Missing/invalid required ngio_core');\n\n";
		out +=					"		this._core = ngio_core;\n";
		out +=					"	}\n\n";

		for (const [method, data] of Object.entries(componentData.methods)) {

			out +=				"	/**\n";

			if (data.description) {
				out +=			"	 * "+this.formatJSDocDescription(data.description, "	")+"\n";
			}

			if (data.params) {
				out += 			"	 * @param {Object} parameters\n";
				for (const [param, rules] of Object.entries(data.params)) {
					out +=		"	 * @param {"+this.getJSNativeType(rules.type)+"} parameters."+param+" "+(rules.description ? this.formatJSDocDescription(rules.description, "	") : '')+"\n";
				}
			}
			out += 				"	 * @param {Function} callback optional function to call when component results are loaded from server\n";
			out += 				"	 * @param {mixed} callbackObj optional object to use for 'this' context in callback function\n";
			out +=				"	 */\n";

			if (data.params) {
				out +=			"	"+method+"(parameters, callback, callbackObj)\n";
			} else {
				out +=			"	"+method+"(callback, callbackObj)\n";
			}

			out +=				"	{\n";

			if (data.require_session === true) {
				out +=			"		if (!this._core.hasValidSession()) {\n";
				out +=			"			console.error('User must have a valid session to call "+componentName+"."+method+"');\n";
				out +=			"			return;\n";
				out +=			"		}\n\n";
			}

			if (data.params) {

				out +=			"		var packet = {};\n\n";
				
				for (const [param, rules] of Object.entries(data.params)) {

					if (rules.extract_from) {
						out += 	"		if (typeof(parameters."+rules.extract_from.alias+") !== 'undefined') {\n";
						out += 	"			if (parameters."+rules.extract_from.alias+" instanceof NewgroundsIO_objects_"+rules.extract_from.object+")\n";
						out +=	"				parameters."+param+" = parameters."+rules.extract_from.alias+"."+rules.extract_from.property+";\n";
						out +=	"			else\n";
						out +=	"				console.error('parameters."+rules.extract_from.alias+" must be NewgroundsIO_objects_"+rules.extract_from.object+" instance');\n";
						out +=	"		}\n\n";
					}

					if (rules.required === true) {
						out +=	"		if (typeof(parameters["+param+"]) === 'undefined') {\n";
						out +=	"			console.error(\"Missing required property '"+param+"' in "+componentName+"."+method+"\")\n";
						out +=	"			return;\n";
						out +=	"		}\n\n";
					}

					if (rules.object) {
						out += 	"		"+(this.castObject('packet.'+param, 'parameters.'+param, rules.object, '		'))+"\n";
					} else {
						out += 	"		"+(this.castValue('packet.'+param, 'parameters.'+param, rules.type, '		'))+"\n";
					}
				}

			}

			let extra = "";

			if (data.redirect) {
				out +=			"		let _redirect = parameters.redirect !== false;\n"
				extra = ", _redirect";
			}

			if (data.params) {
				out +=			"		this._core.doCallComponent(\""+componentName+"."+method+"\", packet, callback, callbackObj"+extra+");\n";
			} else {
				out +=			"		this._core.doCallComponent(\""+componentName+"."+method+"\", {}, callback, callbackObj"+extra+");\n";
			}

			out +=				"	}\n\n";
		
		}

		out += 					"}\n\n";

		out += 					"// Make an alias for this class so it can be used dynamically with string names\n";
		out += 					"NewgroundsIO.components."+componentName+" = NewgroundsIO_components_"+componentName+";";

		return out;
	},

	/**
	 * Generates the JS code for an object class
	 * @param {string} objectName The name of the object beinggenerated
	 * @param {object} objectData All the data about the object from the main document
	 * @return {string}
	 */
	generateObject: function(objectName,objectData) 
	{
		var out = "";

		// class description	
		out += 					"/**\n";
		if (objectData.description)
			out += 				" * "+this.formatJSDocDescription(objectData.description, "")+"\n";
		out += 					" */\n";

		// class definition.  We will be extending a
		out += 					"class NewgroundsIO_objects_"+objectName+" {\n\n";

		let properties = [];
		for (const [name, obj] of Object.entries(objectData.properties)) {
			properties.push(name);
		};

		// constructor
			out += 				"	constructor(props)\n";
			out += 				"	{\n";
			out += 				"		this.__properties = "+JSON.stringify(properties)+";\n";

			let _required = [];

			out += 				"		if (typeof(props) === 'object') {\n";
			// set initial property values
			for (const [name, obj] of Object.entries(objectData.properties)) {

				// prefixing actual properties with "_" because end-user will be accessing via get/set methods
				// initial values can be set in the constructor, or will be null by default
				out +=			"			this._"+name+" = typeof(props."+name+") !== 'undefined' ? props["+name+"] : null;\n";

				// keep track of required properties
				if (obj.required === true) _required.push(name);
			}
			out += 				"		}\n";

			// set requited properties
			out += 				"\n";
			out += 				"		this.__required = "+JSON.stringify(_required)+";\n";

			out += 				"	}\n\n";
		// end constructor


		// getter/setters for properties
		for (const [name, obj] of Object.entries(objectData.properties)) {

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

			/* ============================= handle properties that can be passed as typecast arrays ============================= */
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
			}

			if (obj.type) {
				out += 			"		"+(this.castValue('this._'+name, '_'+name, obj.type, '		'))+"\n";
			}

			out += 				"	}\n\n";
		}
		// end getter/setters for properties

		out +=					"	function toJSON()\n";
		out +=					"	{\n";
		out +=					"		var out = {};";
		out +=					"		this.__properties.forEach(prop => out[prop] = this[prop]);";
		out +=					"		return out;";
		out +=					"	}\n";
		out +=					"}\n\n";
		// end class

		out +					"// Alias to the NewgroundsIO.objects namespace\n";
		out +					"NewgroundsIO.objects."+objectName+" = NewgroundsIO_objects_"+objectName+";";

		return out;
	}
}