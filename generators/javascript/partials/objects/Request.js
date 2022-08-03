'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the NewgroundsIO_objects_Request constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"\n";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Request class
	 */
	getClassPartial: function() 
	{
		var out = "";
		
		out += 				"	/**\n";
		out += 				"	 * Attach a NewgrundsIO core object\n";
		out += 				"	 * @param {NewgroundsIO} core\n";
		out += 				"	 */\n";
		out += 				"	setCore(core)\n";
		out += 				"	{\n";
		out += 				"		super.setCore(core);\n";
		out += 				"		this._app_id = core.app_id;\n";

		out += 				"	}\n\n";

		out += 				"	/**\n";
		out += 				"	 * Attach a componet to this request and send it\n";
		out += 				"	 * @param {(NewgroundsIO_components|Array.<NewgroundsIO_components>)} component Any NGIO component object, or an array of NGIO components\n";
		out += 				"	 * @param {Function} callback An optional function to call when the server responds\n";
		out += 				"	 * @param {Object} thisArg An optional value to use as 'this' when executing callback \n";
		out += 				"	 * @return {Boolean} will return false if the request failed to send \n";
		out += 				"	 */\n";
		out += 				"	send(component, callback, thisArg)\n";
		out += 				"	{\n";
		out += 				"		if (!this.__ngioCore) {\n";
		out += 				"			console.error('NewgroundsIO Error: Can not send request without calling setCore() first!');\n";
		out += 				"			return;\n";
		out += 				"		}\n\n";

		out += 				"		return this.__ngioCore.__doSendRequest(this, component, callback, thisArg);\n";
		out += 				"	}\n\n";

		return out;
	}
}