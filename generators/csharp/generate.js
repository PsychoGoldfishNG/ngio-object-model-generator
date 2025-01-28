'use strict';
const fs = require('fs');

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {
	
	/* =========================================== CODE GENERATORS =========================================== */

	/* ------------------------------------------- COMPONENT OBJECTS ------------------------------------------- */

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
		methodData.properties = methodData.params ?? {};
		let out = this.generateObjectClass(componentName+"."+methodName, methodName, "NewgroundsIO.components."+componentName, "NewgroundsIO.BaseComponent", methodData, partials);
		let filename = componentName+"/"+methodName+".cs";
		return [filename,out];
	},

	/* ------------------------------------------- RESULT OBJECTS ------------------------------------------- */

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
		let out = this.generateObjectClass(componentName+"."+methodName, methodName, "NewgroundsIO.results."+componentName, "NewgroundsIO.BaseResult", {properties:resultData}, partials);
		let filename = componentName+"/"+methodName+".cs";
		return [filename,out];
	},

	/* ------------------------------------------- MODEL OBJECTS ------------------------------------------- */

	/**
	 * Generates the JS code for an object class
	 * @param {string} objectName The name of the object being generated
	 * @param {object} objectData All the data about the object from the main document
	 * @param {object} partials An optional partials module for this class
	 * @return {string}
	 */
	generateObject: function(objectName,objectData,partials) 
	{
		let out = this.generateObjectClass(objectName, objectName, "NewgroundsIO.objects", "NewgroundsIO.BaseObject", objectData, partials);
		let filename = objectName+".cs";
		return [filename,out];
	},

	/* ------------------------------------------- CLASS GENERATION ------------------------------------------- */

	generateObjectClass: function(objectName, className, nameSpace, baseClass, objectData, partials)
	{

		// don't make a model for these, they are abstract concepts...
		if (objectName === "Result" || objectName === "Execute") return "";

		const template = (data) => `
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
${partials && partials.getUsingPartial ? partials.getUsingPartial() : ''}

namespace ${data.nameSpace} {

	${this.formatComment(data.objectData.description, "summary", null, "	")}
	public class ${data.className} : ${data.baseClass} {

		${data.properties.map(prop => `
		${this.formatComment(prop.description, "summary")}
		public ${this.getDataType(prop)} ${prop.name} { get; set; }${prop.default ? ` = ${JSON.stringify(prop.default)};` : ''}`).join('\n\n')}

		${partials && partials.getPropertiesPartial ? partials.getPropertiesPartial() : ''}

		/// <summary>Constructor</summary>
		public ${data.className}()
		{
			this.__object = "${data.objectName}";
			${data.props.map(prop => `this.__properties.Add("${prop}");`).join('\n')}
			${data.required.map(prop => `this.__required.Add("${prop}");`).join('\n')}
			${Object.entries(data.objectMap).map(([name, obj]) => `this.__objectMap.Add("${name}", "${obj}");`).join('\n')}
			${data.objectData.secure ? 'this.__isSecure = true;' : ''}
			${data.objectData.require_session ? 'this.__requireSession = true;' : ''}
			${partials && partials.getConstructorPartial ? partials.getConstructorPartial() : ''}
		}

		${data.props.includes("datetime") ? `
		/// <summary>Returns the datetime value as an actual DateTime</summary>
		public DateTime GetDateTime()
		{
			return DateTime.Parse(datetime);
		}` : ''}

		${Object.keys(data.objectArrays).length > 0 ? `
		/// <summary>Adds objects to their associated lists and casts them to their appropriate class.</summary>
		public override void AddToPropertyList(string propName, NewgroundsIO.BaseObject obj)
		{
			switch(propName) {
				${Object.entries(data.objectArrays).map(([name, [prop, oclass]]) => `
				case "${name}":
					this.${prop}.Add(obj as ${oclass});
					break;`).join('\n')}
			}
		}` : ''}

		${Object.keys(data.objectArrays).length > 0 ? `
		/// <summary>Links a Core instance to every object in our object lists.</summary>
		public override void SetCoreOnLists(NewgroundsIO.Core ngio)
		{
			${Object.entries(data.objectArrays).map(([name, [prop]]) => `
			this.${prop}.ForEach(child => { if (!(child is null)) child.SetCore(ngio); });`).join('\n')}
		}` : ''}

		/// <summary>Clones the properties of this object to another (or new) object.</summary>
		/// <param name="cloneTo">An object to clone properties to. If null, a new instance will be created.</param>
		/// <returns>The object that was cloned to.</returns>
		public ${data.nameSpace}.${data.className} clone(${data.nameSpace}.${data.className} cloneTo = null)
		{
			if (cloneTo is null) cloneTo = new ${data.nameSpace}.${data.className}();
			cloneTo.__properties.ForEach(propName => {
				cloneTo.GetType().GetProperty(propName).SetValue(cloneTo, this.GetType().GetProperty(propName).GetValue(this), null);
			});
			cloneTo.__ngioCore = this.__ngioCore;
			return cloneTo;
		}

		${partials && partials.getClassPartial ? partials.getClassPartial() : ''}
	}
}
`;
		const data = {
			nameSpace,
			className,
			baseClass,
			objectName,
			objectData,
			props: Object.keys(objectData.properties),
			required: Object.keys(objectData.properties).filter(prop => objectData.properties[prop].required),
			objectMap: Object.entries(objectData.properties).reduce((map, [name, obj]) => {
				if (obj.object) map[name] = obj.object;
				if (obj.array && obj.array.object) map[name] = obj.array.object;
				return map;
			}, {}),
			objectArrays: Object.entries(objectData.properties).reduce((arrays, [name, obj]) => {
				if (obj.array) arrays[name] = [name, this.getDataType(obj.array)];
				return arrays;
			}, {}),
			properties: Object.entries(objectData.properties).map(([name, obj]) => ({
				name,
				description: obj.description,
				default: obj.default,
				type: this.getDataType(obj)
			}))
		};
		return template(data);
	},

	/* ------------------------------------------- OBJECT INDEX ------------------------------------------- */

	generateObjectIndex: function(index)
	{
		const template = (data) => `
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace NewgroundsIO {

	/// <summary>A class used to get object/component/result instances from a string name and deserialized JSON properties.</summary>
	class ObjectIndex {

		${data.indexes.map(index => `
		/// <summary>Handles creation of ${index.base} subclasses.</summary>
		/// <param name="name">The object's name/type.</param>
		/// <param name="json">The values to apply to the object.</param>
		/// <returns>A subclass instance, cast back to ${index.base}</returns>
		public static ${index.base} ${index.method}(string name, object json)
		{
			switch (name.ToLower()) {
				${index.objects.map(obj => {
					const varname = "new_" + obj.split(".").join("_");
					const otype = index.namespace + obj;
					if (otype === "NewgroundsIO.objects.Result" || otype === "NewgroundsIO.objects.Execute") return '';
					return `
				case "${obj.toLowerCase()}":
					${otype} ${varname} = new ${otype}();
					${varname}.FromJSON(json);
					return ${varname} as ${index.base};`;
				}).join('\n')}
			}
			return null;
		}`).join('\n')}
	}
}`;

		const data = {
			indexes: [
				{ namespace: "NewgroundsIO.objects.", method: "CreateObject", objects: index.objects, base: "NewgroundsIO.BaseObject" },
				{ namespace: "NewgroundsIO.components.", method: "CreateComponent", objects: index.components, base: "NewgroundsIO.BaseComponent" },
				{ namespace: "NewgroundsIO.results.", method: "CreateResult", objects: index.results, base: "NewgroundsIO.BaseResult" }
			]
		};

		const out = template(data);
		const filename = "ObjectIndex.cs";
		return [filename, out];
	},

	/* =========================================== HELPER METHODS =========================================== */


	getDataType: function(obj)
	{
		let native = {
			int: "int",
			float: "double",
			string: "string",
			boolean: "bool"
		}

		if (typeof(obj.object) !== 'undefined') {
			return "NewgroundsIO.objects."+obj.object;
		} else if (typeof(obj.type) === 'string' && typeof(native[obj.type]) !== "undefined") {
			return native[obj.type];
		}

		return "object";
	},

	formatComment: function(description, tag, name, tab)
	{
		if (!description) return "";

		if (!tab) tab = "		";

		var tag1 = tag;
		var tag2 = tag;

		if (!tag) tag = "summary";
		else if (tag == "param") tag1 = "param name=\""+name+"\"";

		var comment = tab+"/// <"+tag1+">";

		if (description.indexOf("\n") >= 0) {
			comment += "\n" + tab + "/// " + description.split("\n").join("\n"+tab+"/// ");
		} else {
			comment += description;
		}
		comment += "</"+tag2+">\n";

		return comment;
	}

}