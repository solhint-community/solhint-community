const ConstNameSnakecaseChecker = require('./const-name-snakecase')
const DefinitionNameCapWordsChecker = require('./definition-name-capwords')
const FuncNameMixedcaseChecker = require('./func-name-mixedcase')
const ModifierNameMixedcaseChecker = require('./modifier-name-mixedcase')
const PrivateVarsLeadingUnderscore = require('./private-vars-leading-underscore')
const UseForbiddenNameChecker = require('./use-forbidden-name')
const VarNameMixedcaseChecker = require('./var-name-mixedcase')
const NamedParametersFunctionChecker = require('./named-parameters-function')
const NamedParametersMappingChecker = require('./named-parameters-mapping')
const FoundryTestFunctionsChecker = require('./foundry-test-functions')
const ImmutableNameSnakeCaseChecker = require('./immutable-name-snakecase')
const NamedReturnValuesChecker = require('./named-return-values')

module.exports = function checkers(reporter, config) {
  return [
    new ConstNameSnakecaseChecker(reporter),
    new DefinitionNameCapWordsChecker(reporter),
    new FuncNameMixedcaseChecker(reporter),
    new ModifierNameMixedcaseChecker(reporter),
    new PrivateVarsLeadingUnderscore(reporter, config),
    new UseForbiddenNameChecker(reporter),
    new VarNameMixedcaseChecker(reporter),
    new NamedParametersFunctionChecker(reporter, config),
    new NamedParametersMappingChecker(reporter),
    new ImmutableNameSnakeCaseChecker(reporter),
    new FoundryTestFunctionsChecker(reporter, config),
    new NamedReturnValuesChecker(reporter, config),
  ]
}
