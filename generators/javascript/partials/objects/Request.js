'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Request constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
		var out = "";
		
		out += 				"		/**\n";
		out += 				"		 * Gets the appID from a core object\n";
		out += 				"		 * @returns {string}\n";
		out += 				"		 */\n";
		out += 				"		get app_id()\n";
		out += 				"		{\n";
		out += 				"			return this.__ngioCore ? this.__ngioCore.appID : null;\n";
		out += 				"		}\n\n";

		out += 				"		/**\n";
		out += 				"		 * Gets the Session ID from a core object\n";
		out += 				"		 * @returns {string}\n";
		out += 				"		 */\n";
		out += 				"		get session_id()\n";
		out += 				"		{\n";
		out += 				"			return this.__ngioCore && this.__ngioCore.session ? this.__ngioCore.session.id : null;\n";
		out += 				"		}\n\n";

		return out;
	}
}