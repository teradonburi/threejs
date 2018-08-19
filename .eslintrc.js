module.exports = {
  'parser': 'babel-eslint',
  'env': {
    'browser': true,
    'es6': true,
    'node': true,
  },
  'extends': ['eslint:recommended'],
  'parserOptions': {
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true
    },
    'sourceType': 'module'
  },
  'globals': {
  },
  'rules': {
    'indent': 'off',
    'indent-legacy': [
      'error',
      2,
      { 'SwitchCase': 1 }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'never'
    ],
    'comma-dangle': [
      'error',
      'always-multiline'
    ],
    'no-trailing-spaces': [
      'error'
    ],
    'keyword-spacing': [
      'error',
      { 'before': true, 'after': true }
    ],
    'key-spacing': [
      'error',
      { 'mode': 'minimum' }
    ],
    'comma-spacing': [
      'error',
      { 'before': false, 'after': true }
    ],
    'space-before-blocks': [
      'error'
    ],
    'arrow-spacing': [
      'error',
      { "before": true, "after": true }
    ],
    'space-in-parens': [
      'error',
      'never'
    ],
    'dot-notation': [
      'error'
    ],
    'brace-style': [
      'error',
      '1tbs'
    ],
    'no-else-return': [
      'error'
    ],
    'no-unused-vars': [
      'warn',
      { 'ignoreRestSiblings': true }
    ],
    'no-console': 'off',
    'no-useless-escape': 'off',
  }
}
