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
return `using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
`;
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
return `
		/// <summary>If this is a list of queued responses, this will be true.</summary>
		public bool isList { get; private set; }

		/// <summary>Single results will be stored here.</summary>
		private NewgroundsIO.BaseResult _result = null;

		/// <summary>Queued results will be stored here</summary>
		private List<NewgroundsIO.BaseResult> _resultList = null;
`;
	},

	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Response constructor
	 */
	getConstructorPartial: function() 
	{
return `			this.__properties.Add("result");
			this.__properties.Add("resultList");
`;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Response class
	 */
	getClassPartial: function() 
	{
return `		/// <summary>A single component result.<summary>
		public NewgroundsIO.BaseResult result {
			get {
				return this._result;
			}
		}

		/// <summary>A list of component results.<summary>
		public List<NewgroundsIO.BaseResult> resultList {
			get {
				return this._resultList;
			}
		}

		/// <summary>Set a single results object from deserialized JSON.<summary>
		public void SetResults(JObject jObj)
		{
			string _component = (string)jObj.GetValue("component").ToObject(typeof(string));
			this._result = NewgroundsIO.ObjectIndex.CreateResult(_component, jObj.GetValue("data") as JObject);

			this.isList = false;
		}

		/// <summary>Set a list of results object from deserialized JSON.<summary>
		public void SetResultsList(JArray jArr)
		{
			string _component;
			this._resultList = new List<NewgroundsIO.BaseResult>();
			foreach (JObject jObj in jArr) {
				_component = (string)jObj.GetValue("component").ToObject(typeof(string));
				this._resultList.Add( NewgroundsIO.ObjectIndex.CreateResult(_component, jObj.GetValue("data") as JObject) );
			}

			this.isList = true;
		}

		/// <summary>This override will link a Core instance to every result in the resultList.</summary>
		public override void SetCoreOnLists( NewgroundsIO.Core ngio )
		{
			if (!(this._resultList is null)) this._resultList.ForEach(child => { if (!(child is null)) child.SetCore(ngio); });
		}
`;
	}
}
