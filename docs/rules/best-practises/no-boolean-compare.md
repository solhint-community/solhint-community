---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "no-boolean-compare | Solhint"
---

# no-boolean-compare
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge error](https://img.shields.io/badge/Default%20Severity-error-red)

## Description
Disallows comparison to true or false keywords.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to error.

### Example Config
```json
{
  "rules": {
    "no-boolean-compare": "error"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Directly use the boolean variable

```solidity
if (foo) { doSomething(); }
```

#### Use the negated boolean variable

```solidity
if (!bar) { doSomething(); }
```

### 👎 Examples of **incorrect** code for this rule

#### Compare boolean variable to true

```solidity
if (foo == true) { doSomething(); }
```

#### Compare boolean variable to false

```solidity
if (bar == false) { doSomething(); }
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-boolean-compare.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-boolean-compare.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-boolean-compare.js)
