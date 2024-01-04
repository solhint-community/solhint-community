---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "explicit-types | Solhint"
---

# explicit-types
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Enforce explicit types (like uint256) over implicit ones(like uint).

## Options
This rule accepts an array of options:

| Index | Description                                           | Default Value |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off". | warn          |


### Example Config
```json
{
  "rules": {
    "explicit-types": ["warn"]
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### using a type that explicitly states the variable size

```solidity
uint256 public variableName
```

#### using a type that explicitly states the variable size

```solidity
fixed128x18 public foo
```

#### using a type that explicitly states the variable size

```solidity
uint256 public variableName = uint256(5)
```

### 👎 Examples of **incorrect** code for this rule

#### using the shorter alias for a type, which is implicit about its size

```solidity
uint public variableName
```

#### using the shorter alias for a type, which is implicit about its size

```solidity
fixed public foo
```

#### using the shorter alias for a type, which is implicit about its size

```solidity
uint public variableName = uint(5)
```

## Version
This rule was introduced in [Solhint 3.7.0-rc02](https://github.com/solhint-community/solhint-community/tree/v3.7.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/explicit-types.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/explicit-types.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/explicit-types.js)
