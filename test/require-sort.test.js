'use strict';

const rule = require('../index.js').rules['require-sort'];
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2020, sourceType: 'script' } });

const expectedError = {
  message: 'Requires should be sorted alphabetically.',
  type: 'VariableDeclaration'
};
const ignoreCaseArgs = [{ ignoreCase: true }];

const test = ({ only = false, ...settings }) => {
  return {
    settings,
    only
  };
};

Object.defineProperty(test, 'only', {
  value: settings => test({ ...settings, only: true })
});

const getTests = (testCases = [], allSuites = true) => {
  if (!allSuites) return [];
  if (testCases.some(({ only }) => only === true)) {
    return testCases.reduce((acc, test) => {
      if (test.only === true) acc.push(test.settings);
      return acc;
    }, []);
  }
  return testCases.map(({ settings }) => ({ ...settings }));
};

ruleTester.run('require-sort', rule, {
  valid: getTests([
    // Sorts only top level
    test({
      code: `
        const a = require('bar');
        const b = require('foo');

        if (bar) {
          const c = require('baz');
        }
      `
    }),
    test({
      code: `
        require('baz');
        const a = require('bar');
        const { b: c = {} } = require('foo');
        const d = 'foobar';
      `
    }),
    test({
      code: `
        const a = require('bar');
        const b = require('foo');

        if (bar) {
          const c = require('baz');
        }
      `
    }),
    // ignoreCase
    test({
      code: `
        const A = require('bar');
        const a = require('foo');
      `
    }),
    test({
      code: `
        const { a } = require('foo');
        const A = require('bar');
      `,
      options: ignoreCaseArgs
    }),
    // propertySyntaxSortOrder
    test({
      code: `
        require('foo');
        const { b, c } = require('baz');
        const A = require('bar');
      `
    }),
    test({
      code: `
        require('foo');
        const A = require('bar');
        const { b, c } = require('baz');
        require('foo', 'bar');
        if (true) {
          require('baz');
        }
      `,
      options: [{
        propertySyntaxSortOrder: ['none', 'single', 'multiple']
      }]
    }),
    test({
      code: `
        const A = require('bar');
        const { b, c } = require('baz');
        require('foo');
      `,
      options: [{
        propertySyntaxSortOrder: ['single', 'multiple', 'none']
      }]
    }),
    test({
      code: `
        const { b, c } = require('baz');
        require('foo');
        const A = require('bar');
      `,
      options: [{
        propertySyntaxSortOrder: ['multiple', 'none', 'single']
      }]
    }),
    // ignoreDeclarationSort
    test({
      code: `
        const A = require('bar');
        const a = require('foo');
      `
    }),
    test({
      code: `
        const z = require('bar');
        const a = require('foo');
      `,
      options: [{
        ignoreDeclarationSort: true
      }]
    }),
    // ignorePropertySort
    test({
      code: `
        const { a, b, c } = require('bar');
      `
    }),
    test({
      code: `
        const { b, c, a } = require('bar');
      `,
      options: [{
        ignorePropertySort: true
      }]
    })
  ]),
  invalid: getTests([
    // ignoreCase
    test({
      code: `
        require('baz');
        const a = require('foo');
        const A = require('bar');
      `,
      output: null,
      errors: [expectedError]
    }),
    test({
      code: `
        require('foo');
        require('bar');
        const a = require('foo');
        const A = require('bar');
      `,
      output: null,
      errors: [
        { ...expectedError, type: 'CallExpression' },
        expectedError
      ]
    }),
    // propertySyntaxSortOrder
    test({
      code: `
        require('foo');
        const A = require('bar');
        const { Ba } = require('bar');
        const { b, c } = require('baz');
      `,
      options: [{
        propertySyntaxSortOrder: ['none', 'multiple', 'single'],
        ignoreCase: true
      }],
      errors: [{
        message: "Expected 'multiple' syntax before 'single' syntax.",
        type: 'VariableDeclaration'
      }]
    }),
    test({
      code: `
        const A = require('bar');
        require('foo');
        const { b, c } = require('baz');
      `,
      options: [{
        propertySyntaxSortOrder: ['none', 'multiple', 'single']
      }],
      errors: [{
        message: "Expected 'none' syntax before 'single' syntax.",
        type: 'CallExpression'
      }]
    }),
    // property order
    test({
      code: `
        const { b, a, d, c } = require('foo');
      `,
      output: `
        const { a, b, c, d } = require('foo');
      `,
      errors: [{
        message: "Property 'a' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    }),
    // property order with assignment
    test({
      code: `
        const { b, a = {}, d, c } = require('foo');
      `,
      output: `
        const { a = {}, b, c, d } = require('foo');
      `,
      errors: [{
        message: "Property 'a' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    }),
    // property order with aliases
    test({
      code: `
        const { b: z, c: g, d: e } = require('foo');
      `,
      output: `
        const { d: e, c: g, b: z } = require('foo');
      `,
      errors: [{
        message: "Property 'g' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    }),
    test({
      code: `
        const {zzzzz, /* comment */ aaaaa} = require('foo');
      `,
      output: null, // not fixed due to comment
      errors: [{
        message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
        type: 'Property'
      }]
    })
  ])
});

// ruleTester.run('require-sort', rule, {
//   valid: [
//     {
//       code:
//         "const A = require('bar.js');\n" +
//         "const {b, c} = require('foo.js');",
//       options: [{
//         propertySyntaxSortOrder: ['none', 'single', 'multiple']
//       }]
//     },
//     {
//       code:
//         "const a = require('foo.js');\n" +
//         "const B = require('bar.js');",
//       options: ignoreCaseArgs
//     },
//     {
//       code:
//         "const a = require('foo.js');\n" +
//         "const B = require('bar.js');",
//       options: [{
//         ignoreDeclarationSort: true
//       }]
//     },
//     {
//       code: "const {b, A, C, d} = require('foo.js');",
//       options: [{
//         ignorePropertySort: true
//       }]
//     },
//     {
//       code: "const {B, a, C, d} = require('foo.js');",
//       options: [{
//         ignorePropertySort: true
//       }]
//     },
//     {
//       code: "const {a, B, c, D} = require('foo.js');",
//       options: ignoreCaseArgs
//     },
//     {
//       code:
//         "require('bar.js');\n" +
//         "const {b, c} = require('foo.js');",
//       options: [{
//         propertySyntaxSortOrder: ['none', 'multiple', 'single']
//       }]
//     },
//     {
//       code: `
//         const { b: a } = require('foo.js');
//         const { a: b } = require('foo.js');
//       `
//     },
//     {
//       code: `
//         const { a: b = {} } = require('foo');
//         const c = require('bar');
//         const d = require('baz');
//         const { e } = require('foobar');
//       `,
//       options: ignoreCaseArgs
//     }
//   ],
//   invalid: [
//     {
//       code:
//         "const a = require('foo.js');\n" +
//         "const A = require('bar.js');",
//       output: null,
//       errors: [expectedError]
//     },
//     {
//       code: `
//         const { a: z = {} } = require('foo');
//         const c = require('bar');
//         const d = require('baz');
//         const { e } = require('foobar');
//       `,
//       output: null,
//       errors: [expectedError]
//     },
//     {
//       code:
//         "const a = require('foo');\n" +
//         "require('muu');",
//       output: null,
//       errors: [{
//         message: "Expected 'none' syntax before 'single' syntax.",
//         type: 'CallExpression'
//       }]
//     },
//     {
//       code:
//         "const b = require('foo.js');\n" +
//         "const a = require('bar.js');",
//       output: null,
//       errors: [expectedError]
//     },
//     {
//       code:
//         "const {b, c} = require('foo.js');\n" +
//         "const {a, d} = require('bar.js');",
//       output: null,
//       errors: [expectedError]
//     },
//     {
//       code:
//         "const a = require('foo.js');\n" +
//         "const {b, c} = require('bar.js');",
//       output: null,
//       errors: [{
//         message: "Expected 'multiple' syntax before 'single' syntax.",
//         type: 'VariableDeclaration'
//       }]
//     },
//     {
//       code: "const {b, a, d, c} = require('foo.js');",
//       output: "const {a, b, c, d} = require('foo.js');",
//       errors: [{
//         message: "Property 'a' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {b, d: a, c} = require('foo.js');",
//       output: "const {d: a, b, c} = require('foo.js');",
//       errors: [{
//         message: "Property 'a' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {b, d: a = {}, c} = require('foo.js');",
//       output: "const {d: a = {}, b, c} = require('foo.js');",
//       errors: [{
//         message: "Property 'a' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: `
//         const { a: b } = require('foo.js');
//         const { b: a } = require('foo.js');
//       `,
//       output: `
//         const { a: b } = require('foo.js');
//         const { b: a } = require('foo.js');
//       `,
//       errors: [expectedError]
//     },
//     {
//       code:
//         "const {b, a, d, c} = require('foo.js');\n" +
//         "const {e, f, g, h} = require('bar.js');",
//       output:
//         "const {a, b, c, d} = require('foo.js');\n" +
//         "const {e, f, g, h} = require('bar.js');",
//       options: [{ ignoreDeclarationSort: true }],
//       errors: [{
//         message: "Property 'a' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {a, B, c, D} = require('foo.js');",
//       output: "const {B, D, a, c} = require('foo.js');",
//       errors: [{
//         message: "Property 'B' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {zzzzz, /* comment */ aaaaa} = require('foo.js');",
//       output: null, // not fixed due to comment
//       errors: [{
//         message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {zzzzz /* comment */, aaaaa} = require('foo.js');",
//       output: null, // not fixed due to comment
//       errors: [{
//         message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {/* comment */ zzzzz, aaaaa} = require('foo.js');",
//       output: null, // not fixed due to comment
//       errors: [{
//         message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: "const {zzzzz, aaaaa /* comment */} = require('foo.js');",
//       output: null, // not fixed due to comment
//       errors: [{
//         message: "Property 'aaaaa' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     },
//     {
//       code: `
//       const bar = require('bar');
//       const foo = require('foo');
//       function fn() { let baz = require('baz'); }`,
//       output: `
//       const bar = require('bar');
//       const foo = require('foo');
//       function fn() { let baz = require('baz'); }`,
//       errors: []
//     },
//     {
//       code: `
//         const bar = require('bar');
//         const foo = require('foo');
//         if (foo) { let baz = require('baz'); }`,
//       output: `
//         const bar = require('bar');
//         const foo = require('foo');
//         if (foo) { let baz = require('baz'); }`,
//       errors: []
//     },
//     {
//       code: `
//           const {
//             boop,
//             foo,
//             zoo,
//             qux,
//             bar,
//             beep
//           } = require('foo.js');
//         `,
//       output: `
//           const {
//             bar,
//             beep,
//             boop,
//             foo,
//             qux,
//             zoo
//           } = require('foo.js');
//         `,
//       errors: [{
//         message: "Property 'qux' of the require declaration should be sorted alphabetically.",
//         type: 'Property'
//       }]
//     }
//   ]
// });
