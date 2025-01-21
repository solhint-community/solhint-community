const linter = require('../../../lib/index')
const { assertErrorCount, assertNoErrors, assertErrorMessage } = require('../../common/asserts')
const { contractWith, funcWith } = require('../../common/contract-builder')

describe('Linter - no-boolean-compare', () => {
  it('raises an error when comparing a function parameter to true in Solidity function', () => {
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

  it('raises an error when comparing a state variable to false in Solidity function', () => {
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

  it('raises no error when using boolean in modifier conditions', () => {
    const code = contractWith(`
      modifier whenTrue(bool _condition) {
        require(_condition);
        _;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })

  it('raises error when comparing boolean in require statement', () => {
    const code = contractWith(`
      function checkCondition(bool condition) public {
        require(condition == true, "Invalid condition");
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Avoid comparing boolean expressions to true or false.')
  })

  it('raises no error for numeric comparisons in Solidity', () => {
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

  it('raises no error when emitting events with boolean parameters', () => {
    const code = contractWith(`
      event StatusChanged(bool status);
      
      function updateStatus(bool newStatus) public {
        emit StatusChanged(newStatus);
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })

  it('detects boolean comparisons in Solidity complex expressions', () => {
    const code = funcWith(`
      bool foo = true;
      bool bar = false;
      uint256 balance = 100;
      if ((balance > 50 && foo == true) || (balance == 0 && bar != false)) {
        foo = !bar;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })

    assertErrorCount(report, 2)
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
      uint256 x = 5;
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
      uint256 x = 5;
      if (x == 10) {
        x = x + 1;
      }
    `)
    const report = linter.processStr(code, { rules: { 'no-boolean-compare': 'error' } })
    assertNoErrors(report)
  })
})
