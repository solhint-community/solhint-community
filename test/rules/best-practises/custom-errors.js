const {
  assertNoWarnings,
  assertNoErrors,
  assertErrorMessage,
  assertErrorCount,
} = require('../../common/asserts')
const { configGetter } = require('../../../lib/config/config-file')
const linter = require('../../../lib/index')
const { funcWith } = require('../../common/contract-builder')

describe('Linter - custom-errors', () => {
  it('should raise error for revert()', () => {
    const code = funcWith(`revert();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
  })

  it('should raise error for revert([string])', () => {
    const code = funcWith(`revert("Insufficent funds");`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
  })

  it('should NOT raise error for revert ErrorFunction()', () => {
    const code = funcWith(`revert ErrorFunction();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should NOT raise error for revert ErrorFunction() with arguments', () => {
    const code = funcWith(`revert ErrorFunction({ msg: "Insufficent funds msg" });`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require', () => {
    const code = funcWith(
      `require(!has(role, account), "Roles: account already has role");
        role.bearer[account] = true;role.bearer[account] = true;
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of require statement')
  })

  it('should NOT raise error for regular function call', () => {
    const code = funcWith(
      `callOtherFunction();
        role.bearer[account] = true;role.bearer[account] = true;
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should be included in [recommended] config', () => {
    const code = funcWith(
      `require(!has(role, account), "Roles: account already has role");
        revert("RevertMessage");
        revert CustomError();
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { ...configGetter('solhint:recommended').rules, 'compiler-version': 'off' },
    })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 0, 'Use Custom Errors instead of require statements')
    assertErrorMessage(report, 1, 'Use Custom Errors instead of revert statements')
  })

  describe('pragma directive', function () {
    it('should emit error on no pragma directive', function () {
      const code = `
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      const report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
    })

    it('should NOT emit error on exact match pragma directive for a previous version', function () {
      const code = `
        pragma solidity 0.8.3;
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      const report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report, 0)
    })

    it('should emit error on range match allowing 0.8.4', function () {
      let code = `
        pragma solidity ^0.8.0;
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      let report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use Custom Errors instead of revert statement')

      code = `
        pragma solidity >=0.8.19 <0.9.0;
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
    })

    it('should NOT emit error on range match disallowing 0.8.4 or later', function () {
      let code = `
        pragma solidity <0.8.4;
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      let report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report, 0)
      code = `
        pragma solidity >=0.6.0 <0.7.0;
        contract A{
          function foo() external {
            revert("Insufficent funds");
          }
        }
      `
      report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report, 0)
    })
  })

  it('should NOT raise error for require with custom error function call as second argument', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          require(msg.sender != address(0), ZeroAddressError());
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require with a non-function-call second argument', () => {
    // second arg is a numeric literal instead of a function call
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          require(msg.sender != address(0), 123);
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of require statements')
  })

  it('should raise error for require with no second argument', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          require(msg.sender != address(0));
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of require statements')
  })
})
