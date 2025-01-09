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
      bool bar = false;
      bool result;
      
      result = foo == true;
      bar = bar != false;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should detect chained boolean comparisons', () => {
    const code = funcWith(`
      bool foo = true;
      bool bar = false;
      bool baz;
      baz = foo == true == bar;  // 1 error
      baz = (foo == true) && (bar != false);  // 2 errors
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 3)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })
  it('should detect boolean comparisons in complex expressions', () => {
    const code = funcWith(`
      bool foo = true;
      bool bar = false;
      uint x = 5;
      if ((x > 10 && foo == true) || (x < 0 && bar != false)) {
        foo = !bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should detect boolean comparisons in ternary expressions', () => {
    const code = funcWith(`
      bool foo = true;
      bool bar;
      bar = foo == true ? true : false;
      bar = foo != false ? !bar : bar == true;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 3)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should handle boolean literals in assignments', () => {
    const code = funcWith(`
      bool foo;
      bool bar = foo == true;
      bar = true == foo;
      bar = foo != false;
      bar = false != foo;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 4)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('should not raise errors for boolean operations without comparisons', () => {
    const code = funcWith(`
      bool foo = true;
      bool bar = false;
      bool baz;
      baz = foo && bar;
      baz = foo || bar;
      baz = !foo;
      foo = bar && true;
      bar = false || baz;
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertNoErrors(report)
  })

  it('should not identify non-boolean literals as boolean', () => {
    const code = funcWith(`
      uint x = 5;
      string memory str = "true";
      bool foo;
      
      foo = x == 5;      
      foo = str == "true"; 
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertNoErrors(report)
  })

  it('should confirm numeric literal is not treated as a boolean literal', () => {
    const code = funcWith(`
      uint x = 5;
      // NOT a BooleanLiteral on either side, so isLiteralBool(...) should return false for both operands.
      if (x == 10) {
        x = x + 1;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })
})
