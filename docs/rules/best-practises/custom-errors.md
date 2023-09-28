---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "custom-errors | Solhint"
---

# custom-errors
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Enforces the use of Custom Errors over Require and Revert statements

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "custom-errors": "warn"
  }
}
```


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

### 👎 Examples of **incorrect** code for this rule

#### Use of require statement

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

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/custom-errors.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/custom-errors.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/custom-errors.js)