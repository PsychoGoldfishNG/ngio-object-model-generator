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
		return `
		`;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Request class
	 */
	getClassPartial: function() 
	{
		const template = `
		/**
		 * Attach a NewgrundsIO core object
		 * @param {NewgroundsIO} core
		 */
		setCore(core)
		{
			super.setCore(core);
			this._app_id = core.app_id;
		}

		/**
		 * Attach a component to this request and send it
		 * @param {(NewgroundsIO_components|Array.<NewgroundsIO_components>)} component Any NGIO component object, or an array of NGIO components
		 * @param {Function} callback An optional function to call when the server responds
		 * @param {Object} thisArg An optional value to use as 'this' when executing callback 
		 * @return {Boolean} will return false if the request failed to send 
		 */
		send(component, callback, thisArg)
		{
			if (!this.__ngioCore) {
				console.error('NewgroundsIO Error: Can not send request without calling setCore() first!');
				return;
			}

			return this.__ngioCore.__doSendRequest(this, component, callback, thisArg);
		}
		`;

		return template;
	}
}