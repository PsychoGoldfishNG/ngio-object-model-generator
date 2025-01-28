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
		return `
		if (!props || !props.ngio) throw("NewgroundsIO_objects_Session requires a 'core' value");
		this.__ngio = props.ngio;

		this.__loaded_saved_key = false;
		this.__loaded_url_key = false;
		`;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Session class
	 */
	getClassPartial: function() 
	{
		return `
			getSessionStorageKey() {
				return "Newgrounds-io-app_session-" + (this.__ngio.app_id.split(":").join("-"));
			}

			isActive() {
				return true;
			}

			logProblems() {
				console.warn('NewgroundsIO warning: TODO');
			}

			wasServerValidated() {
				return (this._user !== null || this._expired !== null);
			}

			load(callback, thisArg) {
				let session = this;

				if (!session.__loaded_saved_key) {
					let component = new NewgroundsIO_components_App_checkSession({});
				}
			}
		`;
	}
}