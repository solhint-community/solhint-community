---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "const-name-snakecase | Solhint"
---

# const-name-snakecase
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Constant name must be in capitalized SNAKE_CASE.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "const-name-snakecase": "warn"
  }
}
```


## Examples
This rule does not have examples.

## Version
This rule was introduced in [Solhint 2.0.0-alpha.0](https://github.com/solhint-community/solhint-community/tree/v2.0.0-alpha.0)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/const-name-snakecase.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/const-name-snakecase.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/const-name-snakecase.js)
