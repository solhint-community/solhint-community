---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "style-guide-casing | Solhint"
---

# style-guide-casing
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Check identifier and type name casing conforms to the style guide

## Options
This rule accepts an array of options:

| Index | Description                                           | Default Value |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off". | warn          |


### Example Config
```json
{
  "rules": {
    "style-guide-casing": ["warn"]
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### immutable/constant var name is capitalized snake case

```solidity
uint private immutable WAD_DECIMALS = 18
```

#### constant var name is capitalized snake case

```solidity
uint private constant WAD_DECIMALS = 18
```

#### function/modifier name in mixedCase

```solidity
function foo_bar() {}
```

#### contract/enum/struct name in CapWords

```solidity
contract Foo {}
```

### 👎 Examples of **incorrect** code for this rule

#### immutable/constant var name in lowercase snake_case

```solidity
uint private immutable wad_decimals = 18
```

#### function/modifier name in snake case

```solidity
function foo_bar() {}
```

#### function/modifier name in upper snake case

```solidity
modifier FOO_BAR() {}
```

#### mutable var name in upper snake case

```solidity
uint private FOO_BAR;
```

#### contract name not in CapWords

```solidity
contract foo {}
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/style-guide-casing.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/style-guide-casing.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/style-guide-casing.js)
