---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "no-comparison-in-expression | Solhint"
---

# no-comparison-in-expression
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Disallows comparisons used as standalone expression statements (i.e. no assigned result).

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "no-comparison-in-expression": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Comparison used in control-flow statement (if).

```solidity
if (foo == bar) { doSomething(); }
```

#### Comparison used in a require statement.

```solidity
require(foo != 0, "foo must not be zero");
```

### 👎 Examples of **incorrect** code for this rule

#### Comparison as standalone statement in function.

```solidity
foo == bar;
```

#### Comparison as expression with no effect.

```solidity
42 != someVar;
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-comparison-in-expression.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-comparison-in-expression.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-comparison-in-expression.js)
