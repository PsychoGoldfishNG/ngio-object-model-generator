'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
		var out = `
		/**
		 * Gets the appID from a core object
		 * @returns {string}
		 */
		get app_id()
		{
			return this.__ngioCore ? this.__ngioCore.appID : null;
		}

		/**
		 * Gets the Session ID from a core object
		 * @returns {string}
		 */
		get session_id()
		{
			return this.__ngioCore && this.__ngioCore.session ? this.__ngioCore.session.id : null;
		}
		
`;

		return out;
	}
}