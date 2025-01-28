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
return `
		/// <summary>Gets a list of scores from his board.</summary>
		/// <param name="period">The overall period to retrieve from. Can be D, W, M, Y or A</param>
		/// <param name="tag">An optional tag to filter on. Use null to skip filtering.</param>
		/// <param name="social">Set to true to only see scores from friends.</param>
		/// <param name="skip">The number of scores to skip.</param>
		/// <param name="limit">The total number of scores to load.</param>
		/// <param name="callback">A function to call once the scores have loaded.</param>
		public IEnumerator GetScores(string period="D", string tag=null, bool social=false, int skip=0, int limit=10, Action<NewgroundsIO.objects.Response> callback=null)
		{
			// You can't load scores without a Core object.
			if (this.__ngioCore is null) {
				UnityEngine.Debug.LogError("Can not get scores without attaching a NewgroundsIO.Core instance");
				yield break;
			}

			// Load the scores
			var component = new NewgroundsIO.components.ScoreBoard.getScores();
			component.id = this.id;
			component.period = period;
			if (tag is not null) component.tag = tag;
			if (social) component.social = true;
			if (skip > 0) component.skip = skip;
			if (limit > 0) component.limit = limit;
			yield return __ngioCore.ExecuteComponent(component, callback);
		}

		/// <summary>Posts a score to this board.</summary>
		/// <param name="value">The score value to post.</param>
		/// <param name="tag">An optional tag to filter on. Use null to skip filtering.</param>
		/// <param name="callback">A function to call once the score has posted.</param>
		public IEnumerator PostScore(int value, string tag=null, Action<NewgroundsIO.objects.Response> callback=null)
		{
			// You can't post scores without a Core object.
			if (this.__ngioCore is null) {
				UnityEngine.Debug.LogError("Can not post scoreBoard object without attaching a NewgroundsIO.Core instance");
				yield break;
			}

			// Post the score
			var component = new NewgroundsIO.components.ScoreBoard.postScore();
			component.id = this.id;
			component.value = value;
			if (!(tag is null)) component.tag = tag;
			yield return __ngioCore.ExecuteComponent(component, callback);
		}
`;
	}
}
