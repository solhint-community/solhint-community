---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "no-empty-blocks | Solhint"
---

# no-empty-blocks
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Code block has zero statements inside. Some common exceptions apply.

## Options
This rule accepts an array of options:

| Index | Description                             | Default Value |
| ----- | --------------------------------------- | ------------- |
| 0     | Allow empty modifiers containing only _ | false         |
| 1     | Allow empty try-catch blocks            | false         |


### Example Config
```json
{
  "rules": {
    "no-empty-blocks": ["warn",{"allowEmptyModifiers":false,"allowEmptyCatch":false}]
  }
}
```

### Notes
- Empty constructor is ignored if the constructor has parent-initialization modifiers.
- Use allowEmptyModifiers / allowEmptyCatch to skip warnings for underscore-only modifiers / empty catch blocks.

## Examples
### 👍 Examples of **correct** code for this rule

#### empty receive function

```solidity
receive () external {}
```

#### empty fallback function

```solidity
fallback () external {}
```

#### empty constructor with parent init

```solidity
constructor(uint x) Base(x) {}
```

#### empty modifier with _ allowed

```solidity
modifier onlyOwner { _; }
```

#### empty try-catch block allowed

```solidity
try foo() {} catch {}
```

### 👎 Examples of **incorrect** code for this rule

#### empty block for an if statement

```solidity
if(condition) {}
```

#### empty contract

```solidity
contract Foo {}
```

#### empty block in constructor without parent initialization

```solidity
constructor () {}
```

#### empty modifier with only _ (when allowEmptyModifiers is false)

```solidity
modifier onlyOwner { _; }
```

## Version
This rule was introduced in [Solhint 1.1.5](https://github.com/solhint-community/solhint-community/tree/v1.1.5)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-empty-blocks.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-empty-blocks.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-empty-blocks.js)
