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
  definingSubName = false

  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  FileLevelConstant(node) {
    this.validateName(node, true)
  }

  StructDefinition() {
    this.definingSubName = true
  }

  'StructDefinition:exit'() {
    this.definingSubName = false
  }

  EventDefinition() {
    this.definingSubName = true
  }

  'EventDefinition:exit'() {
    this.definingSubName = false
  }

  CustomErrorDefinition() {
    this.definingSubName = true
  }

  'CustomErrorDefinition:exit'() {
    this.definingSubName = false
  }

  VariableDeclaration(node) {
    if (this.definingSubName) return
    if (node.isStateVar) {
      this.validateName(node, node.isDeclaredConst || node.isImmutable)
    } else {
      this.validateName(node, true)
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
