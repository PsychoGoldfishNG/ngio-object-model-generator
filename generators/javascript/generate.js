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
	 * @return {Array[string,string]} An array containing the filename to save, and the javascript contents
	 */
	generateComponentObject: function(componentName,methodName,methodData,partials) 
	{
		let objectName = componentName+"."+methodName;
		let className = methodName;
		let nameSpace = "NewgroundsIO.components."+componentName;
		let baseClass = "NewgroundsIO.BaseComponent";
		let objectData = methodData.params;
		let componentProps = methodData;

		let out = this.generateObjectClass(objectName, className, nameSpace, baseClass, objectData, componentProps, partials);

		let filename = componentName+"/"+methodName+".js";
		return [filename,out];
	},

	/**
	 * Generates the JS code for a component class
	 * @param {string} componentName The name of the component
	 * @param {string} methodName The name of the method
	 * @param {object} resultData All the data about the result object
	 * @param {object} partials An optional partials module for this class
	 * @return {Array[string,string]} An array containing the filename to save, and the javascript contents
	 */
	generateResultObject: function(componentName,methodName,resultData,partials) 
	{
		let objectName = componentName+"."+methodName;
		let className = methodName;
		let nameSpace = "NewgroundsIO.results."+componentName;
		let baseClass = "NewgroundsIO.BaseResult";
		let objectData = resultData;

		let out = this.generateObjectClass(objectName, className, nameSpace, baseClass, objectData, {}, partials);

		let filename = componentName+"/"+methodName+".js";
		return [filename,out];
	},

	/**
	 * Generates the JS code for an object class
	 * @param {string} objectName The name of the object being generated
	 * @param {object} objectData All the data about the object from the main document
	 * @param {object} partials An optional partials module for this class
	 * @return {Array[string,string]} An array containing the filename to save, and the javascript contents
	 */
	generateObject: function(objectName,objectData,partials) 
	{
		let className = objectName;
		let nameSpace = "NewgroundsIO.objects";
		let baseClass = "NewgroundsIO.BaseObject";
		
		let out = this.generateObjectClass(objectName, className, nameSpace, baseClass, objectData.properties, {}, partials);

		let filename = objectName+".js";
		return [filename,out];
	},

	/**
	 * Generates the JS code for the above class types
	 * @param {string} objectName The string name of the object
	 * @param {string} className The name of the class
	 * @param {string} nameSpacce The namespace the class will be added to
	 * @param {object} objectData All the data about the object from the main document
	 * @param {object} partials An optional partials module for this class
	 * @return {string} the Javascript output
	 */
	generateObjectClass: function(objectName, className, nameSpace, baseClass, objectData, componentProps, partials)
	{
		var longName = nameSpace+"."+className;

		// skip any models that are purely abstract
		if (longName == "NewgroundsIO.objects.Result") return "";


		// some objects have abstract properties, so we'll have to do some overriding here
		if (objectData) {
			for (const [property, data] of Object.entries(objectData)) {

				// Override how the result property of the Repsonse object is defined
				if (longName == "NewgroundsIO.objects.Response" && property === "result") {
					delete data.object;
					data.type = "NewgroundsIO.BaseResult";
					data.array = {
						type: "NewgroundsIO.BaseResult"
					};
					data.description = "This will be a NewgroundsIO.results.XXXXXX object, or an array containing one-or-more NewgroundsIO.results.XXXXXX objects.";
				}
			}
		}


		var out = 				"(()=>{\n";
		out +=	 				"/** Start "+longName+" **/\n\n";

		// class description	
		if (objectData && typeof(objectData.description) === 'string') {
			out +=				"	/**\n";
			out +=				" * "+this.formatJSDocDescription(objectData.description, "")+"\n";
			out +=				"	 */\n";
		}

		// class definition
		out +=					"	class "+className+" extends "+baseClass+" {\n\n";

		// start constructor
		out +=					"		/**\n";
		out +=					"		 * Constructor\n";

		// generate parameter comments
		if (objectData && Object.keys(objectData).length > 0) {
			out +=				"		 * @param {object} props An object of initial properties for this instance\n";
			for (const [property, data] of Object.entries(objectData)) {
				out += 			"		 * @param {"+this.getJSDocCastType(data)+"} props."+property+" "+this.formatJSDocDescription(data.description)+"\n";
			}
		}
		out +=					"		 */\n";
		out +=					"		constructor("+(objectData ? 'props':'')+")\n";
		out +=					"		{\n";
		out +=					"			super();\n\n";
		out +=					"			this.__object = \""+objectName+"\";\n";

		let props = [];
		let required = [];
		let objectMap = {};
		let arrayMap = {};

		// render private(ish) vars for properties
		if (objectData) {
			for (const [property, data] of Object.entries(objectData)) {

				// all objects have this already
				if (property == "echo") continue;

				// record the property name
				props.push(property);

				// record anything that's required
				if (data.required === true) required.push(property);

				// ignore properties that are handled in partial code
				if (nameSpace === "NewgroundsIO.components.Loader" && property === "host") continue;
				if (longName === "NewgroundsIO.objects.Request" && (property === "app_id" || property === "session_id")) continue;


				out +=			"			this._"+property+" = null;\n";
			}
		}

		// render the names of any required properties in an array
		if (required.length > 0)
			out +=				"			this.__required = "+JSON.stringify(required)+";\n";

		// note if this is a secure component
		if (componentProps.secure === true)
			out +=				"			this.__isSecure = true;\n";

		// note if this is a component that requires a valid user session
		if (componentProps.require_session === true)
			out +=				"			this.__requireSession = true;\n";

		// render the names of all our properties to an array, and add some generic code for setting initial values
		// from the constructor's "prop" param.
		if (props.length > 0) {
			out +=				"			this.__properties = this.__properties.concat("+JSON.stringify(props)+");\n";
			out +=				"			if (props && typeof(props) === 'object') {\n";
			out +=				"				for(var i=0; i<this.__properties.length; i++) {\n";
			out +=				"					if (typeof(props[this.__properties[i]]) !== 'undefined') this[this.__properties[i]] = props[this.__properties[i]];\n";
			out +=				"				}\n";
			out +=				"			}\n";
		}

		// add any partial code that may exist for the constructor function
		if (partials && partials.getConstructorPartial) out += partials.getConstructorPartial();
		
		// end constructor code
		out +=					"		}\n\n";

		// Generate getter/setters for all of our properties
		if (objectData) {
			for (const [property, data] of Object.entries(objectData)) {

				// ignore properties that are handled in partial code
				if (nameSpace === "NewgroundsIO.components.Loader" && property === "host") continue;
				if (longName === "NewgroundsIO.objects.Request" && (property === "app_id" || property === "session_id")) continue;
				
				// add JSDoc comments
				out +=			"		/**\n";
				if (data.description) {
					out +=		"		 * "+this.formatJSDocDescription(data.description, "		")+"\n";
				}
				out +=			"		 * @type {"+this.getJSDocCastType(data)+"}\n";

				out +=			"		 */\n";

				// add the getter
				out +=			"		get "+property+"()\n";
				out +=			"		{\n";
				out +=			"			return this._"+property+";\n";
				out +=			"		}\n\n";

				// add the setter (it will have type-checking added via some helper methods)
				out +=			"		set "+property+"(_"+property+")\n";
				out +=			"		{\n";
				

				// convert flat objects to NGIO objects
				if (data.object) {

					out +=		"			if ("+(data.array ? "!Array.isArray(_"+property+") && " : "")+"!(_"+property+" instanceof NewgroundsIO.objects."+data.object+") && typeof(_"+property+") === 'object')\n";
					out +=		"				_"+property+" = new NewgroundsIO.objects."+data.object+"(_"+property+");\n\n";

					objectMap[property] = data.object;
				}

				// handle properties that can be set as arrays
				if (data.array) {

					out +=		"			if (Array.isArray(_"+property+")) {\n";

					// mixed stuff can just be accepted as-is
					if (data.array.type === 'mixed') {

						out += 	"				"+(this.castValue('this._'+property, '_'+property, data.array, '				'))+"\n";

					// iterate the array we were sent, and check types for each value.
					} else {

						out += 	"				let newArr = [];\n";
						out += 	"				_"+property+".forEach(function(val,index) {\n";

						if (data.array.object) {
							out+= "					"+(this.castObject('newArr[index]', 'val', data.array.object, '					'))+"\n";
							arrayMap[property] = data.array.object;
						} else {
							out+= "					"+(this.castValue('newArr[index]', 'val', data.array.type, '					'))+"\n";
						}
						out += 	"				});\n";
						out += 	"				this._"+property+" = newArr;\n";

					}

					out +=		"				return;\n";
					out +=		"			}\n\n";
				}

				// handle objects and flat values
				if (data.object) {
					out += 		"			"+(this.castObject('this._'+property, '_'+property, data.object, '			'))+"\n";
				} else if (data.type) {
					out += 		"			"+(this.castValue('this._'+property, '_'+property, data.type, '			'))+"\n";
				}
				out +=			"		}\n\n";
			}

			// render our object and array maps

			if (Object.keys(objectMap).length)
				out +=			"		objectMap = " + JSON.stringify(objectMap) +";\n\n";
			
			if (Object.keys(arrayMap).length)
				out +=			"		arrayMap = " + JSON.stringify(arrayMap) +";\n\n";

		}
		// End of getter/setters

		// add any partial code that may exist for the overall class
		if (partials && partials.getClassPartial) out += partials.getClassPartial();

		out +=					"	}\n\n";
		out +=	 				"/** End Class "+longName+" **/\n";
		// end of class

		// add the class to the apropriate namespace
		out +=					"if (typeof("+nameSpace+") === 'undefined') "+nameSpace+" = {};\n";
		out +=					longName+" = "+className+";\n\n";

		out +=					"})();\n\n";

		// all done!
		return out;
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
		if (typeof(property.object) !== 'undefined') return 'NewgroundsIO.objects.'+property.object;

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
		if (!description) return "";
		// replaces # notations with full class paths, and adds * and indentation to any newlines in the string.
		return description.replaceAll("\n\n","\n").replaceAll("#","NewgroundsIO.objects.").split("\n").join("\n"+tab+" *        ");
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

				_out +=			"if (typeof("+value+") !== 'number' && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a number, got', "+value+");\n";
				if (is_int) {
					_out += 	tab+"else if (!Number.isInteger("+value+") && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be an integer, got a float');\n";
				}
				_out +=			tab+key+" = Number("+value+");\n";
				_out +=			tab+"if (isNaN("+key+")) "+key+" = null;\n";
				break;

			// handle strings
			case "string":
				_out +=			"if (typeof("+value+") !== 'string' && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a string, got', "+value+");\n";
				_out +=			tab+key+" = String("+value+");\n";
				break;

			// handle booleans
			case "boolean":
				_out +=			"if (typeof("+value+") !== 'boolean' && typeof("+value+") !== 'number' && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a boolean, got', "+value+");\n";
				_out +=			tab+key+" = "+value+" ? true:false;\n";
				break;

			case "object":
				_out +=			"if (typeof("+value+") !== 'object' && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a object, got', "+value+");\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO.BaseObject":
				_out +=			"if (!("+value+" instanceof NewgroundsIO.BaseObject) && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO.objects.XXXX instance, got', "+value+");\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO.BaseComponent":
				_out +=			"if (!("+value+" instanceof NewgroundsIO.BaseComponent) && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO.components.XXXX instance, got', "+value+");\n";
				_out +=			tab+key+" = "+value+"\n";
				break;

			case "NewgroundsIO.BaseResult":
				_out +=			"if (!("+value+" instanceof NewgroundsIO.BaseResult) && "+value+" !== null) console.warn('NewgroundsIO Type Mismatch: Value should be a NewgroundsIO.results.XXXX instance, got', "+value+");\n";
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

		_out +=					"	if ("+value+" !== null && !("+value+" instanceof NewgroundsIO.objects."+obj+"))\n";
		_out +=	tab +			"	console.warn(\"Type Mismatch: expecting NewgroundsIO.objects."+obj+", got \","+value+");\n\n"
		_out +=	tab +			key+" = "+value+";";
		
		return _out;
	}

}