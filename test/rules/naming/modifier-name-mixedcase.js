const assert = require('assert')
const linter = require('../../../lib/index')
const contractWith = require('../../common/contract-builder').contractWith

describe('Linter - modifier-name-mixedcase', () => {
  ;['snake_case', 'twoTrailingUnderscores__', 'threeTrailingUnderscores___'].forEach((name) => {
    it(`should raise modifier name error on ${name}`, () => {
      const code = contractWith(`modifier ${name}(address a) { }`)

      const report = linter.processStr(code, {
        rules: { 'modifier-name-mixedcase': 'error' },
      })

      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('mixedCase'))
    })
  })
  ;[
    'mixedCase',
    '_leadingUnderscore',
    '__twoLeadingUnderscores',
    '___threeLeadingUnderscores',
    'trailingUnderscore_',
  ].forEach((name) => {
    it(`should not raise modifier name error on ${name}`, () => {
      const code = contractWith(`modifier ${name}(address a) { }`)

      const report = linter.processStr(code, {
        rules: { 'modifier-name-mixedcase': 'error' },
      })

      assert.equal(report.errorCount, 0)
    })
  })

  describe('with $ character', () => {
    const WITH_$ = {
      'starting with $': contractWith('modifier $ownedBy(address a) { }'),
      'containing a $': contractWith('modifier owned$By(address a) { }'),
      'ending with $': contractWith('modifier ownedBy$(address a) { }'),
      'only with $': contractWith('modifier $(uint a) { }'),
    }

    for (const [key, code] of Object.entries(WITH_$)) {
      it(`should not raise func name error for Modifiers ${key}`, () => {
        const report = linter.processStr(code, {
          rules: { 'modifier-name-mixedcase': 'error' },
        })

        assert.equal(report.errorCount, 0)
      })
    }
  })
})
