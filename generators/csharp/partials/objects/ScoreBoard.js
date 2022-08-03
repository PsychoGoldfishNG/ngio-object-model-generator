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
		var out = "";		

		out += 				"		/// <summary>Gets a list of scores from his board.</summary>\n";
		out += 				"		/// <param name=\"period\">The overall period to retrieve from. Can be D, W, M, Y or A</param>\n";
		out += 				"		/// <param name=\"tag\">An optional tag to filter on. Use null to skip filtering.</param>\n";
		out += 				"		/// <param name=\"social\">Set to true to only see scores from friends.</param>\n";
		out += 				"		/// <param name=\"skip\">The number of scores to skip.</param>\n";
		out += 				"		/// <param name=\"limit\">The total number of scores to load.</param>\n";
		out += 				"		/// <param name=\"callback\">A function to call once the scores have loaded.</param>\n";
		out += 				"		public IEnumerator GetScores(string period=\"D\", string tag=null, bool social=false, int skip=0, int limit=10, Action<NewgroundsIO.objects.Response> callback=null)\n";
		out += 				"		{\n";
		out += 				"			// You can't load scores without a Core object.\n";
		out += 				"			if (this.__ngioCore is null) {\n";
		out += 				"				UnityEngine.Debug.LogError(\"Can not get scores without attaching a NewgroundsIO.Core instnce\");\n";
		out += 				"				yield break;\n";
		out += 				"			}\n\n";

		out += 				"			// Load the scores\n";
		out += 				"			var component = new NewgroundsIO.components.ScoreBoard.getScores();\n";
		out += 				"			component.id = this.id;\n";
		out += 				"			component.period = period;\n";
		out += 				"			if (tag is not null) component.tag = tag;\n";
		out += 				"			if (social) component.social = true;\n";
		out += 				"			if (skip > 0) component.skip = skip;\n";
		out += 				"			if (limit > 0) component.limit = limit;\n";
		out += 				"			yield return __ngioCore.ExecuteComponent(component, callback);\n";
		out += 				"		}\n\n";

		out += 				"		/// <summary>Posts a score to this board.</summary>\n";
		out += 				"		/// <param name=\"value\">The score value to post.</param>\n";
		out += 				"		/// <param name=\"tag\">An optional tag to filter on. Use null to skip filtering.</param>\n";
		out += 				"		/// <param name=\"callback\">A function to call once the score has posted.</param>\n";
		out += 				"		public IEnumerator PostScore(int value, string tag=null, Action<NewgroundsIO.objects.Response> callback=null)\n";
		out += 				"		{\n";
		out += 				"			// You can't post scores without a Core object.\n";
		out += 				"			if (this.__ngioCore is null) {\n";
		out += 				"				UnityEngine.Debug.LogError(\"Can not post scoreBoard object without attaching a NewgroundsIO.Core instnce\");\n";
		out += 				"				yield break;\n";
		out += 				"			}\n\n";

		out += 				"			// Post the score\n";
		out += 				"			var component = new NewgroundsIO.components.ScoreBoard.postScore();\n";
		out += 				"			component.id = this.id;\n";
		out += 				"			component.value = value;\n";
		out += 				"			if (!(tag is null)) component.tag = tag;\n";
		out += 				"			yield return __ngioCore.ExecuteComponent(component, callback);\n";
		out += 				"		}\n\n";
		return out;
	}
}
