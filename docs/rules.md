---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "Rule Index of Solhint"
---

## Best Practise Rules

| Rule Id                                                                  | Error                                                                                                                                      | Recommended |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| [code-complexity](./rules/best-practises/code-complexity.md)             | Function has cyclomatic complexity "current" but allowed no more than maxcompl.                                                            |             |
| [custom-errors](./rules/best-practises/custom-errors.md)                 | Enforces the use of Custom Errors over Require and Revert statements                                                                       | ✔️          |
| [explicit-types](./rules/best-practises/explicit-types.md)               | Enforce explicit types (like uint256) over implicit ones(like uint).                                                                       | ✔️          |
| [function-max-lines](./rules/best-practises/function-max-lines.md)       | Function body contains "count" lines but allowed no more than maxlines.                                                                    |             |
| [max-line-length](./rules/best-practises/max-line-length.md)             | Line length must be no more than maxlen.                                                                                                   |             |
| [max-states-count](./rules/best-practises/max-states-count.md)           | Contract has "some count" states declarations but allowed no more than maxstates.                                                          | ✔️          |
| [no-console](./rules/best-practises/no-console.md)                       | No console.log/logInt/logBytesX/logString/etc & No hardhat and forge-std console.sol import statements                                     | ✔️          |
| [no-empty-blocks](./rules/best-practises/no-empty-blocks.md)             | Code block has zero statements inside. Some common exceptions apply.                                                                       | ✔️          |
| [no-global-import](./rules/best-practises/no-global-import.md)           | Import statement includes an entire file instead of selected symbols                                                                       | ✔️          |
| [no-unused-vars](./rules/best-practises/no-unused-vars.md)               | Ensure defined names are used                                                                                                              | ✔️          |
| [one-contract-per-file](./rules/best-practises/one-contract-per-file.md) | Enforces the use of ONE Contract per file see [here](https://docs.soliditylang.org/en/v0.8.21/style-guide.html#contract-and-library-names) | ✔️          |
| [payable-fallback](./rules/best-practises/payable-fallback.md)           | When fallback is not payable you will not be able to receive ethers.                                                                       | ✔️          |
| [reason-string](./rules/best-practises/reason-string.md)                 | Require or revert statement must have a reason string and check that each reason string is at most N characters long.                      | ✔️          |
| [constructor-syntax](./rules/best-practises/constructor-syntax.md)       | Constructors should use the new constructor keyword.                                                                                       |             |
| [named-parameters-function](./rules/naming/named-parameters-function.md) | Enforce using named parameters when invoking a function with more than N arguments                                                         |             |
        

## Style Guide Rules

| Rule Id                                                                              | Error                                                                                  | Recommended |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ----------- |
| [interface-starts-with-i](./rules/naming/interface-starts-with-i.md)                 | Interfaces name should start with `I`                                                  | ✔️          |
| [quotes](./rules/miscellaneous/quotes.md)                                            | Use double quotes for string literals. Values must be 'single' or 'double'.            | ✔️          |
| [named-parameters-mapping](./rules/naming/named-parameters-mapping.md)               | Solidity v0.8.18 introduced named parameters on the mappings definition                |             |
| [named-return-values](./rules/naming/named-return-values.md)                         | Ensure function return parameters are named                                            | ✔️          |
| [private-vars-leading-underscore](./rules/naming/private-vars-leading-underscore.md) | Private and internal names must start with a single underscore.                        |             |
| [style-guide-casing](./rules/naming/style-guide-casing.md)                           | Check identifier and type name casing conforms to the style guide                      | ✔️          |
| [use-forbidden-name](./rules/naming/use-forbidden-name.md)                           | Avoid to use letters 'I', 'l', 'O' as identifiers.                                     | ✔️          |
| [imports-on-top](./rules/order/imports-on-top.md)                                    | Import statements must be on top.                                                      | ✔️          |
| [ordering](./rules/order/ordering.md)                                                | Check order of elements in file and inside each contract, according to the style guide |             |
| [visibility-modifier-order](./rules/order/visibility-modifier-order.md)              | Visibility modifier must be first in list of modifiers.                                | ✔️          |
        

## Miscellaneous

| Rule Id                                                                     | Error                                                                                                                                  | Recommended |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [comprehensive-interface](./rules/miscellaneous/comprehensive-interface.md) | Check that all public or external functions are override. This is iseful to make sure that the whole API is extracted in an interface. |             |
        

## Best Practice Rules

| Rule Id                                                                                  | Error                                                                                                                                                                                                                                                                     | Recommended |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [non-state-vars-leading-underscore](./rules/naming/non-state-vars-leading-underscore.md) | Variables that are not in contract state should start with underscore. Conversely, variables that can cause an SLOAD/SSTORE should NOT start with an underscore. This makes it evident which operations cause expensive storage access when hunting for gas optimizations |             |
        

## Security Rules

| Rule Id                                                              | Error                                                                    | Recommended |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------- |
| [avoid-call-value](./rules/security/avoid-call-value.md)             | Avoid to use ".call.value()()".                                          | ✔️          |
| [avoid-low-level-calls](./rules/security/avoid-low-level-calls.md)   | Avoid to use low level calls.                                            | ✔️          |
| [avoid-sha3](./rules/security/avoid-sha3.md)                         | Use "keccak256" instead of deprecated "sha3".                            | ✔️          |
| [avoid-suicide](./rules/security/avoid-suicide.md)                   | Use "selfdestruct" instead of deprecated "suicide".                      | ✔️          |
| [avoid-throw](./rules/security/avoid-throw.md)                       | "throw" is deprecated, avoid to use it.                                  | ✔️          |
| [avoid-tx-origin](./rules/security/avoid-tx-origin.md)               | Avoid to use tx.origin.                                                  | ✔️          |
| [check-send-result](./rules/security/check-send-result.md)           | Check result of "send" call.                                             | ✔️          |
| [compiler-version](./rules/security/compiler-version.md)             | Compiler version must satisfy a semver requirement.                      | ✔️          |
| [func-visibility](./rules/security/func-visibility.md)               | Explicitly mark visibility in function.                                  | ✔️          |
| [multiple-sends](./rules/security/multiple-sends.md)                 | Avoid multiple calls of "send" method in single transaction.             | ✔️          |
| [no-complex-fallback](./rules/security/no-complex-fallback.md)       | Fallback function must be simple.                                        | ✔️          |
| [no-inline-assembly](./rules/security/no-inline-assembly.md)         | Avoid to use inline assembly. It is acceptable only in rare cases.       | ✔️          |
| [not-rely-on-block-hash](./rules/security/not-rely-on-block-hash.md) | Do not rely on "block.blockhash". Miners can influence its value.        | ✔️          |
| [not-rely-on-time](./rules/security/not-rely-on-time.md)             | Avoid making time-based decisions in your business logic.                |             |
| [reentrancy](./rules/security/reentrancy.md)                         | Possible reentrancy vulnerabilities. Avoid state changes after transfer. | ✔️          |
| [state-visibility](./rules/security/state-visibility.md)             | Explicitly mark visibility of state.                                     | ✔️          |
        

## References

- [ConsenSys Guide for Smart Contracts](https://consensys.github.io/smart-contract-best-practices/recommendations/)
- [Solidity Style Guide](http://solidity.readthedocs.io/en/develop/style-guide.html)
