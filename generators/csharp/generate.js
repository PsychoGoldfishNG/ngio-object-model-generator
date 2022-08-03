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
		methodData.properties = methodData.params ?? {};
		let out = this.generateObjectClass(componentName+"."+methodName, methodName, "NewgroundsIO.components."+componentName, "NewgroundsIO.BaseComponent", methodData, partials);
		let filename = componentName+"/"+methodName+".cs";
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
		let out = this.generateObjectClass(componentName+"."+methodName, methodName, "NewgroundsIO.results."+componentName, "NewgroundsIO.BaseResult", {properties:resultData}, partials);
		let filename = componentName+"/"+methodName+".cs";
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
		let out = this.generateObjectClass(objectName, objectName, "NewgroundsIO.objects", "NewgroundsIO.BaseObject", objectData, partials);
		let filename = objectName+".cs";
		return [filename,out];
	},

	generateObjectClass: function(objectName, className, nameSpace, baseClass, objectData, partials)
	{

		// don't make a model for these, they are abstract concepts...
		if (objectName === "Result" || objectName === "Execute") return "";

		var out = "";

		// class definition.  We will be extending the BaseObject class
		out +=					"using System;\n";
		out +=					"using System.Collections;\n";
		out +=					"using System.Collections.Generic;\n";
		out +=					"using UnityEngine;\n";

		// add any partial code that may exist for the properties part of the class function
		if (partials && partials.getUsingPartial) out += partials.getUsingPartial();

		out += "\n";
		out +=					"namespace "+nameSpace+" {\n\n";

		out +=						this.formatComment(objectData.description, "summary", null, "	");
		out +=					"	public class "+className+" : "+baseClass+" {\n\n";


		// properties
		let _required = [];

		// set initial property values
		let props = [];
		let objectArrays = {};
		let objectMap = {};
		for (const [name, obj] of Object.entries(objectData.properties)) {

			// Need to override any properties in partials?  Keep them from being added here:

				// The Response object has custom handling for it's result property. See the objects/Response.js partials for details
				if (objectName === 'Response' && name === "result") continue;
				
				// The Request object has custom handling for it's execute property. See the objects/Request.js partials for details
				if (objectName === 'Request' && name === "execute") continue;

				// components already have a 'host' property, but only add it to the export array if it's in the objectData 
				if (nameSpace.indexOf("components") >= 0 && name === "host") {
					props.push(name);
					continue;
				}

			// End of overrides

			props.push(name);

			if (typeof(obj.array) !== 'undefined' && (typeof(obj.object) !== 'undefined' || typeof(obj.type) !== 'undefined')) {
				objectArrays[name] = [name+"List",this.getDataType(obj.array)];

				// this property can either be a flat value OR a list of values.  We need containers for both
				out +=			"\n";
				out +=			"		/// <summary>Will be true if the "+name+"List was set instead of "+name+".</summary>\n";
				out +=			"		public bool "+name+"IsList { get; private set; }\n\n";

				out +=			"		private "+this.getDataType(obj)+" _"+name+";\n\n";

				out +=					this.formatComment(obj.description, "summary");
				out +=			"		public "+this.getDataType(obj)+" "+name+" { get {\n";
				out +=			"			return this._"+name+";\n";
				out +=			"		}\n"; 
				out +=			"		set {\n";
				out +=			"			this."+name+"IsList = false;\n";
				out +=			"			this._"+name+" = value;\n";
				out +=			"			this._"+name+"List = null;\n";
				out +=			"		} }\n\n";

				out +=			"		public List<"+this.getDataType(obj.array)+"> _"+name+"List = new List<"+this.getDataType(obj.array)+">();\n\n";

				out +=					this.formatComment("(A list of:) "+obj.description, "summary");
				out +=			"		public List<"+this.getDataType(obj.array)+"> "+name+"List { get {\n";
				out +=			"			return this._"+name+"List;\n";
				out +=			"		}\n"; 
				out +=			"		set {\n";
				out +=			"			this."+name+"IsList = true;\n";
				out +=			"			this._"+name+" = null;\n";
				out +=			"			this._"+name+"List = value;\n";
				out +=			"		} }\n\n";

			} else if (typeof(obj.array) !== 'undefined') {
				objectArrays[name] = [name, this.getDataType(obj.array)];

				// this property is always going to be a list
				out +=					this.formatComment(obj.description, "summary");
				out +=			"		public List<"+this.getDataType(obj.array)+"> "+name+" { get; set; } = new List<"+this.getDataType(obj.array)+">();\n\n";

			} else {

				// this property is always going to be a flat value
				out +=					this.formatComment(obj.description, "summary");
				out +=			"		public "+this.getDataType(obj)+" "+name+" { get; set; }";
				if (typeof(obj['default']) !== 'undefined') out += " = "+JSON.stringify(obj.default)+";";
				out += "\n\n";
			}


			// keep track of required properties
			if (obj.required === true) _required.push(name);
			if (obj.object) objectMap[name] = obj.object;
			if (obj.array && obj.array.object) objectMap[name] = obj.array.object;
		}		

		// add any partial code that may exist for the properties part of the class function
		if (partials && partials.getPropertiesPartial) out += partials.getPropertiesPartial();

		// constructor
		out += 					"\n";
		out += 					"		/// <summary>Constructor</summary>\n";
		out += 					"		public "+className+"()\n";
		out += 					"		{\n";
		out +=					"			this.__object = \""+objectName+"\";\n\n";
		
		// set properties from props object
		props.forEach(prop => {
			out +=				"			this.__properties.Add(\""+prop+"\");\n";
		},this);

		_required.forEach(prop => {
			out +=				"			this.__required.Add(\""+prop+"\");\n";
		},this);

		for (const [name, obj] of Object.entries(objectMap)) {
			out +=				"			this.__objectMap.Add(\""+name+"\",\""+obj+"\");\n";
		}

		if (objectData.secure === true)
			out +=				"			this.__isSecure = true;\n";

		if (objectData.require_session === true)
			out +=				"			this.__requireSession = true;\n";

		// add any partial code that may exist for the constructor function
		if (partials && partials.getConstructorPartial) out += partials.getConstructorPartial();

		out += 					"		}\n\n";
		// end constructor

		if (props.indexOf("datetime") >= 0) {
			out += 				"		/// <summary>Returns the datetime value as an actual DateTime</summary>\n";
			out += 				"		public DateTime GetDateTime()\n";
			out += 				"		{\n";
			out += 				"			return DateTime.Parse(datetime);\n";
			out += 				"		}\n\n";
		}

		if (Object.keys(objectArrays).length > 0) {

			out +=				"		/// <summary>Adds objects to their associated lists and casts them to their appropriate class.</summary>\n";
			out +=				"		public override void AddToPropertyList( string propName, NewgroundsIO.BaseObject obj)\n";
			out +=				"		{\n";
			out +=				"			switch(propName) {\n\n";

			for (const [name, obj] of Object.entries(objectArrays)) {

				let [prop,oclass] = obj;

				out +=			"				case \""+name+"\":\n\n";
				out +=			"					this."+prop+".Add(obj as "+oclass+");\n";

				out +=			"					break;\n\n";
			}

			out +=				"			}\n";
			out +=				"		}\n";

		}


		if (Object.keys(objectArrays).length > 0) {

			out +=				"		/// <summary>Links a Core instance to every object in our object lists.</summary>\n";
			out +=				"		public override void SetCoreOnLists( NewgroundsIO.Core ngio )\n";
			out +=				"		{\n";
			
			for (const [name, obj] of Object.entries(objectArrays)) {

				let [prop,oclass] = obj;

				out +=			"			this."+prop+".ForEach(child => { if (!(child is null)) child.SetCore(ngio); });\n";
			}

			out +=				"		}\n\n";

		}

		out +=					"		/// <summary>Clones the properties of this object to another (or new) object.</summary>\n";
		out +=					"		/// <param name=\"cloneTo\">An object to clone properties to. If null, a new instance will be created.</param>\n";
		out +=					"		/// <returns>The object that was cloned to.</returns>\n";
		out +=					"		public "+nameSpace+"."+className+" clone("+nameSpace+"."+className+" cloneTo = null) {\n";
		out +=					"			if (cloneTo is null) cloneTo = new "+nameSpace+"."+className+"();\n";
		out +=					"			cloneTo.__properties.ForEach(propName => {\n";
		out +=					"				cloneTo.GetType().GetProperty(propName).SetValue(cloneTo, this.GetType().GetProperty(propName).GetValue(this), null);\n";
		out +=					"			});\n";
		out +=					"			cloneTo.__ngioCore = this.__ngioCore;\n";
		out +=					"			return cloneTo;\n";
		out +=					"		}\n\n";

		// add any partial code that may exist for the main class
		if (partials && partials.getClassPartial) out += partials.getClassPartial();

		out +=					"	}\n\n";
		out +=					"}\n\n";
		// end class

		return out;
	},

	generateObjectIndex: function(index)
	{
		var out = "";
		out +=					"using System;\n";
		out +=					"using System.Collections;\n";
		out +=					"using System.Collections.Generic;\n";
		out +=					"using UnityEngine;\n\n";

		out +=					"namespace NewgroundsIO {\n\n";
		
		out +=					"	/// <summary>A class used to get object/component/result instances from a string name and deserialized JSON properties.</summary>\n";
		out +=					"	class ObjectIndex {\n\n";

		function makeIndex(namespace, method, objects, base)
		{
			out +=				"		/// <summary>Handles creation of "+base+" subclasses.</summary>\n";
			out +=				"		/// <param name=\"name\">The object's name/type.</param>\n";
			out +=				"		/// <param name=\"json\">The values to apply to the object.</param>\n";
			out +=				"		/// <returns>A subclass instance, cast back to "+base+"</returns>\n";
			out +=				"		public static "+base+" "+method+"(string name, object json)\n";
			out +=				"		{\n";
			out +=				"			switch (name.ToLower()) {\n\n";

			objects.forEach(function (obj) {

				var varname = "new_"+obj.split(".").join("_");
				var otype = namespace + obj;

				// we don't build a Result or Execute object, the Response object and ExecuteWrapper handle these.
				if (otype === "NewgroundsIO.objects.Result" || otype === "NewgroundsIO.objects.Execute") return;


				out +=			"				case \""+obj.toLowerCase()+"\":\n\n";
				out +=			"					"+otype+" "+varname+" = new "+otype+"();\n";
				out +=			"					"+varname+".FromJSON(json);\n";
				out +=			"					return "+varname+" as "+base+";\n\n";

			}, this);

			out +=				"			}\n\n";

			out +=				"			return null;\n";
			out +=				"		}\n\n";
		}

		makeIndex("NewgroundsIO.objects.", "CreateObject", index.objects, "NewgroundsIO.BaseObject");
		makeIndex("NewgroundsIO.components.", "CreateComponent", index.components, "NewgroundsIO.BaseComponent");
		makeIndex("NewgroundsIO.results.", "CreateResult", index.results, "NewgroundsIO.BaseResult");

		out +=		"	}\n";
		out +=		"}";

		let filename = "ObjectIndex.cs";
		return [filename,out];
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