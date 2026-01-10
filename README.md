# ngio-object-model-generator
A utility for generating model classes for custom Newgrounds.io libraries.

This utility is intended to be installed into your NGIO library project, where you can manage your templates and helpers as part of that project.

This utility requires NPM/Node.js

## Installing
To add this package to your `package.json`, run:

```bash
npm install  @psychogoldfish/ngio-object-model-generator@github:PsychoGoldfishNG/ngio-object-model-generator  --save
```

## Setup
Once installed, you can run the setup script to generate the initial config file, a helper script, and all the base model templates.

```bash
npx ngio-modgen-setup <path-to-ngio-library-project>
```

In your ngio library project, this will create the `config.js` and `helpers.js` files, along with a `templates` directory containing several `.ejs` ([EJS/Embedded JavaScript](https://ejs.co/)) files.

First, you will need to update the `config.js` file.  This file is fairly well documented already, but essentially you will be setting up all your target and import paths for your model builder in here.

Several of the string values use Mustache.js style templating and can inject dynamic data from the build script.

For example, the variable `{{__dirname}}` will be replaced with directory the config file is located in.

In the `output_files` config, there are also `{{name}}`, `{{component}}`, `{{method}}` variables that get replaced by the various ngio component details.

The paths all refer to the things the build script will import, and the files it will export. Setting these up will make more sense if you know what they all are.

### helper_module / helper.js
The `helper_module` value is the path to the `helpers.js` file we just generated.  This is a JavaScript module that is imported as `helper` in all of your template files.  You can write all sorts of methods in here and use them in your templates.

The default helper provides a few handy example methods like `firstCharToUpper` *(converts the first character of a string to uppercase)*, and `formatMultilineComment` *(converts a multi-line string to an ECMAScript style multi-line comment, with indenting)*.

It also contains the most helpful method you will likely use in your model templates: `getDataType`.  This method looks at all the possible data types a model's properties can have, and generates the appropriate string used for strict typing and typecasting.

You will want to edit the `helper.js` file and edit these methods so the produce the correct results for whatever language you are generating models for.

Everything in the default file is pretty well documented, so be sure to read all the comments for guidance.

Once you have the helper module updated, you can call any of these methods in a template with an EJS tag like ```<%- helper.firstCharToUpper('hello World!') %>``` *(which will render `Hello World`)*.

### partials_dir / partial files

The `partials_dir` value is the path to where your partial templates can be found.

Partials are small chunks of templating you can use to inject into larger templates.  There are plenty of ways you can use these, but typically you will be using them to inject things like extra properties and methods into specific models.

We'll explain a bit about how these work, but you'll probably want to read the rest of this document before you actually start diving in and making changes.  If you feel a bit lost at any point here, just keep going and it will make more sense when you circle back.

In your templates, you can use the `partial` object, inside EJS tags, to inject partials.  There are 3 methods in this object: `has`, `get` and `getIfExists`.

All of these require a path to the requested partial as the first parameter.  These paths are relative to the path you set in the `partials_dir` config value.  `get` and `getIfExists` will accept an optional object as a second parameter.  This object can contain any properties you want the partial to have access to as local variables.

```partial.has``` will return true if the provided partial exists.
```partial.get``` will render the requested partial, or throw an error if it doesn't exist.
```partial.getIfExists``` will render the requested partial if it exists.

For the most part, you'll likely only ever use `getIfExists`, so here's a small example of how.

In your partials directory, you could create a file named `test.ejs`. In this file, you can add the following text:

```ejs
<p>This is my test partial. My test value is <%- testVal %>
```

This file is just HTML markup with a single EJS variable being printed.

In one of your template files, you would be able to use this partial with the following EJS tag:

```ejs
<%- partial.getIfExists('test', {testVal: 'Hello World'}) %>
```

This tag makes sure that your test.ejs file exists, and since it does, passes the object to it, renders it, then prints the result into your template.

When you ran the setup script, it will have created a handful of recommended partials for you.  You should give these all a once over and make sure you want to use them, and update the default code to your target language/platform.

For example, there is a partial at `<your-partials-dir>/objects/Execute/methods.ejs`.  If you were to use the structure all the default templates are designed with, this partial would only be included when the object template is rendering the `Execute` object.

In Newgrounds.io, this is the object that wraps every component you send to the server, and so, it would benefit from some methods for handling how that happens, as some components need to be encrypted, where others are sent as plain objects.

In the `method.ejs` file, we will be injecting a `setComponent` method.  Once all your code gets generated, you will be able to set the component object you want to send to the server inside an Execute object using this injected method. *(Note: there is also a `properties.ejs` file we'd have injected as well for declaring the new componentObject property)*

This partial also overrides a `toJsonObject` method we would be using in our base object class to convert objects to JSON-encodable objects.  This override would check the component object and either return a flat object with its name and properties, or an object with a secure, encrypted string.

If you explore the example partials more, you'll see we can do things like adding an `unlock` method to medal objects, `postScore` to scoreBoards, and so on.  When you are ready to start updating all these templates, you'll definitely want to go through all of these!

### template_files
The `template_files` object contains values for 4 template file paths: `objects`, `components`, `results` and `object_factory`.

Like partials, templates are all EJS files that are rendered using rules for all of our various models.  Newgrounds.io uses 3 types of model.

**Objects** are the absolute base type of model.  These are just collection of properties representing an object like a medal, or a user.

**Components** are a type of object.  These contain all the properties required to execute a component on the server.

**Results** are also a type of object, and contain all the properties that are expected in a server response for an executed component.

Each of these object types has a corresponding template the setup script will have created for you.  They each contain a lot of comment documentation explaining the objects and variables that are available to them, and will demonstrate where you may want to load some of the partials we talked about earlier.  You will need to edit all of these to use your chosen language/platform.

Finally, there is the optional `object_factory` template.  In most strict languages, you will need to be able to reliably know what type of model various functions will use.  However, the server communication largely depends on converting json strings, so you will probably need to make some middleware that is able to convert them to the correct models.

The object factory template is used to build this tool.  The example template has 3 methods: `CreateObject`, `CreateComponent` and `CreateResult`, each used for building one of our main object types using parsed JSON data.

You can edit this template to your language/platform, or, of you do not need an object factory, you can simply delete the template and this value from the config file.  If no path is set in the config, the build script will skip it.

### output_files
The `output_files` object contains strings used to build your export paths for your `objects`, `components`, `results` and `object_factory` files.

You will notice this strings use a few MustacheJS style variables.  As mentioned above, {{__dirname}} is the path in which the `config.js` file resides.  You can make your output paths relative to that, or replace that variable with a full path.

In the `objects` value, the {{name}} variable will be replaced with the name of the object being rendered, for example 'ScoreBoard' or 'Medal'.  Object names use UpperCaseCamelCase formatting.

The `components` and `results` values have {{component}} and {{method}} variables.  Component names are the prefix side of an NGIO component, and method names are the suffix.  The **ScoreBoard.postScore** call, for example, has a component name of 'ScoreBoard' and a method name of 'postScore'.  Component names use UpperCaseCamelCase formatting, while method names are in lowerCaseCamelCase.

If your platform expects a different type of formatting for model file names, you can prefix these variables with the following:

 - `lc_` - Converts value to all lowercase
 - `uc_` - Converts value to all uppercase
 - `lcc` - Converts value to lowerCaseCamelCase
 - `ucc_` - Converts value to UpperCaseCamelCase

If you wanted your template names to be formatted like `<template-path>/SCOREBOARD/postscore.template` you would set the value to `{{__dirname}}/{{uc_component}}/{{lc_method}}.template`

## Building Your Model Files
Once you have completed setting up your config file, and updating all of your templates, simply run

```bash
npx ngio-modgen-build <path-to-config.js>
```
The build script will download the latest model definitions from the NGIO server, then generate all the files to the paths you set up in your config file.

Bear in mind, this tool ONLY builds these model files and the object factory.  You will still need to build all the code to handle everything else.

Check out the [Newgrounds.io Developer Guide](https://github.com/PsychoGoldfishNG/ngio-developer-guide) for more information on building out the rest of your library.