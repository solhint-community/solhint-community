const BaseChecker = require('../base-checker')
const { isMixedCase } = require('../../common/identifier-naming')

const ruleId = 'modifier-name-mixedcase'
const meta = {
  type: 'naming',

  docs: {
    description: 'Modifier name must be in mixedCase.',
    category: 'Style Guide Rules',
  },

  isDefault: false,
  recommended: false,
  defaultSetup: 'warn',

  schema: null,
}

class ModifierNameMixedcase extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  ModifierDefinition(node) {
    if (!isMixedCase(node.name)) {
      this.error(node, 'Modifier name must be in mixedCase')
    }
  }
}

module.exports = ModifierNameMixedcase
