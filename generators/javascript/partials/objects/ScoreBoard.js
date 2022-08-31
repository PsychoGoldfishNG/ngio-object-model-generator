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
		 * @param {object} options Options for what scores to look up.
		 * @param {string} options.period The overall period to retrieve from. Can be D, W, M, Y or A.
		 * @param {string} options.tag An optional tag to filter on.
		 * @param {boolean} options.social Set to true to only see scores from friends.
		 * @param {Number} options.skip The number of scores to skip.
		 * @param {Number} options.limit The total number of scores to load.
		 * @param {responseCallback} callback An function to call when the scores have been loaded.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		getScores(options, callback, thisArg)
		{
			if (!this.#ngioCore) {
				console.error("NewgroundsIO - Can not get scores without attaching a NewgroundsIO.Core instance.");
				return;
			}

			// if not using options, 2nd and 3rd params can be used for callback and thisArg
			if (typeof(options) === "function") {
				thisArg = callback;
				callback = options;
				options = {};
			}

			if (!options) options = {};
			options.id = this.id;

			var component = this.#ngioCore.getComponent('ScoreBoard.getScores', options);
			this.#ngioCore.executeComponent(component, callback, thisArg);
		}

		/**
		 * Posts a score to the scoreboard.
		 * @param {number} value The value to post.
		 * @param {string} tag An optional tag to filter on.
		 * @param {responseCallback} callback An optional function to call when the score is posted to the server.
		 * @param {object} thisArg An optional object to use as 'this' in your callback function.
		 */
		postScore(value, tag, callback, thisArg)
		{
			if (!this.#ngioCore) {
				console.error("NewgroundsIO - Can not post scores without attaching a NewgroundsIO.Core instance.");
				return;
			}

			// if not using a tag, 2nd and 3rd params can be used for callback and thisArg
			if (typeof(tag) == "function") {
				thisArg = callback;
				callback = tag;
				tag = null;
			}

			var component = this.#ngioCore.getComponent('ScoreBoard.postScore', {id:this.id,value:value,tag:tag});
			this.#ngioCore.executeComponent(component, callback, thisArg);
		}
		`;
		
		return out;
	}
}