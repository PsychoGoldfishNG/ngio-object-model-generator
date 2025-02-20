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
    private var __componentObject:io.newgrounds.models.BaseComponent;

    /**
     * Set a component object to execute
     * @param io.newgrounds.models.BaseComponent component Any component model
     */
    public function setComponent(component:io.newgrounds.models.BaseComponent)
    {
        this.__componentObject = component;
    }

    /**
     * Validate this object (overrides default validator)
     * @return Boolean
     */
    public function hasValidProperties():Boolean
    {
        this.__validationErrors = [];

        if (!this.__componentObject) {
            this.__validationErrors.push('Error in '+this.getFullClassName()+': You must attach a component with setComponent() before executing.');
        }

        // Secure components need the core attached so they can be encrypted
        var core = this.getCore();
        if (core === undefined) core = this.__componentObject.getCore();
        
        if (this.__componentObject.isSecure && !core) {
            this.__validationErrors.push('Error in '+this.__componentObject.getFullClassName()+': You must attach a core with setCore() before executing.');
        }
        if (this.__componentObject.requireSession && (!core || !core.session || !core.session.id)) {
            this.__validationErrors.push('Error in '+this.__componentObject.getFullClassName()+': You must have a valid session to execute this component.');
        }

        this.__componentObject.hasValidProperties();
        this.__validationErrors = this.__validationErrors.concat(this.__componentObject.getValidationErrors());

        return this.__validationErrors.length === 0;
    }

    /**
     * Override the default toJsonObject handler and use encryption on components that require it
     * @return object A native object that can be converted to a JSON string
     */
    public function toJsonObject()
    {
        if (!this.hasValidProperties()) return null;

        var obj:Object = {
            component: this.__componentObject.getObjectName(),
            parameters: this.__componentObject.toJsonObject()
        };

        if (this.__componentObject.isSecure) {
            
            var core = this.getCore();
            if (core === undefined) core = this.__componentObject.getCore();

            return {
                secure: core.encrypt(obj)
            };
        }

        return obj;
    }
    `;
		return template;
	}
}