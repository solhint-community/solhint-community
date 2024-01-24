---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "no-unused-vars | Solhint"
---

# no-unused-vars
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Ensure defined names are used

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "no-unused-vars": "warn"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### imported name is used

```solidity

            import {A} from './A.sol';
            contract Foo is A{ }
            
```

#### defined stack variable is used

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function fun(uint a) public { uint b = bytes32(a); b += 1; }
      }
    
```

#### note: function parameters of functions with empty blocks are not checked

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function fun(uint d) public returns (uint c) { }
      }
    
```

#### note: function parameters of functions without blocks are not checked

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function fun(uint a, uint b) public returns (uint c);
      }
    
```

#### note: state variables are not checked

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        uint public foo;
      }
    
```

### 👎 Examples of **incorrect** code for this rule

#### imported name is not used

```solidity

            import {A} from './A.sol';
            contract Foo { }
            
```

#### stack variable is not used

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        
        function b() public {
          uint a = 0;
        }
    
      }
    
```

#### function parameter is not used

```solidity

      pragma solidity 0.4.4;
        
        
      contract A {
        function fun(uint a) public returns (uint){ return 42; }
      }
    
```

## Version
This rule was introduced in [Solhint 1.1.5](https://github.com/solhint-community/solhint-community/tree/v1.1.5)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/no-unused-vars.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/no-unused-vars.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/no-unused-vars.js)
