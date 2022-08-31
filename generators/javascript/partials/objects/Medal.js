'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Session class
	 */
	getClassPartial: function() 
	{
		var out = `	
		/**
		 * @callback responseCallback
		 * @param {NewgroundsIO.objects.Response} serverResponse
		 */

		/**
		 * Unlocks this medal, then fires a callback.
		 * @param {responseCallback} callback An optional function to call when the medal is unlocked on the server.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		unlock(callback, thisArg)
		{
			if (!this.#ngioCore) {
				console.error("NewgroundsIO - Can not unlock medal object without attaching a NewgroundsIO.Core instance.");
				return;
			}

			var component = this.#ngioCore.getComponent('Medal.unlock', {id:this.id});
			this.#ngioCore.executeComponent(component, callback, thisArg);
		}
		`;

		return out;
	}
}