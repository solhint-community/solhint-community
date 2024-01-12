/*
 * WARNING: This file is autogenerated using the scripts/generate-rulesets.js
 * script. Do not edit manually.
 */

module.exports = Object.freeze({
  rules: {
    'custom-errors': 'error',
    'explicit-types': ['warn'],
    'interface-starts-with-i': 'error',
    'max-states-count': ['warn', 15],
    'no-console': 'error',
    'no-empty-blocks': 'warn',
    'no-global-import': 'warn',
    'no-unused-import': 'warn',
    'no-unused-vars': 'warn',
    'payable-fallback': 'warn',
    'reason-string': [
      'warn',
      {
        maxLength: 32,
      },
    ],
    quotes: ['error', 'double'],
    'const-name-snakecase': 'warn',
    'definition-name-capwords': 'error',
    'func-name-mixedcase': 'warn',
    'modifier-name-mixedcase': 'warn',
    'named-return-values': 'warn',
    'use-forbidden-name': 'warn',
    'var-name-mixedcase': 'warn',
    'imports-on-top': 'warn',
    'visibility-modifier-order': 'warn',
    'avoid-call-value': 'warn',
    'avoid-low-level-calls': 'warn',
    'avoid-sha3': 'warn',
    'avoid-suicide': 'warn',
    'avoid-throw': 'warn',
    'avoid-tx-origin': 'warn',
    'check-send-result': 'warn',
    'compiler-version': ['error', '^0.8.14'],
    'func-visibility': [
      'warn',
      {
        ignoreConstructors: false,
      },
    ],
    'multiple-sends': 'warn',
    'no-complex-fallback': 'warn',
    'no-inline-assembly': 'warn',
    'not-rely-on-block-hash': 'warn',
    reentrancy: 'warn',
    'state-visibility': 'warn',
  },
})
