---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "no-unused-import | Solhint"
---

# no-unused-import
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Reports a warning when an imported name is not used

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "no-unused-import": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Imported name is used

```solidity

            import {A} from './A.sol';
            contract B is A {}
          
```

### 👎 Examples of **incorrect** code for this rule

#### Imported name is not used

```solidity

            import {A} from './A.sol';
            contract B {}
          
```

## Version
This rule was introduced in [Solhint 3.5.1](https://github.com/solhint-community/solhint-community/tree/v3.5.1)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-unused-import.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-unused-import.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-unused-import.js)
