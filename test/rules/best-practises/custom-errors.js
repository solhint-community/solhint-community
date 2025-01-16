const {
  assertNoWarnings,
  assertNoErrors,
  assertErrorMessage,
  assertErrorCount,
} = require('../../common/asserts')
const { configGetter } = require('../../../lib/config/config-file')
const linter = require('../../../lib/index')
const { funcWith, contractWith } = require('../../common/contract-builder')

describe('Linter - custom-errors', () => {
  it('should raise error for an empty revert', () => {
    const code = funcWith(`revert();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use custom errors instead of empty revert statements')
  })

  it('should raise error for a revert statement with a string message', () => {
    const code = funcWith(`revert("Insufficient funds");`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use custom errors instead of string messages in revert')
  })

  it('should NOT raise error for an empty custom error', () => {
    const code = funcWith(`revert ErrorFunction();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should NOT raise error for a custom error with a string argument', () => {
    const code = funcWith(`revert ErrorFunction({ msg: "Insufficient funds msg" });`, '0.8.5')
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
    assertErrorMessage(
      report,
      'The second argument of require should be a custom error. Avoid using string literals or complex expressions'
    )
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
    assertErrorMessage(
      report,
      0,
      'The second argument of require should be a custom error. Avoid using string literals or complex expressions'
    )
    assertErrorMessage(report, 1, 'Use custom errors instead of string messages in revert')
  })

  describe('pragma directive', function () {
    it('should emit error on no pragma directive', function () {
      const code = `
        contract A{
          function foo() external {
            revert("Insufficient funds");
          }
        }
      `
      const report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use custom errors instead of string messages in revert')
    })

    it('should NOT emit error on exact match pragma directive for a previous version', function () {
      const code = contractWith(
        `
          function foo() external {
            revert("Insufficient funds");
          }
        `,
        '0.8.3'
      )
      const report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report, 0)
    })

    it('should emit error on range match allowing 0.8.4', function () {
      let code = contractWith(
        `
          function foo() external {
            revert("Insufficient funds");
          }
        `,
        '^0.8.0'
      )
      const report1 = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report1, 1)
      assertErrorMessage(report1, 'Use custom errors instead of string messages in revert')

      code = contractWith(
        `
          function foo() external {
            revert("Insufficient funds");
          }
        `,
        '>=0.8.19 <0.9.0'
      )
      const report2 = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report2, 1)
      assertErrorMessage(report2, 'Use custom errors instead of string messages in revert')
    })

    it('should NOT emit error on range match disallowing 0.8.4 or later', function () {
      let code = contractWith(
        `
          function foo() external {
            revert("Insufficient funds");
          }
        `,
        '<0.8.4'
      )
      const report1 = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report1, 0)

      code = contractWith(
        `
          function foo() external {
            revert("Insufficient funds");
          }
        `,
        '>=0.6.0 <0.7.0'
      )
      const report2 = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })
      assertErrorCount(report2, 0)
    })
  })

  it('should NOT raise error for require with custom error function call as second argument', () => {
    const code = contractWith(
      `
        function test() external {
          require(msg.sender != address(0), ZeroAddressError());
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require with a non-function-call second argument', () => {
    const code = contractWith(
      `
        function test() external {
          require(msg.sender != address(0), "Invalid sender");
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(
      report,
      'The second argument of require should be a custom error. Avoid using string literals or complex expressions'
    )
  })

  it('should raise error for require with no second argument', () => {
    const code = funcWith(
      `
      require(msg.sender != address(0));
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Provide a custom error as the second argument to require')
  })

  it('should NOT raise error for require with custom error constructor call with expressions', () => {
    const code = contractWith(
      `
        function test(uint x) external {
          require(msg.sender != address(0), CustomError(x + 1));
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require with a ternary operator in its second parameter which resolves to a string', () => {
    const code = contractWith(
      `
        function test(uint x) external {
          require(msg.sender != address(0), x > 5 ? "Too high" : "Too low");
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(
      report,
      'The second argument of require should be a custom error. Avoid using string literals or complex expressions'
    )
  })

  it('should not raise an error when require uses a custom error with structured arguments', () => {
    const code = contractWith(
      `
        function test(uint x, string memory reason) external {
          require(
            msg.sender != address(0), 
            ComplexError({
              code: x > 5 ? 1 : 2,
              message: string.concat("Error: ", reason)
            })
          );
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should not raise an error when require uses a non-custom error as the second argument', () => {
    const code = contractWith(
      `
        function returnsBool() public pure returns (bool) {
          return false;
        }
        function test() external {
          require(msg.sender != address(0), returnsBool());
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle deeply nested error constructors', () => {
    const code = contractWith(
      `
        function test() external {
          revert Lib.Sub.DeepError({
            data: NestedStruct({
              value: 100,
              info: DetailedInfo({
                message: "test",
                code: 1
              })
            })
          });
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle errors from libraries', () => {
    const code = `
      pragma solidity 0.8.5;
      import "./ErrorLib.sol";
      
      contract A {
        using ErrorLib for *;
        
        function test() external {
          require(condition, ErrorLib.ValidationError());
          revert ErrorLib.BusinessError();
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle string concatenation in errors', () => {
    const code = contractWith(`
        function test(string memory reason) external {
          revert CustomError(string.concat("Error: ", reason));
          require(condition, DetailedError({
            message: string.concat("Failed: ", reason, " at: ", time)
          }));
        }
    `)
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should NOT raise error for custom error in require', () => {
    // This will be rejected by the compiler at a later stage
    const code = `
      pragma solidity 0.8.5;
      abstract contract Base {
        error BaseError(string message);
      }
      
      contract Child is Base {
        function test() external {
          revert BaseError("from child");
          require(condition, BaseError("another error"));
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should NOT raise error for assembly reverts because the rule ignores this case', () => {
    const code = contractWith(
      `
        error CustomError(string message);
    
        function revertWithLowLevelError() external pure {
          bytes memory errorData = abi.encodeWithSelector(CustomError.selector, "This is a custom error");
          assembly {
            let dataSize := mload(errorData) 
            let dataPointer := add(errorData, 0x20)
            revert(dataPointer, dataSize)
          }
        }
      `,
      '0.8.5'
    )

    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for a revert expression with its first param as a string', () => {
    const code = contractWith(
      `
        function test() external {
          if (checkCertainCondition()) {
            revert("Condition check failed");
          }
        }
      `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use custom errors instead of string messages in revert')
  })

  it('should NOT report errors on incorrect revert syntax that the compiler will catch', () => {
    const code = contractWith(
      `
      error CustomError();
      function test() external {
        // The compiler will catch this incorrect use of revert
        // The correct syntax would be "revert CustomError();"
        revert(CustomError());
      }
    `,
      '0.8.5'
    )

    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })
})
