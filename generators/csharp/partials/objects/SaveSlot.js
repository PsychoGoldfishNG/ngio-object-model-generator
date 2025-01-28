'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the 'using' area of the NewgroundsIO.objects.Response class
	 */
	getUsingPartial: function() 
	{
return `using UnityEngine.Networking
`;
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
return `
		/// <summary>This will be true if this save slot has any saved data</summary>
		public bool hasData { get { return this.url is not null; }}
`;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
return `
		/// <summary>Loads the save file for this slot then passes its contents to a callback function.</summary>
		/// <param name="callback">The callback function</param>
		public IEnumerator GetData(Action<string> callback)
		{
			if (this.url is null) {
				callback(null);
				yield break;
			}

			UnityWebRequest www = UnityWebRequest.Get(this.url);
			yield return www.SendWebRequest();

			if (www.result != UnityWebRequest.Result.Success) {
				callback(null);
			} else {
				callback(www.downloadHandler.text);
			}
		}

		/// <summary>Saves string data to a file associated with this slot, and calls a function when complete.</summary>
		/// <param name="data">The data you want to save (needs to be serialized to a string).</param>
		/// <param name="callback">The callback function</param>
		public IEnumerator SetData(string data, Action<NewgroundsIO.objects.Response> callback=null)
		{
			if (__ngioCore is null) {
				if (callback is not null) callback(null);
				yield break;
			}

			var component = new NewgroundsIO.components.CloudSave.setData();
			component.id = this.id;
			component.data = data;
			yield return __ngioCore.ExecuteComponent(component, callback);
		}
`;
	}
}
