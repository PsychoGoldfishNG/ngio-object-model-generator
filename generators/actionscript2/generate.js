'use strict';
const fs = require('fs');

/**
 * This module is used to generate object model and component validation classes in ActionScript 2.0
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
	generateComponentObject: function(componentName, methodName, methodData, partials) {
		let lines = [];

		// --- start template ----------------------------------------------------------------------------------------------------------------------------------------------//

		lines.push(								"/** ActionScript 2.0 **/"																									);
		lines.push(								"/** Auto-genertaed by ngio-object-model-generator: https://github.com/PsychoGoldfishNG/ngio-object-model-generator **/"	);
		lines.push(								""																															);
		lines.push(								"import io.newgrounds.models.BaseObject;"																					);
		lines.push(								"import io.newgrounds.models.BaseComponent;"																				);

		if (partials && partials.getImportPartial) {
			lines.push(partials.getImportPartial());
		}

		lines.push(								""																															);
		lines.push(								"/**"																														);
		lines.push(								` * Used to call the ${componentName}.${methodName} component.`																);
		lines.push(								" */"																														);
		lines.push(								`class io.newgrounds.models.components.${componentName}.${methodName} extends io.newgrounds.models.BaseComponent {`			);

		if (methodData.params) {
			Object.entries(methodData.params).forEach(([property, data]) => {

				lines.push(						`	private var ___${property}${this.getDataType(data) !== "*" ? ":" + this.getDataType(data) : ''};`						);

			});
		}

		lines.push(								""																															);
		lines.push(								"	/**"																													);
		lines.push(								`	* Constructor ${methodData.params ? "\n	* @param props An object of initial properties for this instance" : ''}`		);
		lines.push(								"	*/"																														);
		lines.push(								`	public function ${methodName}(${methodData.params ? 'props:Object' : ''}) {`											);
		lines.push(								"		super();"																											);
		lines.push(								`		this.__object = "${componentName}.${methodName}";`																	);

		if (methodData.params) {
			Object.entries(methodData.params).forEach(([property, data]) => {

				lines.push(						`		this.___${property} = ${typeof(data.default) !== 'undefined' ? JSON.stringify(data.default) : 'null'};`				);

			});

			lines.push(							`		this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(methodData.params))});`					);
		}

		lines.push(								`		this.__isSecure = ${methodData.secure ? 'true' : 'false'};`															);
		lines.push(								`		this.__requireSession = ${methodData.require_session ? 'true' : 'false'};`											);
		lines.push(								`		this.__isRedirect = ${methodData.redirect ? 'true' : 'false'};`														);
		lines.push(								"		this.__castTypes = {};"																								);
		lines.push(								"		this.__arrayTypes = {};"																							);

		if (methodData.params && Object.keys(methodData.params).length > 0) {
			Object.entries(methodData.params).forEach(([name, obj]) => {
				if (obj.object === 'Result') {
					
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.BaseResult;`														);

				} else {

					if (obj.array && obj.array.object) {
					
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.array.object};`										);
					lines.push(					`		this.__arrayTypes.${name} = true;`										);

					} else {
						if (obj.object) {
			
							lines.push(			`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.object};`												);

						}
						if (obj.array) {
			
							lines.push(			`		this.__arrayTypes.${name} = true;`																					);

						}
					}
				}
			});
		}

		if (methodData.params) {
			lines.push(							"		this.fillProperties(props);"																						);
		}

		if (partials && partials.getConstructorPartial) {
			lines.push(partials.getConstructorPartial());
		}

		lines.push(								"	}"																														);

		if (methodData.params) {
			Object.entries(methodData.params).forEach(([property, data]) => {
				if (data.description) {
					lines.push(					"	/**"																													);
					lines.push(					`	* ${this.formatASDocDescription(data.description, "	")}`																);
					lines.push(					"	*/"																														);
				}
				lines.push(						`	public function get ${property}()${this.getDataType(data) !== "*" ? ":" + this.getDataType(data) : ''} {`				);
				lines.push(						`		return this.___${property};`																						);
				lines.push(						"	}"																														);
				lines.push(						""																															);
				lines.push(						"	/**"																													);
				lines.push(						"	* @private"																												);
				lines.push(						"	*/"																														);
				lines.push(						`	public function set ${property}(___${property}${this.getDataType(data) !== "*" ? ":" + this.getDataType(data) : ''}) {`	);
				lines.push(						`		${this.generateSetter(property, data)}`																				);
				lines.push(						"	}"																														);
			});
		}

		if (partials && partials.getClassPartial) {
			lines.push(partials.getClassPartial()																															);
		}

		lines.push(								"}"																															);

		// --- end template ------------------------------------------------------------------------------------------------------------------------------------------------//
		


		let template = lines.join('\n');
		template = template.split('\n').map(line => line.trim() === '' && line !== "\n" ? '' : line).join('\n');
		template = template.replace(/\n\n\n/g, "\n\n");

		let filename = componentName + "/" + methodName + ".as";
		return [filename, template];
	},

	generateSetProperty: function(data) {
		let lines = [];


		// --- start template ----------------------------------------------------------------------------------------------------------------------------------------------//

		lines.push(								"public function setProperty(name:String, value):Void {"																	);
		lines.push(								"	switch (name) {"																										);

		if (data) {
			Object.entries(data).forEach(([property, data]) => {
				lines.push(						`		case "${property}":`																								);
				lines.push(						`			// ${JSON.stringify(data)};`																					);
				lines.push(						"			break;"																											);
			});
		}

		lines.push(								"		default:"																											);
		lines.push(								"			this[name] = value;"																							);
		lines.push(								"	}"																														);
		lines.push(								"}"																															);

		// --- end template ------------------------------------------------------------------------------------------------------------------------------------------------//

		return lines.join('\n');
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
	generateResultObject: function(componentName, methodName, resultData, partials) {
		let lines = [];

		// --- start template --------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

		lines.push(								"/** ActionScript 2.0 **/"																																);
		lines.push(								"/** Auto-genertaed by ngio-object-model-generator: https://github.com/PsychoGoldfishNG/ngio-object-model-generator **/"								);
		lines.push(								""																																						);
		lines.push(								"import io.newgrounds.models.BaseObject;"																												);
		lines.push(								"import io.newgrounds.models.BaseResult;"																												);

		if (partials && partials.getImportPartial) {
			lines.push(partials.getImportPartial());
		}

		lines.push(								""																																						);
		lines.push(								"/**"																																					);
		lines.push(								` * Returned when ${componentName}.${methodName} component is called`																					);
		lines.push(								" */"																																					);
		lines.push(								`class io.newgrounds.models.results.${componentName}.${methodName} extends io.newgrounds.models.BaseResult {`											);

		if (resultData && Object.keys(resultData).length > 0) {
			Object.entries(resultData).forEach(([property, data]) => {

				lines.push(						`	private var ___${property}${this.getDataType(data) !== "*" ? ":" + this.getDataType(data) : ''};`													);
			
			});
		}

		lines.push(								""																																						);
		lines.push(								"	/**"																																				);
		lines.push(								`	* Constructor ${resultData && Object.keys(resultData).length > 0 ? "\n	 * @param props An object of initial properties for this instance" : ''}`	);
		lines.push(								"	*/"																																					);
		lines.push(								`	public function ${methodName}(${resultData && Object.keys(resultData).length > 0 ? 'props:Object' : ''}) {`											);
		lines.push(								"		super();"																																		);
		lines.push(								`		this.__object = "${componentName}.${methodName}";`																								);

		if (resultData && Object.keys(resultData).length > 0) {

			lines.push(							`		this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(resultData))});`														);
			lines.push(							"		this.__castTypes = {};"																															);
			lines.push(							"		this.__arrayTypes = {};"																														);

			Object.entries(resultData).forEach(([name, obj]) => {
				if (obj.object === 'Result') {
					
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.BaseResult;`																					);
					lines.push(					`		this.__arrayTypes.${name} = true;`																												);

				} else if (obj.array && obj.array.object) {
					
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.array.object};`																	);
					lines.push(					`		this.__arrayTypes.${name} = true;`																												);

				} else {
					if (obj.object) {
						lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.object};`																		);
					}
					if (obj.array) {
						lines.push(					`		this.__arrayTypes.${name} = true;`																											);
					}
				}
			});

			lines.push(							"		this.fillProperties(props);"																													);
		}

		if (partials && partials.getConstructorPartial) {
			lines.push(partials.getConstructorPartial());
		}

		lines.push(								"	}"																																					);
		lines.push(								""																																						);

		if (resultData) {
			Object.entries(resultData).forEach(([property, data]) => {
				if (data.description) {
					lines.push(					"	/**"																																				);
					lines.push(					`	* ${this.formatASDocDescription(data.description, "	")}`																							);
					lines.push(					"	*/"																																					);
				}
				lines.push(						`	public function get ${property}()${this.getDataType(data) !== "*" ? ':' + this.getDataType(data) : ''} {`											);
				lines.push(						`		return this.___${property};`																													);
				lines.push(						"	}"																																					);
				lines.push(						""																																						);
				lines.push(						"	/**"																																				);
				lines.push(						"	* @private"																																			);
				lines.push(						"	*/"																																					);
				lines.push(						`	public function set ${property}(___${property}${this.getDataType(data) !== "*" ? ':' + this.getDataType(data) : ''}) {`								);
				lines.push(						`		${this.generateSetter(property, data)}`																											);
				lines.push(						"	}"																																					);
			});
		}

		if (partials && partials.getClassPartial) {
			lines.push(partials.getClassPartial());
		}

		lines.push(								"}"																																						);

		// --- end template ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

		let template = lines.join('\n');
		template = template.split('\n').map(line => line.trim() === '' && line !== "\n" ? '' : line).join('\n');
		template = template.replace(/\n\n\n/g, "\n\n");

		let filename = componentName + "/" + methodName + ".as";
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
	generateObject: function(objectName, objectData, partials) {
		// don't make a model for this...
		if (objectName === "Result") return "";

		let lines = [];

		// --- start template --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//

		lines.push(								"/** ActionScript 2.0 **/"																																						);
		lines.push(								"/** Auto-genertaed by ngio-object-model-generator: https://github.com/PsychoGoldfishNG/ngio-object-model-generator **/"														);
		lines.push(								""																																												);
		lines.push(								"import io.newgrounds.models.BaseObject;"																																		);
		
		if (partials && partials.getImportPartial) {
			lines.push(partials.getImportPartial());
		}
		
		lines.push(								""																																												);

		if (objectData.description) {
			lines.push(							"/**"																																											);
			lines.push(							` * ${this.formatASDocDescription(objectData.description, "")}`																													);
			lines.push(							" */"																																											);
		}

		lines.push(								`class io.newgrounds.models.objects.${objectName} extends io.newgrounds.models.BaseObject {`																					);

		if (objectData.properties && Object.keys(objectData.properties).length > 0) {
			Object.entries(objectData.properties).forEach(([name, obj]) => {

				lines.push(						`	private var ___${name}${this.getDataType(obj) === "*" ? '' : `:${this.getDataType(obj)}`};`																					);

			});
		}

		lines.push(								""																																												);
		lines.push(								"	/**"																																										);
		lines.push(								`	 * Constructor ${objectData.properties && Object.keys(objectData.properties).length > 0 ? "\n	 * @param props An object of initial properties for this instance" : ''}`	);
		lines.push(								"	 */"																																										);
		lines.push(								`	public function ${objectName}(${objectData.properties ? 'props:Object' : ''}) {`																							);
		lines.push(								"		super();"																																								);
		lines.push(								`		this.__object = '${objectName}';`																																		);

		if (objectData.properties && Object.keys(objectData.properties).length > 0) {
			lines.push(							`		this.__properties = this.__properties.concat(${JSON.stringify(Object.keys(objectData.properties))});`																	);
			lines.push(							`		this.__required = ${JSON.stringify(Object.keys(objectData.properties).filter(name => objectData.properties[name].required))};`											);
		}

		lines.push(								"		this.__castTypes = {};"																																					);
		lines.push(								"		this.__arrayTypes = {};"																																				);

		if (objectData.properties && Object.keys(objectData.properties).length > 0) {
			Object.entries(objectData.properties).forEach(([name, obj]) => {
				if (obj.object === 'Result') {

					lines.push(					`		this.__arrayTypes.${name} = true;`																																		);
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.BaseResult;`																											);

				} else if (obj.array && obj.array.object) {

					lines.push(					`		this.__arrayTypes.${name} = true;`																																		);
					lines.push(					`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.array.object};`																							);

				} else {
					if (obj.array) {

						lines.push(				`		this.__arrayTypes.${name} = true;`																																		);
					}
					if (obj.object) {

						lines.push(				`		this.__castTypes.${name} = io.newgrounds.models.objects.${obj.object};`																									);
					}
				}
			});
			lines.push(							"		this.fillProperties(props);"																																			);
		}

		if (partials && partials.getConstructorPartial) {
			lines.push(partials.getConstructorPartial());
		}

		lines.push(								"	}"																																											);

		if (objectData.properties && Object.keys(objectData.properties).length > 0) {
			Object.entries(objectData.properties).forEach(([name, obj]) => {

				if (obj.description) {

					lines.push(					"	/**"																																										);
					lines.push(					`	 * ${this.formatASDocDescription(obj.description, "	")}`);
					lines.push(					"	 */"																																										);

				}
				lines.push(						`	public function get ${name}()${this.getDataType(obj) === "*" ? '' : `:${this.getDataType(obj)}`} {`																			);
				lines.push(						`		return this.___${name};`																																				);
				lines.push(						"	}"																																											);
				lines.push(						""																																												);
				lines.push(						"	/**");
				lines.push(						"	 * @private");
				lines.push(						"	 */"																																										);
				lines.push(						`	public function set ${name}(___${name}${this.getDataType(obj) === "*" ? '' : `:${this.getDataType(obj)}`}) {`																);
				lines.push(						`		${this.generateSetter(name, obj)}`																																		);
				lines.push(						"	}"																																											);
			});
		}

		if (partials && partials.getClassPartial) {
			lines.push(partials.getClassPartial());
		}

		lines.push(								"}"																																												);

		// --- end template ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//


		let template = lines.join('\n');
		template = template.split('\n').map(line => line.trim() === '' && line !== "\n" ? '' : line).join('\n');
		template = template.replace(/\n\n\n/g, "\n\n");

		let filename = objectName + ".as";
		return [filename, template];
	},

		/* ------------------------------------------- OBJECT INDEX ------------------------------------------- */

		generateObjectIndex: function(index)
		{
			const template = (data) => {
				let lines = [];

				// --- start template ----------------------------------------------------------------------------------------------------------------------------------------------//

				lines.push(						"/** ActionScript 2.0 **/"																											);
				lines.push(						""																																	);
				lines.push(						"class io.newgrounds.models.objects.ObjectIndex {"																					);
				lines.push(						""																																	);
				
				data.indexes.forEach(index => {
					
					lines.push(					`	public static function ${index.method}(name:String, json:Object) {`																);
					lines.push(					"		switch (name.toLowerCase()) {"																								);
					
					index.objects.forEach(obj => {
					
						const varname = "new_" + obj.split(".").join("_");
						const otype = index.namespace + obj;
						if (otype === "io.newgrounds.models.objects.Result" || otype === "io.newgrounds.models.objects.Execute") return;

						lines.push(				`			case "${obj.toLowerCase()}":`																							);
						lines.push(				`				return new ${otype}(json);`																			);
						lines.push(						``																															);
					
					});
					
					lines.push(					"		}"																															);
					lines.push(					"		return null;"																												);
					lines.push(					"	}"																																);
					lines.push(					""																																	);
				
				});
				
				lines.push(						"}"																																	);
				
				// --- end template ------------------------------------------------------------------------------------------------------------------------------------------------//

				return lines.join("\n");
			};

			const data = {
				indexes: [
					{ namespace: "io.newgrounds.models.objects.", method: "CreateObject", objects: index.objects, base: "io.newgrounds.models.BaseObject" },
					{ namespace: "io.newgrounds.models.components.", method: "CreateComponent", objects: index.components, base: "io.newgrounds.models.BaseComponent" },
					{ namespace: "io.newgrounds.models.results.", method: "CreateResult", objects: index.results, base: "io.newgrounds.models.BaseResult" }
				]
			};
	
			const out = template(data);
			const filename = "ObjectIndex.as";
			return [filename, out];
		},

	/* =========================================== HELPER METHODS =========================================== */

	/**
	 * Formats descriptions, from the object document, to ASDoc-friendly strings
	 * @param {string} description The original description text
	 * @param {string} tab Any additional indentation to add to new lines
	 * @return {string}
	 */
	formatASDocDescription: function(description, tab) 
	{
		// replaces # notations with full class paths, and adds * and indentation to any newlines in the string.
		description = description.replaceAll("\n\n","\n").replaceAll("#","io.newgrounds.models.objects.").split("\n").join("\n"+tab+" *        ");
        description = description.replaceAll("io.newgrounds.models.objects.Result", "result");
        description = description.replaceAll("io.newgrounds.models.objects.Component", "component");
        return description;
	},

    /**
	 * Converts type names from the object document to native ActionScript types. Can auto-detect multi-type properties
	 * @param {string} type_from_doc The data type as defined in the document
	 * @return {string} The comparable ActionScript type
	 */
    getDataType: function(obj)
	{
		let native = {
			int: "Number",
			float: "Number",
			string: "String",
			boolean: "Boolean",
            array: "Array"
		};

        // if this can be an array of items, but also have a specific object type, figure out wich this is...
		if (typeof(obj.array) !== 'undefined') {

            // this is ALWAYS going to be an array
            if (typeof(obj.object) === 'undefined' && typeof(obj.type) === 'undefined') {
                return "Array";
            }

            // this could be multiple types
            return "*";
        // if this is an object, it needs to be an instance of a specific model class
        } else if (typeof(obj.object) !== 'undefined') {
			return "io.newgrounds.models.objects."+obj.object;
        // otehrwise just return the native type
		} else if (typeof(native[obj.type]) !== "undefined") {
			return native[obj.type];
		}

        // if we don't know what this is, just return "Object"
		return "Object";
	},

    generateSetter: function(name,obj) {
        var template;
		
        if (obj.array) {
        template = `if (___${name} instanceof Array) {
            var newArr = [];
            var val;
            for (var i=0; i<___${name}.length; i++) {
                newArr.push(this.castValue('${name}', ___${name}[i]));
            }
            this.___${name} = newArr;
        } else {
            this.___${name} = ___${name};
        }`;
        } else {
	        template = `this.___${name} = ___${name};`;
        }

        return template;
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

				_out += `if (typeof(${value}) !== 'number') throw new Error('Type Mismatch: Value should be a number, got a '+typeof(${value}));\n`;
				if (is_int) {
					_out += `${tab}else if (Math.round(${value}) !== ${value}) throw new Error('Type Mismatch: Value should be an integer, got a float');\n`;
				}
				_out += `${tab}${key} = ${value};\n`;
				break;

			// handle strings
			case "string":
				_out += `if (typeof(${value}) !== 'string') throw new Error('Type Mismatch: Value should be a string, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			// handle booleans
			case "boolean":
				_out += `if (typeof(${value}) !== 'boolean') throw new Error('Type Mismatch: Value should be a boolean, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value} ? true : false;\n`;
				break;

			case "array":
				_out += `if (!(${value} instanceof Array)) throw new Error('Type Mismatch: Value should be an array, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

            case "object":
                _out += `if (!(${value} instanceof Object) || ${value} instanceof Array) throw new Error('Type Mismatch: Value should be an object, got a ' + (${value} instanceof Array ? "array" : typeof(${value})));\n`;
                _out += `${tab}${key} = ${value};\n`;
                break;
    
            case "io.newgrounds.models.BaseObject":
				_out += `if (!(${value} instanceof io.newgrounds.models.BaseObject)) throw new Error('Type Mismatch: Value should be a io.newgrounds.models.BaseObject instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			case "io.newgrounds.models.BaseComponent":
				_out += `if (!(${value} instanceof io.newgrounds.models.BaseComponent)) throw new Error('Type Mismatch: Value should be a io.newgrounds.models.BaseComponent instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			case "io.newgrounds.models.BaseResult":
				_out += `if (!(${value} instanceof io.newgrounds.models.BaseResult)) throw new Error('Type Mismatch: Value should be a io.newgrounds.models.BaseResult instance, got a ' + typeof(${value}));\n`;
				_out += `${tab}${key} = ${value};\n`;
				break;

			// everything else
			default:
				_out += `${key} = ${value}; // ${type}\n`;
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
        let tabString = "";
        let tabSpace = "    ";
        if (typeof(tab) !== 'number') {
            tab = 0;
        }

        for (let i = 0; i < tab; i++) {
            tabString += tabSpace;
        }

		let template = `
			if (!(${value} instanceof io.newgrounds.models.objects.${obj})) {
				if (typeof(${value}) === 'object' && !(${value} instanceof Array)) {
					${value} = new io.newgrounds.models.objects.${obj}(${value});
					// farts
				} else {
					throw new Error("Type Mismatch: expecting Object or io.newgrounds.models.objects.${obj}, got " + typeof(${value}));
				}
			}
			${key} = ${value};
		`;

        return template.split('\n').map(line => tabString + line).join('\n');
	}

}