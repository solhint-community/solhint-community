const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const ruleId = 'no-comparison-in-expression'
const DEFAULT_SEVERITY = 'warn'

const meta = {
  type: 'best-practises',
  docs: {
    description:
      'Disallows comparisons used as standalone expression statements (i.e. no assigned result).',
    category: 'Best Practise Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
    ],
    examples: {
      good: [
        {
          description: 'Comparison used in control-flow statement (if).',
          code: 'if (foo == bar) { doSomething(); }',
        },
        {
          description: 'Comparison used in a require statement.',
          code: 'require(foo != 0, "foo must not be zero");',
        },
        {
          description: 'Comparison used in ternary operation',
          code: 'return foo == bar ? foo : bar;',
        },
        {
          description: 'Comparison used in modifier',
          code: 'modifier whenEqual(uint a, uint b) { require(a == b); _; }',
        },
      ],
      bad: [
        {
          description: 'Comparison as standalone statement in function.',
          code: 'foo == bar;',
        },
        {
          description: 'Comparison as expression with no effect.',
          code: '42 != someVar;',
        },
        {
          description: 'Multiple comparisons in expression statement',
          code: '(foo == bar) != (bar == baz);',
        },
      ],
    },
  },
  recommended: false,
  defaultSetup: DEFAULT_SEVERITY,
  schema: null,
}

class NoComparisonInExpressionChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  /**
   * The parser calls `ExpressionStatement(node)` when it encounters
   * a statement like `something;`. We can check if `something` is a
   * BinaryOperation with operator == or !=.
   */
  ExpressionStatement(node) {
    if (node.expression.type === 'BinaryOperation') {
      const { operator } = node.expression
      if (operator === '==' || operator === '!=') {
        this.error(
          node,
          'Avoid using a comparison (== or !=) as a standalone expression; it has no effect.'
        )
      }
    }
  }
}

module.exports = NoComparisonInExpressionChecker
