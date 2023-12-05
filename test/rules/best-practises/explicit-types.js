const assert = require('assert')
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

  it('should report correct line for initializer of a variable declaration', function () {
    const code = `                            // 1
      contract Foo {                          // 2
          function foo() {                    // 3
              uint256 complexThing = uint256( // 4
                  uint(420)                   // 5
              );                              // 6
          }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'explicit-types': 'error' },
    })
    assertErrorCount(report, 1)
    assertLineNumber(report.reports[0], 5)
  })

  for (const key in FIXTURE) {
    it(`should raise error for ${key} when using an implicit type`, () => {
      const { implicit, implicitTypeName, explicitTypeName } = FIXTURE[key]
      const report = linter.processStr(contractWith(implicit), {
        rules: { 'explicit-types': 'error' },
      })
      assertErrorCount(report, 1)
      if (explicitTypeName && implicitTypeName) {
        assertErrorMessage(
          report,
          `prefer use of explicit type ${explicitTypeName} over ${implicitTypeName}`
        )
      } else {
        assertErrorMessage(report, 'prefer use of explicit type')
      }
    })
    it('should replace implicit type with explicit when fixing', function () {
      const { implicit, explicit } = FIXTURE[key]
      const explicitContract = contractWith(explicit)
      const implicitContract = contractWith(implicit)
      const report = linter.processStr(implicitContract, {
        rules: { 'explicit-types': 'error' },
      })
      const { output } = linter.fixStr(implicitContract, report)
      assert(output === explicitContract)
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
