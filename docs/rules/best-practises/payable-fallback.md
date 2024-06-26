---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "payable-fallback | Solhint"
---

# payable-fallback
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
When fallback is not payable you will not be able to receive ethers.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "payable-fallback": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Fallback is payable

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function () public payable {}
      }
    
```

#### Fallback is not payable, but theres a receive function

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function () public {}
receive() public{}
      }
    
```

### 👎 Examples of **incorrect** code for this rule

#### Fallback is not payable and theres no receive function

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function () public {}
      }
    
```

## Version
This rule was introduced in [Solhint 2.0.0-alpha.0](https://github.com/solhint-community/solhint-community/tree/v2.0.0-alpha.0)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/payable-fallback.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/payable-fallback.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/payable-fallback.js)
