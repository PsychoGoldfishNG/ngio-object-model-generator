'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {
	
	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
		var out = 			"";
		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
		var out = "";		

		out += 				"		/// <summary>Unlocks this medal, then fires a callback.</summary>\n";
		out += 				"		/// <param name=\"callback\">An optional function to call when the medal is unlocked on the server.</summary>\n";
		out += 				"		public IEnumerator Unlock(Action<NewgroundsIO.objects.Response> callback=null)\n";
		out += 				"		{\n";
		out += 				"			// You can't unlock a medal without a Core object.\n";
		out += 				"			if (this.__ngioCore is null) {\n";
		out += 				"				UnityEngine.Debug.LogError(\"NewgroundsIO - Can not unlock medal object without attaching a NewgroundsIO.Core instance.\");\n";
		out += 				"				yield break;\n";
		out += 				"			}\n\n";

		out += 				"			// Do the unlock\n";
		out += 				"			var component = new NewgroundsIO.components.Medal.unlock();\n";
		out += 				"			component.id = this.id;\n";
		out += 				"			yield return __ngioCore.ExecuteComponent(component, callback);\n";
		out += 				"		}\n\n";
		return out;
	}
}
