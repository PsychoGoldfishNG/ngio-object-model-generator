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
		return out;
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
		var out = 			"";
		out += 				"		/// <summary>If this is a list of queued components, this will be true.</summary>\n";
		out += 				"		public bool isList { get; set; } = false;\n\n";

		out += 				"		/// <summary>An ExecuteWrapper object to run in this request.</summary>\n";
		out += 				"		public NewgroundsIO.ExecuteWrapper execute { get; set; }\n\n";

		out += 				"		/// <summary>A list of ExecuteWrapper objects to run in this request (if executing a queue).</summary>\n";
		out += 				"		public List<NewgroundsIO.ExecuteWrapper> executeList { get; set; } = new List<NewgroundsIO.ExecuteWrapper>();\n\n";

		out += 				"		/// <summary></summary>\n";
		out += 				"		private bool __requireSession = false;\n";
		return out;
	},
	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Request constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"";
		out +=				"			// Add the execute property and make it required.\n";
		out +=				"			this.__properties.Add(\"execute\");\n";
		out +=				"			this.__required.Add(\"execute\");\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
		var out = "";		

		out += 				"		/// <summary></summary>\n";
		out += 				"		/// <param name=\"propName\">The property to encode.</param>\n";
		out += 				"		public override string _getPropertyJSON(string propName) \n";
		out += 				"		{\n";
		out += 				"			// This could be a single execute, or a whole queue. Decide which to encode.\n";
		out += 				"			if (propName == \"execute\") {\n";
		out += 				"				return \"\\\"execute\\\":\" + this._getValueJSON((this.isList ? this.executeList : this.execute));\n";
		out += 				"			}\n\n";

		out += 				"			return base._getPropertyJSON(propName);\n";
		out += 				"		}\n\n";

		// no need to send debug or session_id on every call if it's not being used
		out += 				"		/// <summary>Checks to see if we can skip including a property. In this case, debug.</summary>\n";
		out += 				"		/// <param name=\"propName\">The property to check.</param>\n";
		out += 				"		public override bool _skipJsonProp(string propName)\n";
		out += 				"		{ \n";
		out += 				"			if (propName == \"debug\" && !this.debug) return true;\n";
		out += 				"			return base._skipJsonProp(propName);\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>Tells this request if a valid user session is required to execute one or more components.</summary>\n";
		out += 				"		/// <param name=\"require\">Set to true if a component requires a session.</param>\n";
		out += 				"		public void RequiresSession(bool require)\n";
		out += 				"		{ \n";
		out += 				"			__requireSession = require;\n\n";

		out += 				"			// if we don't have a Core or session, this is a bad request\n";
		out += 				"			if (require && ((__ngioCore is null) || (this.session_id is null))) {\n";
		out += 				"				UnityEngine.Debug.LogError(\"NewgroundsIO Error: One or more components requires an active user session!\");\n";
		out += 				"			}\n\n";
		
		out += 				"		}\n\n";

		out += 				"		/// <summary>Links a Core to this request and extracts it's app ID.</summary>\n";
		out += 				"		/// <param name=\"ngio\">The Core instance.</param>\n";
		out += 				"		public override void SetCore(Core ngio)\n";
		out += 				"		{ \n";
		out += 				"			base.SetCore(ngio);\n";
		out += 				"			this.app_id = ngio.appID;\n";
		out += 				"			if (!(ngio.session?.id is null)) this.session_id = ngio.session.id;\n";
		out += 				"		}\n\n";
		return out;
	}
}