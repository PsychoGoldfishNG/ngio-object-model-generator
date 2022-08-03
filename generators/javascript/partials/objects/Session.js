'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the NewgroundsIO_objects_Session constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"\n";

		out +=				"		if (!props || !props.ngio) throw(\"NewgroundsIO_objects_Session requires a 'core' value\");\n";
		out +=				"		this.__ngio = props.ngio;\n\n";
		out +=				"		this.__loaded_saved_key = false;\n";
		out +=				"		this.__loaded_url_key = false;\n";

		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Session class
	 */
	getClassPartial: function() 
	{
		var out = "";
		
		out += 				"	getSessionStorageKey()\n";
		out += 				"	{\n";
		out += 				"		return \"Newgrounds-io-app_session-\"+(this.__ngio.app_id.split(\":\").join(\"-\"));\n";
		out += 				"	}\n\n";

		out += 				"	isActive()\n";
		out += 				"	{\n";
		out += 				"		return true;\n";
		out += 				"	}\n\n";

		out += 				"	logProblems()\n";
		out += 				"	{\n";
		out += 				"		console.warn('NewgroundsIO warning: TODO');\n";
		out += 				"	}\n\n";

		out += 				"	wasServerValidated()\n";
		out += 				"	{\n";
		out += 				"		return (this._user !== null || this._expired !== null);\n";
		out += 				"	}\n\n";

		out += 				"	load(callback, thisArg)\n";
		out += 				"	{\n";
		out += 				"		let session = this;\n\n";

		out += 				"		if (!session.__loaded_saved_key) {\n";
		out += 				"			let component = new NewgroundsIO_components_App_checkSession({});\n";
		out += 				"		}\n";
		out += 				"	}\n";

		return out;
	}
}