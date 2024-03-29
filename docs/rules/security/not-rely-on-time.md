---
warning:     "This is a dynamically generated file. Do not edit manually."
layout:      "default"
title:       "not-rely-on-time | Solhint"
---

# not-rely-on-time
![Category Badge](https://img.shields.io/badge/-Security%20Rules-informational)
![Default Severity Badge warn](https://img.shields.io/badge/Default%20Severity-warn-yellow)

## Description
Avoid making time-based decisions in your business logic.

## Options
This rule accepts a string option of rule severity. Must be one of "error", "warn", "off". Default to warn.

### Example Config
```json
{
  "rules": {
    "not-rely-on-time": "warn"
  }
}
```


## Examples
This rule does not have examples.

## Version
This rule was introduced in [Solhint 1.1.5](https://github.com/solhint-community/solhint-community/tree/v1.1.5)

## Resources
- [Rule source](https://github.com/solhint-community/solhint-community/tree/master/lib/rules/security/not-rely-on-time.js)
- [Document source](https://github.com/solhint-community/solhint-community/tree/master/docs/rules/security/not-rely-on-time.md)
- [Test cases](https://github.com/solhint-community/solhint-community/tree/master/test/rules/security/not-rely-on-time.js)
