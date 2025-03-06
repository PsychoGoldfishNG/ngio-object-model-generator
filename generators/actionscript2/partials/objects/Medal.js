'use strict';

/**
 * This module is used to add helper methods to the Medal object
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall io.newgrounds.models.objects.Medal class
	 */
	getClassPartial: function() 
	{
		const template = `
    public function unlock(callback:Function, thisArg:Object)
    {
        if (!this.getCore()) {
            throw new Error('Error in '+this.getFullClassName()+': You must attach a core with setCore() before executing unlock().');
            return;
        }
        
        var component = new io.newgrounds.models.components.Medal.unlock({
            id: this.id
        });

        this.getCore().executeComponent(component, callback, thisArg);
    }
    `;
		return template;
	}
}