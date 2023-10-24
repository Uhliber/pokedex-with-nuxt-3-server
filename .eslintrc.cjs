/* eslint-env node */
module.exports = {
  'root': true,
  'parser': 'vue-eslint-parser',
  'extends': [
    // add more generic rulesets here, such as:
    'eslint:recommended',
    // 'plugin:vue/vue3-recommended',
    // 'plugin:vue/vue3-essential', // This option doesn't impose formatting rules
    'plugin:vue/vue3-strongly-recommended', // This option imposes formatting rules on your code to improve readability 
  ],
  'rules': {
    'indent': [
      'error',
      2,
      {
        'ignoredNodes': ['TemplateLiteral'],
        'SwitchCase': 1,
      },
    ],
    'linebreak-style': [
      'error',
      'unix',
    ],
    'quotes': [
      'error',
      'single',
    ],
    'semi': [
      'error',
      'always',
    ],
    'prefer-const': ['error', {
      'destructuring': 'any',
      'ignoreReadBeforeAssign': false,
    }],
    'key-spacing': ['error', {
      'afterColon': true,
    }],
    'object-curly-spacing': ['error', 'always'],
    'keyword-spacing': ['error', {
      'before': true,
      'after': true,
    }],
    'curly': ['error', 'multi-line', 'consistent'],
    'brace-style': 'error',
    'space-before-function-paren': ['error', 'always'],
    'space-before-blocks': ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    'nonblock-statement-body-position': ['error', 'below'],
    'vue/html-closing-bracket-newline': 'error',
    'vue/html-closing-bracket-spacing': 'error',
    'vue/prop-name-casing': 'error',
    'vue/multi-word-component-names': 0,
    'no-undef': 'off',
  },
};
  
