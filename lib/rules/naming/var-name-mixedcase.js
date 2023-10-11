const BaseChecker = require('../base-checker')
const { isMixedCase } = require('../../common/identifier-naming')

const ruleId = 'var-name-mixedcase'
const meta = {
  type: 'naming',

  docs: {
    description: `Variable name must be in mixedCase.`,
    category: 'Style Guide Rules',
  },

  isDefault: false,
  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class VarNameMixedcaseChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  VariableDeclaration(node) {
    if (!node.isDeclaredConst && !node.isImmutable) {
      this.validateVariablesName(node)
    }
  }

  validateVariablesName(node) {
    if (!isMixedCase(node.name)) {
      this.error(node, 'Variable name must be in mixedCase')
    }
  }
}

module.exports = VarNameMixedcaseChecker
