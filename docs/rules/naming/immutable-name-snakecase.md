---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "immutable-name-snakecase | Solhint"
---

# immutable-name-snakecase
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Check Immutable variables are SNAKE_CASE.

## Options
This rule accepts an array of options:

| Index | Description                                           | Default Value |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off". | warn          |


### Example Config
```json
{
  "rules": {
    "immutable-name-snakecase": ["warn"]
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### immutable var name is capitalized snake case

```solidity
uint private immutable WAD_DECIMALS = 18
```

### 👎 Examples of **incorrect** code for this rule

#### lowercase snake case

```solidity
uint private immutable wad_decimals = 18
```

#### camelcase

```solidity
uint private immutable wadDecimals = 18
```

## Version
This rule was introduced in [Solhint 3.7.0-rc02](https://github.com/solhint-community/solhint-community/tree/v3.7.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/immutable-name-snakecase.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/immutable-name-snakecase.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/immutable-name-snakecase.js)
