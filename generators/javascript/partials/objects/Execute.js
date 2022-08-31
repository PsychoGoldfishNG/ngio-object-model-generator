'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the NewgroundsIO.objects.Execute constructor
	 */
	getConstructorPartial: function() 
	{
		var out = 			"\n";

		out +=				"			this.__componentObject = null;\n";

		return out;
	},

	/**
	 * return {string} Code to inject into the overall NewgroundsIO.objects.Execute class
	 */
	getClassPartial: function() 
	{
		var out = "";
		
		out += 				"		/**\n";
		out += 				"		 * Set a component object to execute\n";
		out += 				"		 * @param {NewgroundsIO.BaseComponent} component Any NGIO component object\n";
		out += 				"		 */\n";
		out += 				"		setComponent(component)\n";
		out += 				"		{\n";
		out += 				"			if (!(component instanceof NewgroundsIO.BaseComponent))\n";
		out += 				"				console.error('NewgroundsIO Error: Expecting NewgroundsIO component, got '+typeof(component));\n\n";

		out += 				"			this.__componentObject = component;\n\n";

		out += 				"			// set the string name of the component;\n";
		out += 				"			this.component = component.__object;\n";
		out += 				"			this.parameters = component.toJSON();\n";

		out += 				"		}\n\n";

		out += 				"		/**\n";
		out += 				"		 * Validate this object (overrides default valdator)\n";
		out += 				"		 * @return {Boolean}\n";
		out += 				"		 */\n";
		out +=				"		isValid()\n";
		out +=				"		{\n";
		out +=				"			// must have a component set\n";
		out +=				"			if (!this.component) {\n";
		out +=				"				console.error('NewgroundsIO Error: Missing required component!');\n";
		out +=				"			}\n\n";

		out +=				"			// must be linked to a core NewgroundsIO instance\n";
		out +=				"			if (!this.__ngioCore) {\n";
		out +=				"				console.error('NewgroundsIO Error: Must call setCore() before validating!');\n";
		out +=				"				return false;\n";
		out +=				"			}\n\n";

		out +=				"			// SHOULD have an actual component object. Validate that as well, if it exists\n";
		out +=				"			if (this.__componentObject) {\n";
		out +=				"				if (this.__componentObject.__requireSession && !this.__ngioCore.session.isActive()) {\n";
		out +=				"					console.warn('NewgroundsIO Warning: '+this.component+' can only be used with a valid user session.');\n";
		out +=				"					this.__ngioCore.session.logProblems();\n";
		out +=				"					return false;\n";
		out +=				"				}\n\n";

		out +=				"				return (this.__componentObject instanceof NewgroundsIO.BaseComponent) && this.__componentObject.isValid();\n";
		out +=				"			}\n\n";

		out +=				"			return true;\n";
		out +=				"		}\n\n";

		out +=				"		/**\n";
		out +=				"		 * Override the default toJSON handler and use encryption on components that require it\n";
		out +=				"		 * @return {object} A native JS object that can be converted to a JSON string\n";
		out +=				"		 */\n";
		out +=				"		toJSON()\n";
		out +=				"		{\n";
		out +=				"			if (this.__componentObject && this.__componentObject.__isSecure) return this.toSecureJSON();\n";
		out +=				"			return super.toJSON();\n";
		out +=				"		}\n\n";
		return out;
	}
}