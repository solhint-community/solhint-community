const _ = require('lodash')

module.exports = {
  from(configVals) {
    return _.assign({ rules: {} }, configVals, this)
  },

  getNumberByPath(path, defaultValue) {
    const configVal = _.get(this, path)
    return _.isNumber(configVal) ? configVal : defaultValue
  },

  getBooleanByPath(path, defaultValue) {
    const configVal = _.get(this, path)
    return _.isBoolean(configVal) ? configVal : defaultValue
  },

  getStringByPath(path, defaultValue) {
    const configVal = _.get(this, path)
    return _.isString(configVal) ? configVal : defaultValue
  },

  getNumber(ruleName, defaultValue) {
    return this.getNumberByPath(`rules["${ruleName}"][1]`, defaultValue)
  },

  getObjectPropertyNumber(ruleName, ruleProperty, defaultValue) {
    return this.getNumberByPath(`rules["${ruleName}"][1][${ruleProperty}]`, defaultValue)
  },

  getObjectPropertyBoolean(ruleName, ruleProperty, defaultValue) {
    return this.getBooleanByPath(`rules["${ruleName}"][1][${ruleProperty}]`, defaultValue)
  },

  getString(ruleName, defaultValue) {
    return this.getStringByPath(`rules["${ruleName}"][1]`, defaultValue)
  },
}
