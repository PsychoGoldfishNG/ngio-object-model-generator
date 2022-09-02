# ngio-object-model-generator
A framework for building client-side object and component classes for the Newgrounds.io API

This package currently supports object and model generation for the following platforms/languages:

* JavaScript
* C# (For Unity)

## Installing & Configuring ##

Run 'node build.js install' to generate the config.js file.

You can edit the new config.js file to change any of the generator settings.  Typically, the only reason to edit this is to change the output directories, or to add new generators.

## Building Object and Ccomponent Models ##

Run 'node build.js &lt;generatorname&gt;'

Current generator names are:

 * javascript
 * csharp (for C#)
 * js (alias for javascript)
 * cs (alias for csharp)
 
Generator names ARE case sensitive.
