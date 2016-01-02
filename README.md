find-modules-in
===============

Install
-------

`npm install --save find-modules-in`

Usage
-----

```javascript
var find_modules = require('find-modules-in');

find_modules('some_directory').then(function(modules){
    console.log('modules =');
    console.log(modules);
}).catch(function(e){
    console.log('failed!');
    console.log(e);
});
```

Search in the node_modules:

```javascript
var find_modules = require('find-modules-in');

find_modules('project/node_modules').then(function(modules){
    console.log('modules =');
    console.log(modules);
}).catch(function(e){
    console.log('failed!');
    console.log(e);
});
```

About
-----

This modules finds modules just inside a directory. It only searches in the directory specified.

Modules that `find-modules-in` looks for are ones that are contained in there own directory. Some modules that people create are just a file. `find-modules-in` doesn't look for those kinds of modules that aren't contained in their own directory.

`find-modules-in` also does not check if found modules contain valid code. Once modules are found you can of course run the `index.js` files through a linter, but their's no guaruntee sub-modules will be valid. Which you probably knew already. :)

API
---

### find_modules(directory, indexes) -> promise

Look for modules under `directory`.

`indexes` is optional, and default `false`.

If `indexes` is passed `false` modules only with package.jons files will be searched for.

If `indexes` is passed `true` modules that contain `index.js`, or `index.node` will also be searched for.

If `indexes` is passed an array of file name strings those are the indexed files that will be searched for when there's no `package.json` file.
