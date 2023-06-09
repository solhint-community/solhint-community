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


## Examples
This rule does not have examples.

## Version
This rule was introduced in [Solhint 3.0.0-rc.3](https://github.com/solhint-community/solhint-community/tree/v3.0.0-rc.3)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/naming/private-vars-leading-underscore.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/naming/private-vars-leading-underscore.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/naming/private-vars-leading-underscore.js)
