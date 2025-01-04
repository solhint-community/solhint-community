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
    "no-empty-blocks": ["warn",{"allowEmptyModifiers":false,"allowEmptyCatch":false,"allowEmptyTry":false}]
  }
}
```

### Notes
- The rule ignores an empty constructor by default as long as parent contracts are being initialized. See "Empty Constructor" example.
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

#### empty constructor with member initialization list

```solidity
constructor(uint param) Foo(param) Bar(param*2)
```

#### empty modifier with _ allowed

```solidity
modifier onlyOwner { _; }
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

#### empty modifier with only _ (when allowEmptyModifiers is true)

```solidity
modifier onlyOwner { _; }
```

#### empty catch block

```solidity
catch Error(string memory reason) {}
```

#### empty try block

```solidity
try {}
```

## Version
This rule was introduced in [Solhint 1.1.5](https://github.com/solhint-community/solhint-community/tree/v1.1.5)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-empty-blocks.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-empty-blocks.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-empty-blocks.js)
