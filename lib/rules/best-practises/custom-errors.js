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
    if (node.name === 'solidity') {
      if (!semver.intersects(node.value, '>=0.8.4')) {
        this.skip = true
      }
    }
  }

  FunctionCall(node) {
    if (this.skip) return
    let errorStr = ''
    if (node.expression.name === 'require') {
      errorStr = 'require'
    } else if (
      node.expression.name === 'revert' &&
      (node.arguments.length === 0 || node.arguments[0].type === 'StringLiteral')
    ) {
      errorStr = 'revert'
    }

    if (errorStr !== '') {
      this.error(node, `Use Custom Errors instead of ${errorStr} statements`)
    }
  }
}

module.exports = CustomErrorsChecker
