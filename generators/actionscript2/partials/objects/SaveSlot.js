'use strict';

/**
 * This module is used to add helper methods to the SaveSlot object
 */
module.exports = {

	/**
	 * return {string} Code to inject into the overall io.newgrounds.models.objects.SaveSlot class
	 */
	getClassPartial: function() 
	{
		const template = `
    public function clear(callback:Function, thisArg:Object) 
    {
        if (!this.getCore()) {
            throw new Error('Error in '+this.getFullClassName()+': You must attach a core with setCore() before executing clear().');
            return;
        }
        
        var component = new io.newgrounds.models.components.CloudSave.clearSlot({
            id: this.id
        });

        this.datetime = null;
        this.timestamp = null;
        this.size = null;
        this.url = null;

        this.getCore().executeComponent(component, callback, thisArg);
    }

    public function loadRaw(callback:Function, thisArg:Object)
    {
        if (!this.url) {
            if (thisArg === undefined) thisArg = this.getCore();
            callback.call(thisArg, null);
            return;
        }

        var loader:LoadVars = new LoadVars();

        loader.onData = function(data:String):Void
        {
            if (data === undefined) {
                trace("There was an error loading your save slot data.");
            }
            callback.call(thisArg, data);
        };

        loader.load(this.url);
    }
    
    public function setDataRaw(data:String, callback:Function, thisArg:Object)
    {
        if (!this.getCore()) {
            throw new Error('Error in '+this.getFullClassName()+': You must attach a core with setCore() before executing setData().');
            return;
        }

        var component = new io.newgrounds.models.components.CloudSave.setData({
            id: this.id,
            data: data
        });

        this.getCore().executeComponent(component, callback, thisArg);
    }

    public function load(callback:Function, thisArg:Object)
    {
        this.loadRaw(function(data:String):Void
        {
            var decoded = null;
            if (data) decoded = io.newgrounds.encoders.JSON.decode(data);
            callback.call(thisArg, decoded);

        }, this);
    }

    public function setData(data:Object, callback:Function, thisArg:Object)
    {
        this.setDataRaw(io.newgrounds.encoders.JSON.encode(data), callback, thisArg);
    }
    `;
		return template;
	}
}