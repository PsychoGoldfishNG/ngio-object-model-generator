'use strict';

/**
 * This module is used to generate object model and component validation classes in browser-friendly ES6 JavaScript
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall NewgroundsIO_objects_Execute class
	 */
	getClassPartial: function() 
	{
		const template = `
    // override - this will populate deeper result objects
    public function castValue(propName, value)
    {
        if (propName === 'result') {
            if (value instanceof Array) {
                var newArr = [];
                for (var i = 0; i < value.length; i++) {
                    newArr.push(io.newgrounds.models.objects.ObjectIndex.CreateResult(value[i].component, value[i].data));
                }
                value = newArr;
            } else {
                value = io.newgrounds.models.objects.ObjectIndex.CreateResult(value.component, value.data);
            }
            
            return this.___result = value;
        }
        super.castValue(propName, value);

        return value;
    }
    `;
		return template;
	}
}