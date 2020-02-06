# eslint-plugin-require-sort

<p>
<a href="https://www.npmjs.com/package/eslint-plugin-require-sort"><img src="https://img.shields.io/npm/v/eslint-plugin-require-sort.svg"/></a>
<a href="https://circleci.com/gh/zcuric/eslint-plugin-require-sort">
<img src="https://circleci.com/gh/zcuric/eslint-plugin-require-sort/tree/master.svg?style=svg"/></a>
</p>

  - [Introduction](#introduction)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Rule Details](#rule-details)
  - [Options](#options)
  - [Examples](#examples)
    - [Default settings](#default-settings)
    - [`ignoreCase`](#ignorecase)
    - [`ignoreDeclarationSort`](#ignoredeclarationsort)
    - [`ignorePropertySort`](#ignorepropertysort)
    - [`propertySyntaxSortOrder`](#propertysyntaxsortorder)
  - [Credits](#credits)
  - [Contributions](#contributions)
  - [License](#license)

## Introduction
What is `require`? From latest [Node documentation](https://nodejs.org/api/modules.html) require is a `function`. As Node follows CommonJS module system, `require` function is the easiest way to include modules that exist in separate files - more on that [here](https://nodejs.org/en/knowledge/getting-started/what-is-require/). 

Difference between CommonJS and ES2015 modules is very nicely explained [in this short talk](https://www.youtube.com/watch?v=8O_H2JgV7EQ).

[From AST point of view](https://astexplorer.net/#/gist/577afe7c245364a40a495051b8289508/9dc2d43629dd548417fb26b4c2aa9ae68578b7d1) `const foo = require('bar')` is a `VariableDeclaration` and `require` is `CallExpression`. And in this eslint plugin is treated as such. 
`foo` is in this case an `Identifier`. 
In case of destructuring `const { foo, bar } = require('baz')`, `foo` and `bar` are `properties` in `ObjectPattern`.

This is important for nomenclature in the plugin, because it's not straight forward as in [`sort-imports`](https://eslint.org/docs/rules/sort-imports) rule provided by `eslint`.

In this plugin all `Identifiers` are called `properties` to simplify things. The goal is to follow the AST as closely as possible. What `member` is to `sort-imports` rule, `properties` are to this plugin. 

Hopefully this all makes sense.

## Installation

Install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Install `eslint-plugin-require-sort`:

```
$ npm install eslint-plugin-require-sort --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must
also install `eslint-plugin-require-sort` globally.

## Usage

Add `require-sort` to the plugins and rules section of your `.eslintrc(.js|.json|.yaml)` configuration
file:

```json
{
  "plugins": ["require-sort"],
  "rules": {
    "require-sort/require-sort": "error"
  }
}
```

## Rule Details

This rule checks all declarations and verifies that all are first sorted by the used property syntax and then alphabetically by the first property or alias name.

The `--fix` option on the command line automatically fixes some problems reported by this rule: multiple properties on a single line are automatically sorted (e.g. `const { b, a } =  require('foo')` is corrected to `const { a, b } =  require('foo')`), but multiple lines are not reordered.

Rule ignores `require` functions inside functions, `if` statements, etc. For example, 
```js
function foo() {
  const bar = require('baz');
}
```
will be ignored. Only top level variable declarations with `require` are considered. 

## Options

This rule accepts an object with its properties as

* `ignoreCase` (default: `false`)
* `ignoreDeclarationOrder` (default: `false`)
* `ignorePropertySort` (default: `false`)
* `propertySyntaxSortOrder` (default: `["note", "multiple", "single"]`); all items must be present in the array, but you can change the order.

Default option settings are:

```json
{
    "require-sort/require-sort": ["error", {
        "ignoreCase": false,
        "ignoreDeclarationSort": false,
        "ignorePropertySort": false,
        "propertySyntaxSortOrder": ["none", "multiple", "single"]
    }]
}
```

## Examples

### Default settings

Examples of **correct** code for this rule when using default options:

```js
/*eslint require-sort: "error"*/
const { alpha, beta } = require('alpha');
const { delta, gamma } = require('delta');
const a = require('baz');
const b = require('qux');

/*eslint require-sort: "error"*/
const a = require('foo');
const b = require('bar');
const c = require('baz');

/*eslint require-sort: "error"*/
const { a, b } = require('baz');
const c = require('qux');

/*eslint require-sort: "error"*/
const { a, b, c } = require('foo)'
```

Examples of **incorrect** code for this rule when using default options:

```js
/*eslint require-sort: "error"*/
const b = require('foo');
const a = require('bar');

/*eslint require-sort: "error"*/
const a = require('foo');
const A = require('bar');

/*eslint require-sort: "error"*/
const { b, c } = require('foo');
const { a, b } = require('bar');

/*eslint require-sort: "error"*/
const a = require('foo');
const { b, c } = require('bar');

/*eslint require-sort: "error"*/
const a = require('foo');

/*eslint require-sort: "error"*/
const { b, a, c } = require('foo');
```

### `ignoreCase`

When `true` the rule ignores the case-sensitivity of the declaration

Examples of **incorrect** code for this rule with the `{ "ignoreCase": true }` option:

```js
/*eslint require-sort: ["error", { "ignoreCase": true }]*/

const b = require('foo');
const a = require('bar');
```

Examples of **correct** code for this rule with the `{ "ignoreCase": true }` option:

```js
/*eslint require-sort: ["error", { "ignoreCase": true }]*/

const a = require('foo');
const B = require('bar');
const c = require('baz');
```

Default is `false`.

### `ignoreDeclarationSort`

Ignores the sorting of variable declarations with `require`.

Examples of **incorrect** code for this rule with the default `{ "ignoreDeclarationSort": false }` option:

```js
/*eslint require-sort: ["error", { "ignoreDeclarationSort": false }]*/
const b = require('foo');
const a = require('bar');
```

Examples of **correct** code for this rule with the `{ "ignoreDeclarationSort": true }` option:

```js
/*eslint require-sort: ["error", { "ignoreDeclarationSort": true }]*/
const a = require('foo');
const b = require('bar');
```

```js
/*eslint require-sort: ["error", { "ignoreDeclarationSort": true }]*/
const b = require('foo');
const a = require('bar');
```

Default is `false`.

### `ignorePropertySort`

Ignores the property sorting within a `multiple` property in declaration.

Examples of **incorrect** code for this rule with the default `{ "ignorePropertySort": false }` option:

```js
/*eslint require-sort: ["error", { "ignorePropertySort": false }]*/
const { b, a, c } = require('foo');
```

Examples of **correct** code for this rule with the `{ "ignorePropertySort": true }` option:

```js
/*eslint require-sort: ["error", { "ignorePropertySort": true }]*/
const { b, a, c } = require('foo');
```

Default is `false`.

### `propertySyntaxSortOrder`

There are three different styles and the default property syntax sort order is:
s.
* `none` - just a require expression
* `multiple` - require multiple properties.
* `single` - require single property.

Both options must be specified in the array, but you can customize their order.

Examples of **correct** code for this rule with the `{ "propertySyntaxSortOrder": ["none", "single", "multiple"] }` option:

```js
/*eslint require-sort: ["error", { "propertySyntaxSortOrder":  ["none", "single", "multiple"]  }]*/
require('bar');
const z = require('zoo');
const { a, b } = require('foo');
```

Default is `["none", "multiple", "single"]`.

## Credits
- This plugin is [inspired by `sort-imports` rule](https://github.com/eslint/eslint/blob/master/lib/rules/sort-imports.js). Credits to authors an maintainers of that rule. 
- [@vladimyr](https://github.com/vladimyr) who pointed me to AST explorer.
- [@kronicker](https://github.com/kronicker) who said it that this won't work in some cases :stuck_out_tongue_winking_eye:

## Contributions
- All contributions, suggestions are welcome.

## License

MIT @ Zdravko Ćurić [(zcuric)](https://github.com/zcuric)

