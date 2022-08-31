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
		 * @callback getDataCallback
		 * @param {string} data The data loaded from the server
		 */

		/**
		 * @callback responseCallback
		 * @param {NewgroundsIO.objects.Response} serverResponse
		 */


		/**
		 * This will be true if this save slot has any saved data.
		 */
		get hasData() {
			return this.url !== null;
		}

		/**
		 * Loads the save file for this slot then passes its contents to a callback function. 
		 * @param {getDataCallback} callback A function to call when your data is loaded.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		getData(callback, thisArg)
		{
			if (typeof(callback) !== 'function') {
				debug.error("NewgroundsIO - Missing required callback function");
				return;
			}

			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState==4) {
					if (thisArg) callback.call(thisArg,xhr.responseText);
					else callback(xhr.responseText);
				}
			}
			xhr.open('GET', this.url, true);
			xhr.send();
		}

		/**
		 * Unlocks this medal, then fires a callback.
		 * @param {string} data The data, in a serialized string, you want to save.
		 * @param {responseCallback} callback An optional function to call when the data is saved on the server.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		setData(data, callback, thisArg)
		{
			if (!this.#ngioCore) {
				console.error("NewgroundsIO - Can not save data without attaching a NewgroundsIO.Core instance.");
				return;
			}

			var component = this.#ngioCore.getComponent('CloudSave.setData', {id:this.id, data:data});
			this.#ngioCore.executeComponent(component, callback, thisArg);
		}

		/**
		 * Clears all data from this slot, then fires a callback
		 * @param {responseCallback} callback An optional function to call when the data is cleared from the server.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		clearData(callback, thisArg)
		{
			if (!this.#ngioCore) {
				console.error("NewgroundsIO - Can not clear data without attaching a NewgroundsIO.Core instance.");
				return;
			}
			this.#url = null;
			var component = this.#ngioCore.getComponent('CloudSave.clearSlot', {id:this.id});
			this.#ngioCore.executeComponent(component, callback, thisArg);
		}

		/**
		 * Gets the date this slot was last updated.
		 * @return {Date}
		 */
		getDate()
		{
			if (this.hasData) return new Date(this.datetime);
			return null;
		}
`;
		
		return out;
	}
}