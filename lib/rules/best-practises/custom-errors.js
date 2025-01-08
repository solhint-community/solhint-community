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
          description: 'Use of require statement',
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
      if (this.isRevertInvalid(node)) {
        this.error(node, 'Use Custom Errors instead of revert statements')
      }
      return
    }

    if (exprName === 'require') {
      if (this.isRequireInvalid(node)) {
        this.error(node, 'Use Custom Errors instead of require statements')
      }
    }
  }

  /**
   * Determines if a revert statement is invalid (i.e., uses a string or no arguments).
   * @param {Object} node - The AST node representing the function call.
   * @returns {boolean} - True if the revert statement should be flagged.
   */
  isRevertInvalid(node) {
    return node.arguments.length === 0 || node.arguments[0].type === 'StringLiteral'
  }

  /**
   * Determines if a require statement is invalid (i.e., lacks a custom error as the second argument).
   * @param {Object} node - The AST node representing the function call.
   * @returns {boolean} - True if the require statement should be flagged.
   */
  isRequireInvalid(node) {
    return node.arguments.length < 2 || node.arguments[1].type !== 'FunctionCall'
  }
}

module.exports = CustomErrorsChecker
