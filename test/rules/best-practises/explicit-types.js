const linter = require('../../../lib/index')
const contractWith = require('../../common/contract-builder').contractWith
const {
  assertErrorCount,
  assertNoErrors,
  assertErrorMessage,
  assertLineNumber,
} = require('../../common/asserts')
const FIXTURE = require('../../fixtures/best-practises/explicit-types')

describe('Linter - explicit-types rule', () => {
  it('should ignore configuration', () => {
    const code = contractWith('uint public constant SNAKE_CASE = 1; uint public foo; ')

    const report = linter.processStr(code, {
      rules: { 'explicit-types': ['error', 'IMPLICIT'] },
    })
    assertErrorCount(report, 2)
  })

  for (const key in FIXTURE) {
    it(`should raise error for ${key} when using an implicit type`, () => {
      const { implicit } = FIXTURE[key]
      const report = linter.processStr(contractWith(implicit), {
        rules: { 'explicit-types': 'error' },
      })
      assertErrorCount(report, 1)
      assertErrorMessage(report, 'prefer use of explicit type')
    })

    it(`should NOT raise error for ${key} when using an explicit type`, () => {
      const { explicit } = FIXTURE[key]
      const report = linter.processStr(contractWith(explicit), {
        rules: { 'explicit-types': 'error' },
      })
      assertNoErrors(report)
    })
  }
})
