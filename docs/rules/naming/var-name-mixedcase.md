---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "var-name-mixedcase | Solhint"
---

# var-name-mixedcase
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Identifier name must be in mixedCase.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "var-name-mixedcase": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### state variable in mixedCase

```solidity
contract { uint public fooBar; }
```

#### stack variable in mixedCase

```solidity
contract {
function foo() {
  uint fooStack;
}
}
```

#### function variable in mixedCase

```solidity
contract {
function foo(uint fooParam) { }
}
```

#### event parameter in mixedCase

```solidity
contract {
event Foo(uint fooParam) { }
}
```

### 👎 Examples of **incorrect** code for this rule

#### name in CapWords

```solidity
contract { uint public FooBar; }
```

#### name in UPPER_SNAKE_CASE

```solidity
contract { uint public FOO_BAR; }
```

## Version
This rule was introduced in [Solhint 2.0.0-alpha.0](https://github.com/solhint-community/solhint-community/tree/v2.0.0-alpha.0)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/var-name-mixedcase.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/var-name-mixedcase.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/var-name-mixedcase.js)
