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

        var callbackParams = {callback: callback, thisArg: thisArg};
        this.getCore().executeComponent(component, onUnlock, this, callbackParams);
    }

    public function onUnlock(result:Object, callbackParams:Object):Void
    {
        if (result.success) {
            this.unlocked = true;
        }
        
        if (callbackParams.callback !== undefined) {
            callbackParams.callback.call(callbackParams.thisArg, result.medal, result.medal_score);
        }
    }
    `;
		return template;
	}
}