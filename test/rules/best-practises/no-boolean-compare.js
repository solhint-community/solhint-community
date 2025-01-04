const linter = require('../../../lib/index')
const { assertErrorCount, assertNoErrors, assertErrorMessage } = require('../../common/asserts')
const { contractWith, funcWith } = require('../../common/contract-builder')

describe('Linter - no-boolean-compare', () => {
  it('should raise an error when comparing a variable to true', () => {
    const code = contractWith(`
      function checkFoo(bool foo) public {
        if (foo == true) {
          // do something
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should raise an error when comparing a variable to false', () => {
    const code = funcWith(`
      bool bar = false;
      if (bar != false) {
        bar = true;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should raise no error for normal usage', () => {
    const code = contractWith(`
      function checkFoo(bool foo) public {
        if (foo) {
          // do something
        } else if (!foo) {
          // do something else
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for other comparisons', () => {
    const code = contractWith(`
      function checkValue(uint256 x) public {
        if (x == 5) {
          // allowed
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })

  it('should raise error when comparing true/false on left side', () => {
    const code = funcWith(`
      bool foo = true;
      bool result = true == foo;
      result = false != foo;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should catch boolean comparisons outside if statements', () => {
    const code = funcWith(`
      bool foo = true;
      bool result;
      result = foo == true;
      return bar != false;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
  })

  it('should handle parser version differences for boolean literals', () => {
    const code = funcWith(`
      bool foo;
      // The following should be detected even with different parser versions
      foo = true == bar;
      foo = false != baz;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })
})
