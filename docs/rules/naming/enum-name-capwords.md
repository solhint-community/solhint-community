---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "enum-name-capwords | Solhint"
---

# enum-name-capwords
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Enum name must be in CapWords.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "enum-name-capwords": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### enum name starts with a uppercase letter 

```solidity
enum Enum{ Value, OtherValue }
```

#### enum name starts with a uppercase letter and uses uppercase letters to divide words 

```solidity
enum FunEnum{ Value, OtherValue }
```

### 👎 Examples of **incorrect** code for this rule

#### enum name starts with a lowercase letter

```solidity
enum funEnum{ Value, OtherValue }
```

#### enum name uses underscores to separate words

```solidity
enum Fun_enum{ Value, OtherValue }
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/enum-name-capwords.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/enum-name-capwords.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/enum-name-capwords.js)
