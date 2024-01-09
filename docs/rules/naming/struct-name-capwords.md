---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "struct-name-capwords | Solhint"
---

# struct-name-capwords
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Struct name must be in CapWords.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "struct-name-capwords": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### struct name starts with a uppercase letter 

```solidity
struct Struct{}
```

#### struct name starts with a uppercase letter and uses uppercase letters to divide words 

```solidity
struct FunStruct{}
```

### 👎 Examples of **incorrect** code for this rule

#### struct name starts with a lowercase letter

```solidity
struct funStruct{}
```

#### struct name uses underscores to separate words

```solidity
struct Fun_struct{}
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/struct-name-capwords.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/struct-name-capwords.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/struct-name-capwords.js)
