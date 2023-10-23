---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "private-vars-leading-underscore | Solhint"
---

# private-vars-leading-underscore
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Private and internal names must start with a single underscore.

## Options
This rule accepts an array of options:

| Index | Description                                                                                                                           | Default Value    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off".                                                                                 | warn             |
| 1     | A JSON object with a single property "strict" specifying if the rule should apply to non state variables. Default: { strict: false }. | {"strict":false} |


### Example Config
```json
{
  "rules": {
    "private-vars-leading-underscore": ["warn",{"strict":false}]
  }
}
```

### Notes
- See [here](https://docs.soliditylang.org/en/latest/style-guide.html#underscore-prefix-for-non-external-functions-and-variables) for further information

## Examples
### 👍 Examples of **correct** code for this rule

#### Internal function starting with an underscore

```solidity
function _thisIsInternal() internal {}
```

#### Private function starting with an underscore

```solidity
function _thisIsPrivate() private {}
```

#### Internal state variable starting with an underscore

```solidity
uint256 internal _thisIsInternalVariable;
```

#### with `{strict: false}`, memory variables starting with an underscore is not considered an error

```solidity
function foo(uint256 _bar) public {}
```

#### Internal state variable starting with an underscore (no visibility is considered internal)

```solidity
uint256 _thisIsInternalVariable;
```

### 👎 Examples of **incorrect** code for this rule

#### with `{strict: true}`, memory variables starting with an underscore are considered an error

```solidity
function foo(uint256 _bar) public {}
```

#### public/external function name starts with an underscore

```solidity
function _foo() public {}
```

#### Internal function does not start with an underscore

```solidity
function thisIsInternal() internal {}
```

#### Private function does not start with an underscore

```solidity
function thisIsPrivate() private {}
```

#### Internal state variable does not start with an underscore

```solidity
uint256 internal thisIsInternalVariable;
```

#### Internal state variable does not start with an underscore(no visibility is considered internal)

```solidity
uint256 thisIsInternalVariable;
```

## Version
This rule was introduced in [Solhint 3.0.0-rc.3](https://github.com/solhint-community/solhint-community/tree/v3.0.0-rc.3)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/private-vars-leading-underscore.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/private-vars-leading-underscore.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/private-vars-leading-underscore.js)
