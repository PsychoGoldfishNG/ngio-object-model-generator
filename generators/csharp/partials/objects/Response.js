'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the 'using' area of the NewgroundsIO.objects.Response class
	 */
	getUsingPartial: function() 
	{
		var out = 			"";
		out += 				"using Newtonsoft.Json;\n";
		out += 				"using Newtonsoft.Json.Linq;\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
		var out = 			"\n";

		out += 				"		/// <summary>If this is a list of queued responses, this will be true.</summary>\n";
		out += 				"		public bool isList { get; private set; }\n\n";

		out += 				"		/// <summary>Single results will be stored here.</summary>\n";
		out += 				"		private NewgroundsIO.BaseResult _result = null;\n\n";

		out += 				"		/// <summary>Queued results will be stored here</summary>\n";
		out += 				"		private List<NewgroundsIO.BaseResult> _resultList = null;\n";

		return out;
	},

	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Response constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"";
		out +=				"			this.__properties.Add(\"result\");\n";
		out +=				"			this.__properties.Add(\"resultList\");\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Response class
	 */
	getClassPartial: function() 
	{
		var out = "";		
		out += 				"		/// <summary>A single component result.<summary>\n";
		out += 				"		public NewgroundsIO.BaseResult result {\n";
		out += 				"			get {\n";
		out += 				"				return this._result;\n";
		out += 				"			}\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>A list of component results.<summary>\n";
		out += 				"		public List<NewgroundsIO.BaseResult> resultList {\n";
		out += 				"			get {\n";
		out += 				"				return this._resultList;\n";
		out += 				"			}\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>Set a single results object from deserialized JSON.<summary>\n";
		out += 				"		public void SetResults(JObject jObj)\n";
		out += 				"		{\n";
		out += 				"			string _component = (string)jObj.GetValue(\"component\").ToObject(typeof(string));\n";
		out += 				"			this._result = NewgroundsIO.ObjectIndex.CreateResult(_component, jObj.GetValue(\"data\") as JObject);\n\n";

		out += 				"			this.isList = false;\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>Set a list of results object from deserialized JSON.<summary>\n";
		out += 				"		public void SetResultsList(JArray jArr)\n";
		out += 				"		{\n";
		out += 				"			string _component;\n";
		out += 				"			this._resultList = new List<NewgroundsIO.BaseResult>();\n";
		out += 				"			foreach (JObject jObj in jArr) {\n";
		out += 				"				_component = (string)jObj.GetValue(\"component\").ToObject(typeof(string));\n";
		out += 				"				this._resultList.Add( NewgroundsIO.ObjectIndex.CreateResult(_component, jObj.GetValue(\"data\") as JObject) );\n";
		out += 				"			}\n\n";

		out += 				"			this.isList = true;\n";
		out += 				"		}\n";

		out += 				"		/// <summary>This override will link a Core instance to every result in the resultList.</summary>\n";
		out += 				"		public override void SetCoreOnLists( NewgroundsIO.Core ngio )\n";
		out += 				"		{\n";
		out += 				"			if (!(this._resultList is null)) this._resultList.ForEach(child => { if (!(child is null)) child.SetCore(ngio); });\n";
		out += 				"		}\n\n";

		return out;
	}
}