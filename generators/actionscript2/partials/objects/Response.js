'use strict';

/**
 * This module is used to generate advanced value casting in the Response object
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall io.newgrounds.models.objects.Response class
	 */
	getClassPartial: function() 
	{
		const template = `
    // override - this will populate deeper result objects
    public function castValue(propName, value)
    {
        if (propName === 'result') {
            if (value instanceof Array) {
                var aValue;
                var newArr = [];
                for (var i = 0; i < value.length; i++) {
                    aValue = io.newgrounds.models.objects.ObjectIndex.CreateResult(value[i].component, value[i].data);
                    aValue.attachCore(this.getCore());
                    newArr.push(aValue);
                }
                value = newArr;
            } else {
                value = io.newgrounds.models.objects.ObjectIndex.CreateResult(value.component, value.data);
                value.attachCore(this.getCore());
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