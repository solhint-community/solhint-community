const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'
const DEFAULT_MAX_UNNAMED = 1

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
      {
        description:
          'An integer specifying the max amount of return values a function can have while still allowing them to remain anonymous',
        default: JSON.stringify(DEFAULT_MAX_UNNAMED),
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

  recommended: true,
  defaultSetup: [DEFAULT_SEVERITY, DEFAULT_MAX_UNNAMED],

  schema: { type: 'integer', minimum: 0 },
}

class NamedReturnValuesChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta)
    this.maxAnonymousReturnValues = config
      ? config.getNumber(ruleId, DEFAULT_MAX_UNNAMED)
      : DEFAULT_MAX_UNNAMED
  }

  FunctionDefinition(node) {
    if (node.returnParameters?.length > this.maxAnonymousReturnValues) {
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
