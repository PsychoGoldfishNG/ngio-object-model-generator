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
		return "";
	},

	/**
	 * return {string} Code to inject into the property definition area of the NewgroundsIO.objects.Response class
	 */
	getPropertiesPartial: function() 
	{
return `
		/// <summary>If this is a list of queued components, this will be true.</summary>
		public bool isList { get; set; } = false;

		/// <summary>An ExecuteWrapper object to run in this request.</summary>
		public NewgroundsIO.ExecuteWrapper execute { get; set; }

		/// <summary>A list of ExecuteWrapper objects to run in this request (if executing a queue).</summary>
		public List<NewgroundsIO.ExecuteWrapper> executeList { get; set; } = new List<NewgroundsIO.ExecuteWrapper>();

		/// <summary></summary>
		private bool __requireSession = false;
`;
	},

	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Request constructor
	 */
	getConstructorPartial: function() 
	{
return `
			// Add the execute property and make it required.
			this.__properties.Add("execute");
			this.__required.Add("execute");
`;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Request class
	 */
	getClassPartial: function() 
	{
return `
		/// <summary></summary>
		/// <param name="propName">The property to encode.</param>
		public override string _getPropertyJSON(string propName) 
		{
			// This could be a single execute, or a whole queue. Decide which to encode.
			if (propName == "execute") {
				return "\\"execute\\":" + this._getValueJSON((this.isList ? this.executeList : this.execute));
			}

			return base._getPropertyJSON(propName);
		}

		/// <summary>Checks to see if we can skip including a property. In this case, debug.</summary>
		/// <param name="propName">The property to check.</param>
		public override bool _skipJsonProp(string propName)
		{ 
			if (propName == "debug" && !this.debug) return true;
			return base._skipJsonProp(propName);
		}

		/// <summary>Tells this request if a valid user session is required to execute one or more components.</summary>
		/// <param name="require">Set to true if a component requires a session.</param>
		public void RequiresSession(bool require)
		{ 
			__requireSession = require;

			// if we don't have a Core or session, this is a bad request
			if (require && ((__ngioCore is null) || (this.session_id is null))) {
				UnityEngine.Debug.LogError("NewgroundsIO Error: One or more components requires an active user session!");
			}
		}

		/// <summary>Links a Core to this request and extracts it's app ID.</summary>
		/// <param name="ngio">The Core instance.</param>
		public override void SetCore(Core ngio)
		{ 
			base.SetCore(ngio);
			this.app_id = ngio.appID;
			if (!(ngio.session?.id is null)) this.session_id = ngio.session.id;
		}
`;
	}
}
