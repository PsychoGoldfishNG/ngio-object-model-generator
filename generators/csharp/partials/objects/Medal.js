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
		return "";
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
return `
		/// <summary>Unlocks this medal, then fires a callback.</summary>
		public IEnumerator Unlock(Action<NewgroundsIO.objects.Response> callback=null)
		{
			// You can't unlock a medal without a Core object.
			if (this.__ngioCore is null) {
				UnityEngine.Debug.LogError("Can not unlock medal object without attaching a NewgroundsIO.Core instance");
				yield break;
			}

			// Do the unlock
			var component = new NewgroundsIO.components.Medal.unlock();
			component.id = this.id;
			yield return __ngioCore.ExecuteComponent(component, callback);
		}
`;
	}
}
