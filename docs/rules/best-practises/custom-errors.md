---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "custom-errors | Solhint"
---

# custom-errors
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge error](https://img.shields.io/badge/Default%20Severity-error-red)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Enforces the use of Custom Errors over Require and Revert statements

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to error.

### Example Config
```json
{
  "rules": {
    "custom-errors": "error"
  }
}
```

### Notes
- This rule is automatically disabled for files whose pragma directive disallows versions where custom errors are available
- The rule does not analyze revert calls within assembly blocks
- Limitation: The rule accepts any function call as a custom error. It does not verify if the function is a valid custom error constructor.
- Complex expressions are disallowed as the second argument to `require` to maintain clarity and ensure that a straightforward custom error is used. This avoids potential issues where the expression could resolve to a string or other unintended types.

## Examples
### 👍 Examples of **correct** code for this rule

#### Use of Custom Errors

```solidity
revert CustomErrorFunction();
```

#### Use of Custom Errors with arguments

```solidity
revert CustomErrorFunction({ msg: "Insufficient Balance" });
```

#### Use of require with a custom error function

```solidity
require(cond, CustomError());
```

### 👎 Examples of **incorrect** code for this rule

#### Use of require with a string message

```solidity
require(userBalance >= availableAmount, "Insufficient Balance");
```

#### Use of plain revert statement

```solidity
revert();
```

#### Use of revert statement with message

```solidity
revert("Insufficient Balance");
```

#### Use of require with a complex expression instead of a custom error

```solidity
require(condition, x > 5 ? "Too high" : "Too low");
```

## Version
This rule was introduced in [Solhint 3.7.0-rc02](https://github.com/solhint-community/solhint-community/tree/v3.7.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/custom-errors.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/custom-errors.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/custom-errors.js)
