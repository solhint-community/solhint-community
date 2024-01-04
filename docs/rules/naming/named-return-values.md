---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "named-return-values | Solhint"
---

# named-return-values
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Ensure function return parameters are named

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "named-return-values": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Function definition with named return values

```solidity
function checkBalance(address wallet) external view returns(uint256 retBalance) {}
```

### 👎 Examples of **incorrect** code for this rule

#### Function definition with unnamed return values

```solidity
function checkBalance(address wallet) external view returns(uint256) {}
```

## Version
This rule was introduced in [Solhint 3.7.0-rc02](https://github.com/solhint-community/solhint-community/tree/v3.7.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/named-return-values.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/named-return-values.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/named-return-values.js)
