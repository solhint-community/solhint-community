---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "one-contract-per-file | Solhint"
---

# one-contract-per-file
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Enforces the use of ONE Contract per file see [here](https://docs.soliditylang.org/en/v0.8.21/style-guide.html#contract-and-library-names)

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "one-contract-per-file": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### One contract per file

```solidity

            contract Foo {

            }
            
```

### 👎 Examples of **incorrect** code for this rule

#### Two contract in the same file

```solidity

            contract Foo {

            }

            contract Bar {

            }
            
```

#### One contract and one library in the same file

```solidity

            contract Foo {

            }

            Library ReusableThing {

            }
            
```

## Version
This rule was introduced in [Solhint 3.7.0-rc02](https://github.com/solhint-community/solhint-community/tree/v3.7.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/one-contract-per-file.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/one-contract-per-file.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/one-contract-per-file.js)
