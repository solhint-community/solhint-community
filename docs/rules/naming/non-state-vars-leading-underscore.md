---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "non-state-vars-leading-underscore | Solhint"
---

# non-state-vars-leading-underscore
![Category Badge](https://img.shields.io/badge/-Style%20Guide%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Variables that are not in the state should start with underscore. Example: `_myVar`.

## Options
This rule accepts an array of options:

| Index | Description                                           | Default Value |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Rule severity. Must be one of "error", "warn", "off". | warn          |


### Example Config
```json
{
  "rules": {
    "non-state-vars-leading-underscore": ["warn"]
  }
}
```


## Examples
This rule does not have examples.

## Version
This rule is introduced in the latest version.

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/non-state-vars-leading-underscore.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/non-state-vars-leading-underscore.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/non-state-vars-leading-underscore.js)
