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
      const code = `
        pragma solidity 0.8.3;
        contract A{
          function foo() external {
            revert("Insufficient funds");
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
            revert("Insufficient funds");
          }
        }
      `
      let report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use custom errors instead of string messages in revert')

      code = `
        pragma solidity >=0.8.19 <0.9.0;
        contract A{
          function foo() external {
            revert("Insufficient funds");
          }
        }
      `
      report = linter.processStr(code, {
        rules: { 'custom-errors': 'error' },
      })

      assertErrorCount(report, 1)
      assertErrorMessage(report, 'Use custom errors instead of string messages in revert')
    })

    it('should NOT emit error on range match disallowing 0.8.4 or later', function () {
      let code = `
        pragma solidity <0.8.4;
        contract A{
          function foo() external {
            revert("Insufficient funds");
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
            revert("Insufficient funds");
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
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          require(msg.sender != address(0), "Invalid sender");
        }
      }
    `
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
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test(uint x) external {
          require(msg.sender != address(0), CustomError(x + 1));
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require with a ternary operator in its second parameter which resolves to a string', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test(uint x) external {
          require(msg.sender != address(0), x > 5 ? "Too high" : "Too low");
        }
      }
    `
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
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test(uint x, string memory reason) external {
          require(
            msg.sender != address(0), 
            ComplexError({
              code: x > 5 ? 1 : 2,
              message: string.concat("Error: ", reason)
            })
          );
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should not raise an error when require uses a non-custom error as the second argument', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function returnsBool() public pure returns (bool) {
          return false;
        }
        function test() external {
          require(msg.sender != address(0), returnsBool());
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle deeply nested error constructors', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
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
      }
    `
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
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test(string memory reason) external {
          revert CustomError(string.concat("Error: ", reason));
          require(condition, DetailedError({
            message: string.concat("Failed: ", reason, " at: ", time)
          }));
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle multi-line formatting', () => {
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          require(
            complexCondition(),
            ComplexError({
              code: 123,
              message: "test",
              details: "more info"
            })
          );
          
          revert 
            VeryDetailedError
            ({
              timestamp: block.timestamp,
              caller: msg.sender,
              value: msg.value
            });
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle imported custom errors', () => {
    const code = `
      pragma solidity 0.8.5;
      import { ValidationError, BusinessError } from "./Errors.sol";
      import * as Errors from "./MoreErrors.sol";
      
      contract A {
        function test() external {
          revert ValidationError();
          require(condition, Errors.SystemError());
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should handle inherited custom errors', () => {
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

  it('should handle errors defined in interfaces', () => {
    const code = `
      pragma solidity 0.8.5;
      interface IErrors {
        error InterfaceError(uint code);
      }
      
      contract Implementation is IErrors {
        function test() external {
          revert InterfaceError(404);
          require(condition, InterfaceError(500));
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoErrors(report)
  })

  it('should NOT raise error for revert using low-level bytes representation of a custom error', () => {
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
    const code = `
      pragma solidity 0.8.5;
      contract A {
        function test() external {
          if (checkCertainCondition()) {
            revert("Condition check failed");
          }
        }
      }
    `
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use custom errors instead of string messages in revert')
  })
})
