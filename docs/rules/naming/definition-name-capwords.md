---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "definition-name-capwords | Solhint"
---

# definition-name-capwords
![Recommended Badge](https://img.shields.io/badge/-Recommended-brightgreen)
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge error](https://img.shields.io/badge/Default%20Severity-error-red)
> The {"extends": "solhint:recommended"} property in a configuration file enables this rule.


## Description
Contract, interface, library, struct, enum and event names must be in CapWords.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to error.

### Example Config
```json
{
  "rules": {
    "definition-name-capwords": "error"
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### contract name starts with a uppercase letter 

```solidity
contract Contract{}
```

#### interface name starts with a uppercase letter 

```solidity
interface Interface{}
```

#### library name starts with a uppercase letter 

```solidity
library Library{}
```

#### contract name starts with a uppercase letter and uses uppercase letters to divide words 

```solidity
contract FunContract{}
```

#### event name starts with a uppercase letter and uses uppercase letters to divide words 

```solidity
event FunEvent{}
```

#### enum name starts with a uppercase letter (enum values are not checked by this rule)

```solidity
enum Enum{ Value, OtherValue }
```

#### struct name starts with a uppercase letter and uses uppercase letters to divide words 

```solidity
struct FunStruct{}
```

### 👎 Examples of **incorrect** code for this rule

#### contract name starts with a lowercase letter

```solidity
contract funContract{}
```

#### contract name uses underscores to separate words

```solidity
contract Fun_contract{}
```

#### enum name uses underscores to separate words 

```solidity
enum Fun_enum{ Value, OtherValue }
```

#### event name uses underscores to separate words 

```solidity
event Fun_event()
```

#### struct name starts with a lowercase letter

```solidity
struct funStruct{}
```

## Version
This rule was introduced in [Solhint 4.0.0-rc01](https://github.com/solhint-community/solhint-community/tree/v4.0.0-rc01)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/definition-name-capwords.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/definition-name-capwords.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/definition-name-capwords.js)
