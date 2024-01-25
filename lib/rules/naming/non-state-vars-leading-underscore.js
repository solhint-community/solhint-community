const BaseChecker = require('../base-checker')
const { hasLeadingUnderscore } = require('../../common/identifier-naming')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'

const ruleId = 'non-state-vars-leading-underscore'
const meta = {
  type: 'naming',
  docs: {
    description:
      'Variables that are not in the state should start with underscore. Example: `_myVar`.',
    category: 'Style Guide Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
    ],
  },
  recommended: false,
  schema: null,
  defaultSetup: [DEFAULT_SEVERITY],
}

class NonStateVarsLeadingUnderscoreChecker extends BaseChecker {
  inStateVariableDeclaration = false

  inStructDefinition = false

  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  StateVariableDeclaration() {
    this.inStateVariableDeclaration = true
  }

  'StateVariableDeclaration:exit'() {
    this.inStateVariableDeclaration = false
  }

  StructDefinition() {
    this.inStructDefinition = true
  }

  'StructDefinition:exit'() {
    this.inStructDefinition = false
  }

  VariableDeclaration(node) {
    if (this.inStateVariableDeclaration) {
      this.validateName(node, false)
    } else {
      this.validateName(node, !this.inStructDefinition)
    }
  }

  validateName(node, shouldHaveLeadingUnderscore) {
    if (node.name === null) {
      return
    }

    if (hasLeadingUnderscore(node.name) !== shouldHaveLeadingUnderscore) {
      this._error(node, node.name, shouldHaveLeadingUnderscore)
    }
  }

  _error(node, name, shouldHaveLeadingUnderscore) {
    this.error(
      node,
      `'${name}' ${shouldHaveLeadingUnderscore ? 'should' : 'should not'} start with _`
    )
  }
}
module.exports = NonStateVarsLeadingUnderscoreChecker
