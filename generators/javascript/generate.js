'use strict';
const fs = require('fs');

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {
	
	/* =========================================== CODE GENERATORS =========================================== */

	/* ------------------------------------------- Componet Objetcs ------------------------------------------- */

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
		const template = `
/**
 * Used to call the ${componentName}.${methodName} component.
 */
class NewgroundsIO_components_${componentName}_${methodName} extends NewgroundsIO_components {

	/**
	 * Constructor
	${methodData.params && Object.keys(methodData.params).length > 0 ? '@param {object} props An object of initial properties for this instance' : ''}
	 */
	constructor(${methodData.params ? 'props' : ''}) {
		super();
		this.__object = "${componentName}.${methodName}";
		${methodData.params ? Object.entries(methodData.params).map(([property, data]) => `this._${property} = null;`).join('\n\t\t') : ''}
		${methodData.params ? `this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(methodData.params))});` : ''}
		${methodData.params ? `if (typeof(props) === 'object') {
			for (let i = 0; i < this.__properties.length; i++) {
				if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];
			}
		}` : ''}
		${methodData.secure ? 'this.__isSecure = true;' : ''}
		${methodData.require_session ? 'this.__requireSession = true;' : ''}
		${partials && partials.getConstructorPartial ? partials.getConstructorPartial() : ''}
	}

	${methodData.params ? Object.entries(methodData.params).map(([property, data]) => `
	/**
	${data.description ? ` * ${this.formatJSDocDescription(data.description, "	")}` : ''}
	 * @type {${this.getJSDocCastType(data)}}
	 */
	get ${property}() {
		return this._${property};
	}

	set ${property}(_${property}) {
		${data.object ? this.castObject(`this._${property}`, `_${property}`, data.object, '		') : data.type ? this.castValue(`this._${property}`, `_${property}`, data.type, '		') : ''}
	}
	`).join('\n\t') : ''}

	${partials && partials.getClassPartial ? partials.getClassPartial() : ''}
}

// Make an alias for this class so it can be used dynamically with string names
if (typeof(NewgroundsIO.components.${componentName}) === 'undefined') NewgroundsIO.components.${componentName} = {};
NewgroundsIO.components.${componentName}.${methodName} = NewgroundsIO_components_${componentName}_${methodName};
`;

		let filename = componentName + "/" + methodName + ".js";
		return [filename, template];

	},

	/* ------------------------------------------- Result Objetcs ------------------------------------------- */

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
		const template = `
/**
 * Returned when ${componentName}.${methodName} component is called
 */
class NewgroundsIO_results_${componentName}_${methodName} extends NewgroundsIO_results {

	/**
	 * Constructor
	${resultData && Object.keys(resultData).length > 0 ? '@param {object} props An object of initial properties for this instance' : ''}
	 */
	constructor(${resultData ? 'props' : ''}) {
		super();
		this.__object = "${componentName}.${methodName}";
		${resultData ? Object.entries(resultData).map(([property, data]) => `this._${property} = null;`).join('\n\t\t') : ''}
		${resultData ? `this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(resultData))});` : ''}
		${resultData ? `if (typeof(props) === 'object') {
			for (let i = 0; i < this.__properties.length; i++) {
				if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];
			}
		}` : ''}
		${partials && partials.getConstructorPartial ? partials.getConstructorPartial() : ''}
	}

	${resultData ? Object.entries(resultData).map(([property, data]) => `
	/**
	${data.description ? ` * ${this.formatJSDocDescription(data.description, "	")}` : ''}
	 * @type {${this.getJSDocCastType(data)}}
	 */
	get ${property}() {
		return this._${property};
	}

	set ${property}(_${property}) {
		${data.object ? `if (!(_${property} instanceof NewgroundsIO_objects_${data.object}) && typeof(_${property}) === 'object')
			_${property} = new NewgroundsIO_objects_${data.object}(_${property});` : ''}
		${data.object ? this.castObject(`this._${property}`, `_${property}`, data.object, '		') : data.type ? this.castValue(`this._${property}`, `_${property}`, data.type, '		') : ''}
	}
	`).join('\n\t') : ''}

	${partials && partials.getClassPartial ? partials.getClassPartial() : ''}
}

// Make an alias for this class so it can be used dynamically with string names
NewgroundsIO_results.registerComponent('${componentName}.${methodName}', NewgroundsIO_results_${componentName}_${methodName});
if (typeof(NewgroundsIO.results.${componentName}) === 'undefined') NewgroundsIO.results.${componentName} = {};
NewgroundsIO.results.${componentName}.${methodName} = NewgroundsIO_results_${componentName}_${methodName};
`;

		let filename = componentName + "/" + methodName + ".js";
		return [filename, template];
	},

	/* ------------------------------------------- Model Objetcs ------------------------------------------- */

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

		const template = `
/**
${objectData.description ? ` * ${this.formatJSDocDescription(objectData.description, "")}` : ''}
 */
class NewgroundsIO_objects_${objectName} extends NewgroundsIO_objects {

	/**
	 * Constructor
	${objectData.properties && Object.keys(objectData.properties).length > 0 ? '@param {object} props An object of initial properties for this instance' : ''}
	 */
	constructor(${objectData.properties ? 'props' : ''}) {
		super();
		this.__object = '${objectName}';
		${objectData.properties ? Object.entries(objectData.properties).map(([name, obj]) => `this._${name} = null;`).join('\n\t\t') : ''}
		${objectData.properties ? `this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(objectData.properties))});` : ''}
		${objectData.properties ? `if (typeof(props) === 'object') {
			for (let i = 0; i < this.__properties.length; i++) {
				if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];
			}
		}` : ''}
		${objectData.properties ? `this.__required = ${JSON.stringify(Object.keys(objectData.properties).filter(name => objectData.properties[name].required))};` : ''}
		${partials && partials.getConstructorPartial ? partials.getConstructorPartial() : ''}
	}

	${objectData.properties ? Object.entries(objectData.properties).map(([name, obj]) => `
	/**
	${obj.description ? ` * ${this.formatJSDocDescription(obj.description, "	")}` : ''}
	 * @type {${this.getJSDocCastType(obj)}}
	 */
	get ${name}() {
		return this._${name};
	}

	set ${name}(_${name}) {
		${obj.array ? `if (Array.isArray(_${name})) {
			let newArr = [];
			_${name}.forEach(function(val, index) {
				${obj.array.object ? this.castObject('newArr[index]', 'val', obj.array.object, '				') : this.castValue('newArr[index]', 'val', obj.array.type, '				')}
			});
			this._${name} = newArr;
			return;
		}` : ''}
		${obj.object ? this.castObject(`this._${name}`, `_${name}`, obj.object, '		') : this.castValue(`this._${name}`, `_${name}`, obj.type, '		')}
	}
	`).join('\n\t') : ''}

	${partials && partials.getClassPartial ? partials.getClassPartial() : ''}
}

// Alias to the NewgroundsIO.objects namespace
NewgroundsIO.objects.${objectName} = NewgroundsIO_objects_${objectName};
`;

		let filename = objectName + ".js";
		return [filename, template];
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

				_out += `if (typeof(${value}) !== 'number') console.warn('NewgroundsIO Type Mismatch: Value should be a number, got a '+typeof(${value}));\n`;
				if (is_int) {
					_out += `${tab}else if (!Number.isInteger(${value})) console.warn('NewgroundsIO Type Mismatch: Value should be an integer, got a float');\n`;
				}
				_out += `${tab}${key} = Number(${value});\n`;
				_out += `${tab}if (isNaN(${key})) ${key} = null;\n`;
				break;

			// handle strings
			case "string":
				_out += `if (typeof(${value}) !== 'string') console.warn('NewgroundsIO Type Mismatch: Value should be a string, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = String(${value});\n`;
				break;

			// handle booleans
			case "boolean":
				_out += `${tab}if (typeof(${value}) !== 'boolean') console.warn('NewgroundsIO Type Mismatch: Value should be a boolean, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value} ? true : false;\n`;
				break;

			case "object":
				_out += `${tab}if (typeof(${value}) !== 'object') console.warn('NewgroundsIO Type Mismatch: Value should be an object, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			case "NewgroundsIO_objects":
				_out += `${tab}if (!(${value} instanceof NewgroundsIO_objects)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_objects instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			case "NewgroundsIO_components":
				_out += `${tab}if (!(${value} instanceof NewgroundsIO_components)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_components instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			case "NewgroundsIO_results":
				_out += `${tab}if (!(${value} instanceof NewgroundsIO_results)) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO_results instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			// everything else
			default:
				_out += `${tab}${key} = ${value}; // ${type}\n`;
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
		return `
			if (!(${value} instanceof NewgroundsIO_objects_${obj})) {
				console.warn("Type Mismatch: expecting NewgroundsIO_objects_${obj}, got " + typeof(${value}));
			}
			${key} = ${value};
		`;
	}

}