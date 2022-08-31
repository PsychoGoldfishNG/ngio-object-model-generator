'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Execute class
	 */
	getClassPartial: function() 
	{
		var out = `

		/**
		 * @private
		 */
		#componentObject = null;

		/**
		 * Set a component object to execute
		 * @param {NewgroundsIO.BaseComponent} component Any NGIO component object
		 */
		setComponent(component)
		{
			if (!(component instanceof NewgroundsIO.BaseComponent))
				console.error('NewgroundsIO Error: Expecting NewgroundsIO component, got '+typeof(component));

			this.#componentObject = component;

			// set the string name of the component;
			this.component = component.__object;
			this.parameters = component.toJSON();

		}

		/**
		 * Validate this object (overrides default valdator)
		 * @return {Boolean}
		 */
		isValid()
		{
			// must have a component set
			if (!this.component) {
				console.error('NewgroundsIO Error: Missing required component!');
			}

			// must be linked to a core NewgroundsIO instance
			if (!this.__ngioCore) {
				console.error('NewgroundsIO Error: Must call setCore() before validating!');
				return false;
			}

			// SHOULD have an actual component object. Validate that as well, if it exists
			if (this.#componentObject) {
				if (this.#componentObject.__requireSession && !this.__ngioCore.session.isActive()) {
					console.warn('NewgroundsIO Warning: '+this.component+' can only be used with a valid user session.');
					this.__ngioCore.session.logProblems();
					return false;
				}

				return (this.#componentObject instanceof NewgroundsIO.BaseComponent) && this.#componentObject.isValid();
			}

			return true;
		}

		/**
		 * Override the default toJSON handler and use encryption on components that require it
		 * @return {object} A native JS object that can be converted to a JSON string
		 */
		toJSON()
		{
			if (this.#componentObject && this.#componentObject.__isSecure) return this.toSecureJSON();
			return super.toJSON();
		}

`;
		return out;
	}
}