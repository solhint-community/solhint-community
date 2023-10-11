const BaseChecker = require('../base-checker')
const { isUpperSnakeCase } = require('../../common/identifier-naming')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'

const ruleId = 'immutable-name-snakecase'
const meta = {
  type: 'naming',

  docs: {
    description: 'Check Immutable variables are SNAKE_CASE.',
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
          description: 'immutable var name is capitalized snake case',
          code: 'uint private immutable WAD_DECIMALS = 18',
        },
      ],
      bad: [
        {
          description: 'lowercase snake case',
          code: 'uint private immutable wad_decimals = 18',
        },
        {
          description: 'camelcase',
          code: 'uint private immutable wadDecimals = 18',
        },
      ],
    },
  },

  isDefault: false,
  recommended: false,
  defaultSetup: [DEFAULT_SEVERITY],

  schema: null,
}

class ImmutableNameSnakeCaseChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  VariableDeclaration(node) {
    if (node.isImmutable) {
      if (!isUpperSnakeCase(node.name)) {
        this.error(node, 'Immutable variables name should be capitalized SNAKE_CASE')
      }
    }
  }
}

module.exports = ImmutableNameSnakeCaseChecker
