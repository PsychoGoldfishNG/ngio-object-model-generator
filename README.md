# ngio-object-model-generator
A utility for generating model classes for custom Newgrounds.io libraries.

This utility downloads the latest Newgrounds.io API documentation and generates all the object, component, and result classes needed for your library, along with optional core/foundation files.

This utility requires NPM/Node.js

## Quick Start

```bash
# 1. Initialize a new project
npx ngio-init ./my-ngio-project

# 2. Edit config.js and helpers.js for your target language

# 3. Scaffold templates and skeleton files
npx ngio-scaffold ./my-ngio-project/config.js

# 4. Customize templates and translate skeleton files

# 5. Build final model files
npx ngio-build ./my-ngio-project/config.js
```

## Installing

If you want to use this tool in your project, you can install it:

```bash
npm install @psychogoldfish/ngio-object-model-generator@github:PsychoGoldfishNG/ngio-object-model-generator --save
```

However, you can also use it directly with `npx` without installing.

## The Workflow

The generator uses a three-step workflow:

### 1. Initialize (`npx ngio-init`)

Creates the foundation files for your project:

```bash
npx ngio-init <path-to-your-project>
```

This creates:
- `config.js` - Configuration file defining paths, file extensions, and structure
- `helpers.js` - Utility functions for type conversion and name transformations
- `GETTING_STARTED.txt` - Complete guide to customizing the generator

**These files are meant to be edited!** Customize them for your target programming language.

### 2. Scaffold (`npx ngio-scaffold`)

Copies template and skeleton files to your project:

```bash
npx ngio-scaffold <path-to-config.js>
```

This creates:
- `templates/` directory with EJS template files for code generation
- Skeleton files (if `core_files.enabled` is true in config) - foundation code in pseudo-code format
- `TEMPLATE_GUIDE.txt` - Documentation on how templates work
- `IMPLEMENTATION_GUIDE.txt` - Documentation on translating skeleton files

You'll need to:
- Customize the templates to output code in your target language
- Translate skeleton files from pseudo-code to your language (if using core_files)

### 3. Build (`npx ngio-build`)

Generates all model files:

```bash
npx ngio-build <path-to-config.js>
```

This:
- Downloads the latest Newgrounds.io API documentation
- Generates object classes (Medal, User, ScoreBoard, etc.)
- Generates component classes (Medal.unlock, ScoreBoard.postScore, etc.)
- Generates result classes for API responses
- Optionally generates an object factory for creating instances by name

## Understanding the Config File

The `config.js` file controls how everything is generated. Key sections:

### Basic Settings

```javascript
output_file_extension: ".js"  // Set to your language: ".cs", ".py", etc.
helpers: helpers              // Reference to your helpers module
```

### Directory Paths

```javascript
partials_dir: "./templates/partials"  // Where partial templates are stored
template_dir: "./templates"            // Where main templates are located
build_dir: "./build"                   // Where generated files go
```

### Template Files (used by scaffold)

Functions that return paths to template files:

```javascript
template_files: {
  objects: (config) => `${config.template_dir}/object.ejs`,
  components: (config) => `${config.template_dir}/component.ejs`,
  results: (config) => `${config.template_dir}/result.ejs`,
  object_factory: (config) => `${config.template_dir}/object_factory.ejs`
}
```

### Model Files (used by build)

Functions that return paths where generated files will be saved:

```javascript
model_files: {
  objects: (config, name) => 
    `${config.models_dir}/objects/${name}${config.output_file_extension}`,
  
  components: (config, componentScope, componentMethod) => 
    `${config.models_dir}/components/${componentScope}/${componentMethod}${config.output_file_extension}`,
  
  results: (config, componentScope, componentMethod) => 
    `${config.models_dir}/results/${componentScope}/${componentMethod}${config.output_file_extension}`
}
```

### Core Files (optional)

Foundation/skeleton files that everything else depends on:

```javascript
core_files: {
  enabled: true,  // Set to false if you don't need skeleton files
  overwrite: false,  // Whether to overwrite existing skeleton files
  files: {
    NGIO: (config) => `${config.build_dir}/NGIO.js`,
    Core: (config) => `${config.build_dir}/Core.js`,
    BaseObject: (config) => `${config.build_dir}/models/BaseObject.js`,
    // ... etc
  }
}
```

## Understanding Helpers

The `helpers.js` module contains utility functions used throughout templates and config.

**Most important function to customize:**

```javascript
getDataType(property) {
  // Converts API property types to your language's types
  if (property.type === "String") return "string";  // or "str" for Python, etc.
  if (property.type === "Number") return "number";  // or "int" for Python, etc.
  // ... etc
}
```

**Name transformation helpers:**

- `convertToCamelCase()` - myVariableName
- `convertToPascalCase()` - MyClassName
- `convertToSnakeCase()` - my_variable_name
- `convertToKebabCase()` - my-variable-name
- `convertToScreamingSnakeCase()` - MY_CONSTANT_NAME

Use these to follow your language's naming conventions.

## Understanding Templates

Templates are [EJS](https://ejs.co/) files that generate your model classes. There are four main templates:

- `object.ejs` - Generates classes for core objects (Medal, User, ScoreBoard, etc.)
- `component.ejs` - Generates classes for API components (Medal.unlock, etc.)
- `result.ejs` - Generates result classes for API responses
- `object_factory.ejs` - Generates a factory for creating instances by name (optional)

Templates receive these variables:

- `model` - The object/component/result data being generated
- `helpers` - Your helpers module
- `partial` - Methods to include partial templates
- `config` - Your full config object

### Using Partials

Partials let you inject custom code into specific objects. They're stored in `partials/objects/ObjectName/`:

```
partials/
  objects/
    Medal/
      methods.ejs       - Custom methods for Medal class
    Execute/
      methods.ejs
      properties.ejs
    SaveSlot/
      methods.ejs
```

In your templates, use:

```ejs
<%- partial.getIfExists(`objects/${model.name}/methods`) %>
```

This will:
1. Check if `partials/objects/Medal/methods.ejs` exists (for Medal objects)
2. If yes, render it and include the output
3. If no, output nothing (no error)

Partial methods:
- `partial.has(path)` - Returns true/false if partial exists
- `partial.get(path, data)` - Loads partial (throws error if missing)
- `partial.getIfExists(path, data)` - Loads partial if exists, otherwise returns ""

## Customizing for Your Language

1. **Edit config.js:**
   - Set `output_file_extension` to your language's extension
   - Update path functions to match your project structure

2. **Edit helpers.js:**
   - Update `getDataType()` to return correct types for your language
   - Add any language-specific helper functions you need

3. **Run scaffold:**
   ```bash
   npx ngio-scaffold config.js
   ```

4. **Edit templates:**
   - Replace pseudo-code with your language's syntax
   - Update class structures, getters/setters, methods, etc.

5. **Translate skeleton files (if using core_files):**
   - Convert `.pseudo` files to your language
   - These are foundation files like NGIO, Core, BaseObject, etc.

6. **Run build:**
   ```bash
   npx ngio-build config.js
   ```

7. **Test and iterate:**
   - Check generated files
   - Adjust templates as needed
   - Rebuild

## What Gets Generated

When you run `ngio-build`, it generates:

### Objects (10+ classes)
Core data structures returned by the API:
- Medal, User, ScoreBoard, Score, SaveSlot, Session, Error, etc.

### Components (30+ classes)
API request classes for each component method:
- App.checkSession, Medal.unlock, ScoreBoard.postScore, etc.

### Results (30+ classes)
API response classes for each component:
- App.checkSession result, Medal.unlock result, etc.

### Object Factory (optional)
A factory class that can create object instances by name, useful for deserializing JSON responses.

## Documentation Files

After setup, you'll have these guides:

- `GETTING_STARTED.txt` (created by ngio-init) - Overview and workflow
- `TEMPLATE_GUIDE.txt` (created by ngio-scaffold) - Template system details
- `IMPLEMENTATION_GUIDE.txt` (created by ngio-scaffold) - Skeleton file guide

## Command Reference

```bash
# Initialize new project
npx ngio-init <project-path>

# Scaffold templates and skeletons
npx ngio-scaffold <config-path>
npx ngio-scaffold <config-path> --force  # Overwrite existing files

# Build model files
npx ngio-build <config-path>
```

## Additional Resources

- [Newgrounds.io API Documentation](https://www.newgrounds.io/help/)
- [API Objects & Components JSON](https://www.newgrounds.io/help/objects_and_components.json)
- [EJS Template Documentation](https://ejs.co/)
- [Newgrounds.io Developer Guide](https://github.com/PsychoGoldfishNG/ngio-developer-guide)

## What This Tool Does NOT Do

This generator creates the **model classes** for your library. You still need to build:
- Core networking/HTTP request handling
- Session management
- Encryption for secure components
- Response parsing and deserialization
- Error handling
- Any platform-specific integrations

Check out the [Newgrounds.io Developer Guide](https://github.com/PsychoGoldfishNG/ngio-developer-guide) for guidance on building the rest of your library.