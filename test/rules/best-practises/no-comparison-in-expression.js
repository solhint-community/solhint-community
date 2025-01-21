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

  it('should raise no error for passing a comparison as a function argument', () => {
    const code = contractWith(`
      function anotherFunc(bool value) public {}
      function doSomething(uint foo, uint bar) public {
        anotherFunc(foo == bar);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for returning a comparison instead of discarding it', () => {
    const code = contractWith(`
      function checkEquality(uint foo, uint bar) public returns (bool) {
        return foo == bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise an error for standalone comparison in a for loop body', () => {
    const code = contractWith(`
      function loopComparison() public {
        for (uint i = 0; i < 5; i++) i == 3;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })

  it('should raise an error for standalone comparison inside a do-while block, but not for the do-while condition', () => {
    const code = contractWith(`
      function doWhileCheck(uint foo, uint bar) public {
        do {
          foo == bar;
        } while (foo < bar);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })

  it('should raise no error for ternary operation using comparison', () => {
    const code = contractWith(`
      function ternaryCheck(uint foo, uint bar) public returns (uint) {
        return foo == bar ? foo : bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for comparison in emit statement', () => {
    const code = contractWith(`
      event ComparisonResult(bool result);
      function emitCheck(uint foo, uint bar) public {
        emit ComparisonResult(foo == bar);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for comparison in modifier condition', () => {
    const code = contractWith(`
      modifier whenEqual(uint a, uint b) {
        require(a == b);
        _;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise no error for comparison in assembly block', () => {
    const code = contractWith(`
      function assemblyCheck(uint foo, uint bar) public {
        assembly {
          if eq(foo, bar) { revert(0, 0) }
        }
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('should raise an error for multiple comparisons in expression statement', () => {
    const code = contractWith(`
      function multipleComparisons(uint foo, uint bar, uint baz) public {
        (foo == bar) != (bar == baz);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid using a comparison')
  })

  it('ensures linter does not crash on empty function bodies', () => {
    const code = contractWith(`
      function emptyStatement() public {
        
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('ensures linter does not incorrectly flag valid unary operations', () => {
    const code = contractWith(`
      function unaryOperation(int x) public {
        int y = -x;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('ensures valid arithmetic operations are not mistaken for comparisons', () => {
    const code = contractWith(`
      function addSomething(uint foo, uint bar) public {
        uint result = foo + bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })

  it('allows comparisons when initializing state variables since they have a clear purpose', () => {
    const code = contractWith(`
      uint256 public foo;
      uint256 public bar;
      bool public isEqual = foo == bar;
    `)
    const report = linter.processStr(code, { rules: { 'no-comparison-in-expression': 'error' } })
    assertNoErrors(report)
  })
})
