---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "max-line-length | Solhint"
---

# max-line-length
![Category Badge](https://img.shields.io/badge/-Best%20Practise%20Rules-informational)
![Default Severity Badge error](https://img.shields.io/badge/Default%20Severity-error-red)

## Description
Line length must be no more than maxlen.

## Options
This rule accepts an array of options:

| Index | Description                                           | Default Value |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off". | error         |
| 1     | Maximum allowed number of characters per line         | 120           |


### Example Config
```json
{
  "rules": {
    "max-line-length": ["error",120]
  }
}
```


## Examples
This rule does not have examples.

## Version
This rule was introduced in [Solhint 1.1.5](https://github.com/solhint-community/solhint-community/tree/v1.1.5)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/best-practises/max-line-length.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/best-practises/max-line-length.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/best-practises/max-line-length.js)
