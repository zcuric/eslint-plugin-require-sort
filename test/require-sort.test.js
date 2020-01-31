'use strict';

const rule = require('../index.js').rules['require-sort'];
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: 'script' } });

const expectedError = {
  message: 'Requires should be sorted alphabetically.',
  type: 'VariableDeclaration'
};
const ignoreCaseArgs = [{ ignoreCase: true }];

ruleTester.run('require-sort', rule, {
  valid: [
    "const a = require('foo.js');\n" +
    "const b = require('bar.js');\n" +
    "const c = require('baz.js');\n",
    "const A = require('bar.js');",
    "const {a, b} = require('bar.js');",
    "const {b, c} = require('bar.js');\n" +
    "const A = require('foo.js');",
    {
      code:
        "const A = require('bar.js');\n" +
        "const {b, c} = require('foo.js');",
      options: [{
        propertySyntaxSortOrder: ['none', 'single', 'multiple']
      }]
    },
    "const {a, b} = require('bar.js');\n" +
    "const {c, d} = require('foo.js');",
    "const A = require('foo.js');\n" +
    "const B = require('bar.js');",
    "const A = require('foo.js');\n" +
    "const a = require('bar.js');",
    "const c = require('bar.js');",
    " const a = require('bar.js');",
    "const B = require('foo.js');\n" +
    "const a = require('bar.js');",
    {
      code:
        "const a = require('foo.js');\n" +
        "const B = require('bar.js');",
      options: ignoreCaseArgs
    },
    "const {a, b, c, d} = require('foo.js');",
    {
      code:
        "const a = require('foo.js');\n" +
        "const B = require('bar.js');",
      options: [{
        ignoreDeclarationSort: true
      }]
    },
    {
      code: "const {b, A, C, d} = require('foo.js');",
      options: [{
        ignorePropertySort: true
      }]
    },
    {
      code: "const {B, a, C, d} = require('foo.js');",
      options: [{
        ignorePropertySort: true
      }]
    },
    {
      code: "const {a, B, c, D} = require('foo.js');",
      options: ignoreCaseArgs
    },
    "const b = require('bar.js');",
    {
      code:
        "require('bar.js');\n" +
        "const {b, c} = require('foo.js');",
      options: [{
        propertySyntaxSortOrder: ['none', 'multiple', 'single']
      }]
    },
    {
      code: `
        const { b: a } = require('foo.js');
        const { a: b } = require('foo.js');
      `
    }
  ],
  invalid: [
    {
      code:
        "const a = require('foo.js');\n" +
        "const A = require('bar.js');",
      output: null,
      errors: [expectedError]
    },
    {
      code:
        "const a = require('foo');\n" +
        "require('muu');",
      output: null,
      errors: [{
        message: "Expected 'none' syntax before 'single' syntax.",
        type: 'CallExpression'
      }]
    },
    {
      code:
        "const b = require('foo.js');\n" +
        "const a = require('bar.js');",
      output: null,
      errors: [expectedError]
    },
    {
      code:
        "const {b, c} = require('foo.js');\n" +
        "const {a, d} = require('bar.js');",
      output: null,
      errors: [expectedError]
    },
    {
      code:
        "const a = require('foo.js');\n" +
        "const {b, c} = require('bar.js');",
      output: null,
      errors: [{
        message: "Expected 'multiple' syntax before 'single' syntax.",
        type: 'VariableDeclaration'
      }]
    },
    {
      code: "const {b, a, d, c} = require('foo.js');",
      output: "const {a, b, c, d} = require('foo.js');",
      errors: [{
        message: "Property 'a' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: `
        const { a: b } = require('foo.js');
        const { b: a } = require('foo.js');
      `,
      output: `
        const { a: b } = require('foo.js');
        const { b: a } = require('foo.js');
      `,
      errors: [expectedError]
    },
    {
      code:
        "const {b, a, d, c} = require('foo.js');\n" +
        "const {e, f, g, h} = require('bar.js');",
      output:
        "const {a, b, c, d} = require('foo.js');\n" +
        "const {e, f, g, h} = require('bar.js');",
      options: [{ ignoreDeclarationSort: true }],
      errors: [{
        message: "Property 'a' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: "const {a, B, c, D} = require('foo.js');",
      output: "const {B, D, a, c} = require('foo.js');",
      errors: [{
        message: "Property 'B' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: "const {zzzzz, /* comment */ aaaaa} = require('foo.js');",
      output: null, // not fixed due to comment
      errors: [{
        message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: "const {zzzzz /* comment */, aaaaa} = require('foo.js');",
      output: null, // not fixed due to comment
      errors: [{
        message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: "const {/* comment */ zzzzz, aaaaa} = require('foo.js');",
      output: null, // not fixed due to comment
      errors: [{
        message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: "const {zzzzz, aaaaa /* comment */} = require('foo.js');",
      output: null, // not fixed due to comment
      errors: [{
        message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    },
    {
      code: `
      const bar = require('bar');
      const foo = require('foo');
      function fn() { let baz = require('baz'); }`,
      output: `
      const bar = require('bar');
      const foo = require('foo');
      function fn() { let baz = require('baz'); }`,
      errors: []
    },
    {
      code: `
        const bar = require('bar');
        const foo = require('foo');
        if (foo) { let baz = require('baz'); }`,
      output: `
        const bar = require('bar');
        const foo = require('foo');
        if (foo) { let baz = require('baz'); }`,
      errors: []
    },
    {
      code: `
          const {
            boop,
            foo,
            zoo,
            qux,
            bar,
            beep
          } = require('foo.js');
        `,
      output: `
          const {
            bar,
            beep,
            boop,
            foo,
            qux,
            zoo
          } = require('foo.js');
        `,
      errors: [{
        message: "Property 'qux' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    }
  ]
});
