const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'

const ruleId = 'named-return-values'
const meta = {
  type: 'naming',

  docs: {
    description: `Ensure function return parameters are named`,
    category: 'Style Guide Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
    ],
    examples: {
      good: [
        {
          description: 'Function definition with named return values',
          code: 'function checkBalance(address wallet) external view returns(uint256 retBalance) {}',
        },
      ],
      bad: [
        {
          description: 'Function definition with unnamed return values',
          code: 'function checkBalance(address wallet) external view returns(uint256) {}',
        },
      ],
    },
  },

  isDefault: false,
  recommended: false,
  defaultSetup: DEFAULT_SEVERITY,

  schema: null,
}

class NamedReturnValuesChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  FunctionDefinition(node) {
    if (node.returnParameters) {
      let index = 0
      for (const returnValue of node.returnParameters) {
        let ordinal = `${index + 1}-th`
        if (index === 0) {
          ordinal = 'first'
        } else if (index === 1) {
          ordinal = 'second'
        } else if (index === 2) {
          ordinal = 'third'
        }
        if (!returnValue.name) {
          this.error(node, `${ordinal} return value does not have a name`)
        }
        index++
      }
    }
  }
}

module.exports = NamedReturnValuesChecker
