const BaseChecker = require('../base-checker')
const naming = require('../../common/identifier-naming')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'
const DEFAULT_STRICTNESS = false
const DEFAULT_OPTION = { strict: DEFAULT_STRICTNESS }

const ruleId = 'private-vars-leading-underscore'
const meta = {
  type: 'naming',

  docs: {
    description: 'Private and internal names must start with a single underscore.',
    category: 'Style Guide Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
      {
        description:
          'A JSON object with a single property "strict" specifying if the rule should apply to non state variables. Default: { strict: false }.',
        default: JSON.stringify(DEFAULT_OPTION),
      },
    ],
    examples: {
      good: [
        {
          description: 'Internal function starting with an underscore',
          code: 'function _thisIsInternal() internal {}',
        },
        {
          description: 'Private function starting with an underscore',
          code: 'function _thisIsPrivate() private {}',
        },
        {
          description: 'Internal state variable starting with an underscore',
          code: 'uint256 internal _thisIsInternalVariable;',
        },
        {
          description:
            'with `{strict: false}`, memory variables starting with an underscore is not considered an error',
          code: 'function foo(uint256 _bar) public {}',
        },
        {
          description:
            'Internal state variable starting with an underscore (no visibility is considered internal)',
          code: 'uint256 _thisIsInternalVariable;',
        },
      ],
      bad: [
        {
          description:
            'with `{strict: true}`, memory variables starting with an underscore are considered an error',
          code: 'function foo(uint256 _bar) public {}',
        },
        {
          description: 'public/external function name starts with an underscore',
          code: 'function _foo() public {}',
        },
        {
          description: 'Internal function does not start with an underscore',
          code: 'function thisIsInternal() internal {}',
        },
        {
          description: 'Private function does not start with an underscore',
          code: 'function thisIsPrivate() private {}',
        },
        {
          description: 'Internal state variable does not start with an underscore',
          code: 'uint256 internal thisIsInternalVariable;',
        },
        {
          description:
            'Internal state variable does not start with an underscore(no visibility is considered internal)',
          code: 'uint256 thisIsInternalVariable;',
        },
      ],
    },
    notes: [
      {
        note: 'See [here](https://docs.soliditylang.org/en/latest/style-guide.html#underscore-prefix-for-non-external-functions-and-variables) for further information',
      },
    ],
  },

  isDefault: false,
  recommended: false,
  defaultSetup: [DEFAULT_SEVERITY, DEFAULT_OPTION],

  schema: {
    type: 'object',
    properties: {
      strict: {
        type: 'boolean',
      },
    },
  },
}

class PrivateVarsLeadingUnderscoreChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta)

    this.isStrict = config && config.getObjectPropertyBoolean(ruleId, 'strict', DEFAULT_STRICTNESS)
  }

  ContractDefinition(node) {
    if (node.kind === 'library') {
      this.inLibrary = true
    }
  }

  'ContractDefinition:exit'() {
    this.inLibrary = false
  }

  FunctionDefinition(node) {
    if (!node.name) {
      return
    }

    const isPrivate = node.visibility === 'private'
    const isInternal = node.visibility === 'internal'
    const shouldHaveLeadingUnderscore = isPrivate || (!this.inLibrary && isInternal)
    this.validateName(node, shouldHaveLeadingUnderscore)
  }

  StateVariableDeclaration() {
    this.inStateVariableDeclaration = true
  }

  'StateVariableDeclaration:exit'() {
    this.inStateVariableDeclaration = false
  }

  VariableDeclaration(node) {
    if (!this.inStateVariableDeclaration) {
      // if strict is enabled, non-state vars should not start with leading underscore
      if (this.isStrict) {
        this.validateName(node, false)
      }
      return
    }

    const isPrivate = node.visibility === 'private'
    const isInternal = node.visibility === 'internal' || node.visibility === 'default'
    const shouldHaveLeadingUnderscore = isPrivate || isInternal
    this.validateName(node, shouldHaveLeadingUnderscore)
  }

  validateName(node, shouldHaveLeadingUnderscore) {
    if (node.name === null) {
      return
    }

    if (naming.hasLeadingUnderscore(node.name) !== shouldHaveLeadingUnderscore) {
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

module.exports = PrivateVarsLeadingUnderscoreChecker
