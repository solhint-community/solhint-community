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

| Index | Description                                                                                                                                                                                                                                                                                                                                                             | Default Value                                                                                                                                                                                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off".                                                                                                                                                                                                                                                                                                                   | warn                                                                                                                                                                                                                                                                                           |
| 1     | An object with keys `ignore{{Public,External,Internal,Private}Functions,Contracts,Libraries,Interfaces,Modifiers,Immutables,Constants,Variables,Enums,Structs,Events}` which, when true, disables the rule for that node. You might want to use `{ignoreExternalFunctions: true, ignorePublicFunctions: true}` when also enabling `foundry-test-functions`, for example | {"ignorePublicFunctions":false,"ignoreExternalFunctions":false,"ignoreInternalFunctions":false,"ignorePrivateFunctions":false,"ignoreModifiers":false,"ignoreImmutables":false,"ignoreConstants":false,"ignoreVariables":false,"ignoreEnums":false,"ignoreStructs":false,"ignoreEvents":false} |


### Example Config
```json
{
  "rules": {
    "style-guide-casing": ["warn",{"ignorePublicFunctions":false,"ignoreExternalFunctions":false,"ignoreInternalFunctions":false,"ignorePrivateFunctions":false,"ignoreModifiers":false,"ignoreImmutables":false,"ignoreConstants":false,"ignoreVariables":false,"ignoreEnums":false,"ignoreStructs":false,"ignoreEvents":false}]
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
This rule was introduced in [Solhint 4.0.0-rc02](https://github.com/solhint-community/solhint-community/tree/v4.0.0-rc02)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/style-guide-casing.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/style-guide-casing.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/style-guide-casing.js)
