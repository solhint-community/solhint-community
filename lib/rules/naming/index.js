const StyleGuideCasingChecker = require('./style-guide-casing')
const NonStateVarsLeadingUnderscoreChecker = require('./non-state-vars-leading-underscore')
const PrivateVarsLeadingUnderscore = require('./private-vars-leading-underscore')
const UseForbiddenNameChecker = require('./use-forbidden-name')
const NamedParametersFunctionChecker = require('./named-parameters-function')
const NamedParametersMappingChecker = require('./named-parameters-mapping')
const FoundryTestFunctionsChecker = require('./foundry-test-functions')
const NamedReturnValuesChecker = require('./named-return-values')

module.exports = function checkers(reporter, config) {
  return [
    new StyleGuideCasingChecker(reporter, config),
    new NonStateVarsLeadingUnderscoreChecker(reporter),
    new PrivateVarsLeadingUnderscore(reporter, config),
    new UseForbiddenNameChecker(reporter),
    new NamedParametersFunctionChecker(reporter, config),
    new NamedParametersMappingChecker(reporter),
    new FoundryTestFunctionsChecker(reporter, config),
    new NamedReturnValuesChecker(reporter, config),
  ]
}
