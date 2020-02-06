'use strict';

module.exports = {
  parser: 'babel-eslint',
  env: { es6: true },
  parserOptions: {
    ecmaVersion: 2020
  },
  plugins: ['eslint-plugin'],
  extends: [
    '@extensionengine/eslint-config/base',
    'plugin:eslint-plugin/recommended'
  ]
};
