'use strict';
const fs = require('fs');

module.exports = {
	
	generateObject: function(objectName,objectData) {

		/**
		 * Converts type names from the object document to native JavaScript types
		 * @param {string} type_from_doc The data type as defined in the document
		 * @return {string} The comparable JavaScript type
		 */
		function getJSNativeType(type_from_doc)
		{
			var replace = [
				[ 'int',    'float',  'string', 'bool',    'object' ],
				[ 'Number', 'Number', 'String', 'Boolean', 'Object' ]
			];

			let i = replace[0].indexOf(type_from_doc);

			return i >= 0 ? replace[1][i] : type_from_doc;
		}

		/**
		 * Gets the type(s) a poperty can use, for JSDoc comments
		 * @param {object} property The property object from the objects document
		 * @returns {string} a JSDoc-friendly type string
		 */
		function getJSDocCastType(property) {

			// convert types from the doc to native JS types

			// this property can accept an array of values
			if (typeof(property.array) !== 'undefined') {
				let atype = getJSDocCastType(property.array);
				let otype = getJSDocCastType({type: property.type, object: property.object});

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
			return getJSNativeType(property.type);
		}

		/**
		 * Formats descriptions, from the object document, to JSDoc-friendly strings
		 * @param {string} description The original description text
		 * @param {string} tab Any additional indentation to add to new lines
		 * @return {string}
		 */
		function formatJSDocDescription(description, tab) {
			// replaces # notations with full class paths, and adds * and indentation to any newlines in the string.
			return description.replaceAll("#","NewgroundsIO_objects_").split("\n").join("\n"+tab+" * ");
		}


		/**
		 * Generates code for typecasting and error checking of native datatypes in setter methods
		 * @param {string} key The property or variable name that needs strict casting
		 * @param {string} value The name of the value variable
		 * @param {string} type The value type from the document (may need translating)
		 * @param {string} tab Any additional indenting to apply to new lines
		 * @returns {string} JavaScript code to handle strict typecasting
		 */
		function castValue(key,value,type,tab) {

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
				case "bool":
					_out +=		"if (typeof("+value+") !== 'boolean') console.warn('Type Mismatch: Value should be a boolean, got a '+typeof("+value+"));\n";
					_out +=		tab+key+" = "+value+" ? true:false;\n";
					break;

				case "object":
					_out +=		"if (typeof("+value+") !== 'object') console.warn('Type Mismatch: Value should be a object, got a '+typeof("+value+"));\n";
					_out +=		tab+key+" = "+value+"\n";
					break;

				// everything else
				default:
					_out +=		key+" = "+value+";\n";
			}

			return _out;
		}

		/**
		 * Generates code for typecasting and error checking of class instances in setter methods
		 * @param {string} key The property or variable name that needs strict casting
		 * @param {string} value The name of the value variable
		 * @param {string} obj The class name the value is expected to be an instance of
		 * @param {string} tab Any additional indenting to apply to new lines
		 * @returns {string} JavaScript code to handle strict typecasting
		 */
		function castObject(key,value,obj,tab) {

			let _out = "";

			_out +=			"if (!("+value+" instanceof NewgroundsIO_objects_"+obj+"))\n";
			_out +=	tab +	"	console.warn(\"Type Mismatch: expecting NewgroundsIO_objects_"+obj+", got \"+typeof("+value+"));\n\n"
			_out +=	tab +	key+" = "+value+";";
			
			return _out;
		}


		/* =================================== START OUTPUT ========================================== */

		var out = "";

		// class description	
		out += 		"/**\n";
		if (objectData.description)
			out += 	" * "+formatJSDocDescription(objectData.description, "")+"\n";
		out += 		" */\n";

		// class definition.  We will be extending a
		out += 		"class NewgroundsIO_objects_"+objectName+" extends NewgroundsIO_object {\n\n";


		// constructor
			out += 		"	constructor(props)\n";
			out += 		"	{\n";
			out += 		"		super()\n";

			let _required = [];

			out += 		"		if (typeof(props) === 'object') {\n";
			// set initial property values
			for (const [name, obj] of Object.entries(objectData.properties)) {

				// prefixing actual properties with "_" because end-user will be accessing via get/set methods
				// initial values can be set in the constructor, or will be null by default
				out +=	"			this._"+name+" = typeof(props."+name+") !== 'undefined' ? props["+name+"] : null;\n";

				// keep track of required properties
				if (obj.required === true) _required.push(name);
			}
			out += 		"		}\n";

			// set requited properties
			out += "\n";
			out += "		this.__required = "+JSON.stringify(_required)+";\n";

			out += 		"	}\n\n";
		// end constructor


		// getter/setters for properties
		for (const [name, obj] of Object.entries(objectData.properties)) {

			// JSDoc description
			out +=			"	/**\n";
			if (obj.description)
				out +=		"	 * "+formatJSDocDescription(obj.description, "	")+"\n";
			out += 			"	 * @type {"+getJSDocCastType(obj)+"}\n";
			out +=			"	 */\n";

			// Getter
			out += 			"	get "+name+"()\n";
			out += 			"	{\n";
			out += 			"		return this._"+name+";\n";
			out += 			"	}\n\n";

			out += 			"	set "+name+"(_"+name+")\n";
			out += 			"	{\n";

			/* ============================= handle properties that can be passed as typecast arrays ============================= */
			if (obj.array) {

				out += 		"		if (Array.isArray(_"+name+")) {\n";

				if (obj.array.type === 'mixed') {

					out += 	"			"+(castValue('this._'+name, '_'+name, obj.array, '			'))+"\n";

				} else {

					out += 	"			let newArr = [];\n";
					out += 	"			_"+name+".forEach(function(val,index) {\n";

					if (obj.array.object) {
						out += 	"				"+(castObject('newArr[index]', 'val', obj.array.object, '				'))+"\n";
					} else {
						out += 	"				"+(castValue('newArr[index]', 'val', obj.array.type, '				'))+"\n";
					}
					out += 	"			});\n";
					out += 	"			this._"+name+" = newArr;\n";

				}

				out += 		"			return;\n";
				out += 		"		}\n\n";
			}

			if (obj.object) {
				out += 	"		"+(castObject('this._'+name, '_'+name, obj.object, '		'))+"\n";
			}

			if (obj.type) {
				out += 	"		"+(castValue('this._'+name, '_'+name, obj.type, '		'))+"\n";
			}

			out += "	}\n\n";
		}
		// end getter/setters for properties

		out += '}\n';
		// end class

		return out;
	}
}