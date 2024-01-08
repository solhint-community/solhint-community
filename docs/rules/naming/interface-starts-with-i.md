---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "interface-starts-with-i | Solhint"
---

# interface-starts-with-i
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge error](https://img.shields.io/badge/Default%20Severity-error-red)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Interfaces name should start with `I`

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to error.

### Example Config
```json
{
  "rules": {
    "interface-starts-with-i": "error"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Interface name starts with I

```solidity
interface IFoo { function foo () external; }
```

### 👎 Examples of **incorrect** code for this rule

#### Interface name doesnt start with I

```solidity
interface Foo { function foo () external; }
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/interface-starts-with-i.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/interface-starts-with-i.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/interface-starts-with-i.js)
