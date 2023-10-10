const assert = require('assert')
const linter = require('../../../lib/index')
const contractWith = require('../../common/contract-builder').contractWith

describe('immutable-name-snakecase', () => {
  it('should not raise error for non immutable variables if rule is off', () => {
    const code = contractWith('uint32 private immutable D;')

    const report = linter.processStr(code, {
      rules: {
        'immutable-name-snakecase': 'off',
        'var-name-mixedcase': 'error',
        'const-name-snakecase': 'error',
      },
    })

    assert.equal(report.errorCount, 0)
  })

  it('should raise error when variable is in camelCase', () => {
    const code = contractWith('uint32 private immutable camelCase;')

    const report = linter.processStr(code, {
      rules: { 'immutable-name-snakecase': 'error' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(
      report.messages[0].message.includes(
        'Immutable variables name should be capitalized SNAKE_CASE'
      )
    )
  })

  it('should raise error when variable is in lowercase_snakecase', () => {
    const code = contractWith('uint32 private immutable snake_case;')

    const report = linter.processStr(code, {
      rules: { 'immutable-name-snakecase': 'error' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(
      report.messages[0].message.includes(
        'Immutable variables name should be capitalized SNAKE_CASE'
      )
    )
  })

  describe('Immutable variable with $ character as SNAKE_CASE', () => {
    const WITH_$ = {
      'starting with $': contractWith('uint32 immutable private $_D;'),
      'starting with $D': contractWith('uint32 immutable private $D;'),
      'containing a $': contractWith('uint32 immutable private TEST_WITH_$_CONTAINED;'),
      'ending with $': contractWith('uint32 immutable private TEST_WITH_ENDING_$;'),
      'ending with D$': contractWith('uint32 immutable private TEST_WITH_ENDING_D$;'),
      'only with $': contractWith('uint32 immutable private $;'),
    }

    for (const [key, code] of Object.entries(WITH_$)) {
      it(`should not raise immutable error for variables ${key}`, () => {
        const report = linter.processStr(code, {
          rules: { 'immutable-name-snakecase': 'error' },
        })

        assert.equal(report.errorCount, 0)
      })
    }
  })
})
