const ImportsOnTopChecker = require('./imports-on-top')
const VisibilityModifierOrderChecker = require('./visibility-modifier-order')
const OrderingChecker = require('./ordering')

module.exports = function order(reporter, tokens) {
  return [
    new ImportsOnTopChecker(reporter),
    new VisibilityModifierOrderChecker(reporter, tokens),
    new OrderingChecker(reporter),
  ]
}
