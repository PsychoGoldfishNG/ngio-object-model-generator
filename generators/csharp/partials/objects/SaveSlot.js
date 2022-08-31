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
		var out = "";
		out +=				"using UnityEngine.Networking;\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
		var out = "";
		out += 				"		/// <summary>This will be true if this save slot has any saved data</summary>\n";
		out += 				"		public bool hasData { get { return !(this.url is null); }}\n\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
		var out = "";		

		out += 				"		/// <summary>Loads the save file for this slot then passes its contents to a callback function.</summary>\n";
		out += 				"		/// <param name=\"callback\">The callback function</param>\n";
		out += 				"		public IEnumerator GetData(Action<string> callback)\n";
		out += 				"		{\n";
		out += 				"			if (this.url is null) {\n";
		out += 				"				callback(null);\n";
		out += 				"				yield break;\n";
		out += 				"			}\n\n";

        out += 				"		    UnityWebRequest www = UnityWebRequest.Get(this.url);\n";
        out += 				"		    yield return www.SendWebRequest();\n\n";
     
        out += 				"		    if (www.result != UnityWebRequest.Result.Success) {\n";
        out += 				"		        callback(null);\n\n";

        out += 				"		    } else {\n";
        out += 				"		        callback(www.downloadHandler.text);\n";
        out += 				"		    }\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>Saves string data to a file associated with this slot, and calls a function when complete.</summary>\n";
		out += 				"		/// <param name=\"data\">The data you want to save (needs to be serialized to a string).</param>\n";
		out += 				"		/// <param name=\"callback\">The callback function</param>\n";
		out += 				"		public IEnumerator SetData(string data, Action<NewgroundsIO.objects.Response> callback=null)\n";
		out += 				"		{\n";
		out += 				"			if (__ngioCore is null) {\n";
		out += 				"				if (!(callback is null)) callback(null);\n";
		out += 				"				yield break;\n";
		out += 				"			}\n\n";

		out += 				"			var component = new NewgroundsIO.components.CloudSave.setData();\n";
		out += 				"			component.id = this.id;\n";
		out += 				"			component.data = data;\n";
		out += 				"			yield return __ngioCore.ExecuteComponent(component, callback);\n\n";

		out += 				"		}\n";

		return out;
	}
}
