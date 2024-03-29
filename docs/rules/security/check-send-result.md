---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "check-send-result | Solhint"
---

# check-send-result
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Security%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Check result of "send" call.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "check-send-result": "warn"
  }
}
```

### Notes
- You should use no-unused-var to track that the variable you assign the return value of .send to is actually used
- Rule will skip ".send" calls with arity != 1 to avoid false positives on ERC777 sends. you might get a false positive regardless if you define a .send function taking one argument

## Examples
### 👍 Examples of **correct** code for this rule

#### result of "send" call checked with if statement

```solidity
if(x.send(55)) {}
```

#### result of "send" call checked within a require

```solidity
require(payable(walletAddress).send(moneyAmount), "Failed to send moneyAmount");
```

#### result of "send" assigned to a variable

```solidity
bool success = payable(walletAddress).send(moneyAmount);
```

#### result of "send" passed to a function

```solidity
doThingWithResult(payable(walletAddress).send(moneyAmount));
```

### 👎 Examples of **incorrect** code for this rule

#### result of "send" call ignored

```solidity
x.send(55);
```

## Version
This rule was introduced in [Solhint 2.0.0-alpha.0](https://github.com/solhint-community/solhint-community/tree/v2.0.0-alpha.0)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/security/check-send-result.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/security/check-send-result.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/security/check-send-result.js)
