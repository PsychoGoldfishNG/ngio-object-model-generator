'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the NewgroundsIO_objects_Execute constructor
	 */
	getConstructorPartial: function() 
	{
		const template = `
			this.__componentObject = null;
		`;

		return template;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Execute class
	 */
	getClassPartial: function() 
	{
		const template = `
		/**
		 * Set a component object to execute
		 * @param {NewgroundsIO_components} component Any NGIO component object
		 */
		setComponent(component)
		{
			if (!(component instanceof NewgroundsIO_components))
				console.error('NewgroundsIO Error: Expecting NewgroundsIO component, got '+typeof(component));

			this.__componentObject = component;

			// set the string name of the component;
			this.component = component.toString();
			this.parameters = component.toJSON();
		}

		/**
		 * Validate this object (overrides default validator)
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
			if (this.__componentObject) {
				if (this.__componentObject.__requireSession && !this.__ngioCore.session.isActive()) {
					console.warn('NewgroundsIO Warning: '+this.component+' can only be used with a valid user session.');
					this.__ngioCore.session.logProblems();
					return false;
				}

				return (this.__componentObject instanceof NewgroundsIO_components) && this.__componentObject.isValid();
			}

			return true;
		}

		/**
		 * Override the default toJSON handler and use encryption on components that require it
		 * @return {object} A native JS object that can be converted to a JSON string
		 */
		toJSON()
		{
			if (this.__componentObject && this.__componentObject.__isSecure) return this.toSecureJSON();
			return super.toJSON();
		}
		`;
		return template;
	}
}