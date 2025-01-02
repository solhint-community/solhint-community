const linter = require('../../../lib/index')
const { assertErrorCount, assertNoErrors, assertErrorMessage } = require('../../common/asserts')
const { contractWith, funcWith } = require('../../common/contract-builder')

describe('Linter - no-comparison-in-expression', () => {
  it('should raise an error for comparison in standalone statement', () => {
    const code = contractWith(`
      function doSomething(uint foo, uint bar) public {
        foo == bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })

  it('should raise an error for inequality in standalone statement', () => {
    const code = funcWith(`
      uint x = 42;
      x != 10;
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })

  it('should raise no error for comparison in an if statement', () => {
    const code = contractWith(`
      function checkSomething(uint foo, uint bar) public {
        if (foo == bar) {
          // ...
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for require with comparison', () => {
    const code = contractWith(`
      function requireCheck(uint foo) public {
        require(foo != 0, "foo must not be zero");
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for assignment statements', () => {
    const code = contractWith(`
      function setSomething(uint foo, uint bar) public {
        foo = bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for other binary operators in expression statements', () => {
    const code = contractWith(`
      function addSomething(uint foo, uint bar) public {
        foo + bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for while loops with comparison', () => {
    const code = contractWith(`
      function loopCheck(uint foo, uint bar) public {
        while (foo != bar) {
          foo++;
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error if statement uses logical operators but not in expression statement', () => {
    const code = contractWith(`
      function logicCheck(uint foo, uint bar) public {
        if ((foo == bar) && (bar != 0)) {
          // ...
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise an error for complex expression statement with a direct comparison as the root', () => {
    const code = contractWith(`
      function complexCheck(uint foo, uint bar) public {
        (foo + 1) == (bar - 2);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })
})
