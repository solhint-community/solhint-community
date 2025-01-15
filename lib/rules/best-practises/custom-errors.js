const semver = require('semver')
const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'error'

const ruleId = 'custom-errors'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Enforces the use of Custom Errors over Require and Revert statements',
    category: 'Best Practise Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
    ],
    notes: [
      {
        note: 'This rule is automatically disabled for files whose pragma directive disallows versions where custom errors are available',
      },
      {
        note: 'The rule does not analyze revert calls within assembly blocks',
      },
      {
        note: 'Limitation: The rule accepts any function call as a custom error. It does not verify if the function is a valid custom error constructor.',
      },
      {
        note: 'Complex expressions are disallowed as the second argument to `require` to maintain clarity and ensure that a straightforward custom error is used. This avoids potential issues where the expression could resolve to a string or other unintended types.',
      },
    ],
    examples: {
      good: [
        {
          description: 'Use of Custom Errors',
          code: 'revert CustomErrorFunction();',
        },
        {
          description: 'Use of Custom Errors with arguments',
          code: 'revert CustomErrorFunction({ msg: "Insufficient Balance" });',
        },
        {
          description: 'Use of require with a custom error function',
          code: 'require(cond, CustomError());',
        },
      ],
      bad: [
        {
          description: 'Use of require with a string message',
          code: 'require(userBalance >= availableAmount, "Insufficient Balance");',
        },
        {
          description: 'Use of plain revert statement',
          code: 'revert();',
        },
        {
          description: 'Use of revert statement with message',
          code: 'revert("Insufficient Balance");',
        },
        {
          description: 'Use of require with a complex expression instead of a custom error',
          code: 'require(condition, x > 5 ? "Too high" : "Too low");',
        },
        {
          description: 'Incorrect custom error syntax that will fail compilation',
          code: 'revert(CustomError());  // Use "revert CustomError();" instead',
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: DEFAULT_SEVERITY,

  schema: null,
}

class CustomErrorsChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
    this.skip = false
  }

  PragmaDirective(node) {
    if (node.name === 'solidity' && !semver.intersects(node.value, '>=0.8.4')) {
      this.skip = true
    }
  }

  FunctionCall(node) {
    if (this.skip) return

    const exprName = node.expression.name

    if (exprName === 'revert') {
      // If revert is used as a function call (incorrect syntax), skip it
      // The compiler will catch this error
      if (node.type === 'FunctionCall' && node.expression.type === 'FunctionCall') return

      if (node.arguments.length === 0) {
        this.error(node, 'Use custom errors instead of empty revert statements')
      } else if (node.arguments[0].type === 'StringLiteral') {
        this.error(node, 'Use custom errors instead of string messages in revert')
      }
      return
    }

    if (exprName === 'require') {
      if (node.arguments.length < 2) {
        this.error(node, 'Provide a custom error as the second argument to require')
      } else if (node.arguments[1].type !== 'FunctionCall') {
        this.error(
          node,
          'The second argument of require should be a custom error. Avoid using string literals or complex expressions'
        )
      }
    }
  }
}

module.exports = CustomErrorsChecker
