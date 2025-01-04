const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const ruleId = 'no-boolean-compare'
const DEFAULT_SEVERITY = 'error'

const meta = {
  type: 'best-practises',
  docs: {
    description: 'Disallows comparison to true or false keywords.',
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
          description: 'Directly use the boolean variable',
          code: 'if (foo) { doSomething(); }',
        },
        {
          description: 'Use the negated boolean variable',
          code: 'if (!bar) { doSomething(); }',
        },
      ],
      bad: [
        {
          description: 'Compare boolean variable to true',
          code: 'if (foo == true) { doSomething(); }',
        },
        {
          description: 'Compare boolean variable to false',
          code: 'if (bar == false) { doSomething(); }',
        },
      ],
    },
  },
  recommended: false,
  defaultSetup: DEFAULT_SEVERITY,
  schema: null,
}

function isLiteralBool(node) {
  console.error('node', node)
  // Old "BooleanLiteral" style or new "Literal" with kind=bool
  if (node.type === 'BooleanLiteral') {
    return true // older solidity-parser versions
  }
  return false
}

class NoBooleanCompareChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  /**
   * Visit BinaryOperation nodes in the AST.
   * E.g. `a == b`, `a != b`
   */
  BinaryOperation(node) {
    const operator = node.operator
    if (operator !== '==' && operator !== '!=') return

    const left = node.left
    const right = node.right

    if (isLiteralBool(left) || isLiteralBool(right)) {
      this.error(node, 'Avoid comparing boolean expressions to true or false.')
    }
  }
}

module.exports = NoBooleanCompareChecker
