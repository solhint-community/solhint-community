---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "named-parameters-function | Solhint"
---

# named-parameters-function
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Enforce using named parameters when invoking a function with more than N arguments

## Options
This rule accepts an array of options:

| Index | Description                                                                                                    | Default Value |
| ----- | -------------------------------------------------------------------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off".                                                          | warn          |
| 1     | A Number specifying the max amount of arguments a function can have while still allowing positional arguments. | 3             |


### Example Config
```json
{
  "rules": {
    "named-parameters-function": ["warn",3]
  }
}
```


## Examples
### 👍 Examples of **correct** code for this rule

#### Calling a function with few positional arguments

```solidity
foo(10,200)
```

#### Calling a function with few named arguments

```solidity
foo({amount: 10, price: 200})
```

#### Calling a function with many named arguments

```solidity

          foo({
            amount: 10,
            price: 200,
            recipient: 0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990,
            token: 0xdac17f958d2ee523a2206206994597c13d831ec7
          })
```

### 👎 Examples of **incorrect** code for this rule

#### Calling a function with many positional arguments

```solidity

          foo(
             10,
             200,
             0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990,
             0xdac17f958d2ee523a2206206994597c13d831ec7
          )
```

#### With a config value of 0, using positional arguments in _any_ capacity

```solidity
foo(10)
```

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/named-parameters-function.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/named-parameters-function.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/named-parameters-function.js)
