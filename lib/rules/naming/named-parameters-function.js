const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'
const DEFAULT_MAX_POSITIONAL_ARGUMENTS = 3

const ruleId = 'named-parameters-function'
const meta = {
  type: 'naming',

  docs: {
    description:
      'Enforce using named parameters when invoking a function with more than N arguments',
    category: 'Best Practise Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
      {
        description:
          'A Number specifying the max amount of arguments a function can have while still allowing positional arguments.',
        default: JSON.stringify(DEFAULT_MAX_POSITIONAL_ARGUMENTS),
      },
    ],
    examples: {
      good: [
        {
          description: 'Calling a function with few positional arguments',
          code: 'foo(10,200)',
        },
        {
          description: 'Calling a function with few named arguments',
          code: 'foo({amount: 10, price: 200})',
        },
        {
          description: 'Calling a function with many named arguments',
          code: `
          foo({
            amount: 10,
            price: 200,
            recipient: 0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990,
            token: 0xdac17f958d2ee523a2206206994597c13d831ec7
          })`,
        },
      ],
      bad: [
        {
          description: 'Calling a function with many positional arguments',
          code: `
          foo(
             10,
             200,
             0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990,
             0xdac17f958d2ee523a2206206994597c13d831ec7
          )`,
        },
        {
          description: 'With a config value of 0, using positional arguments in _any_ capacity',
          code: `foo(10)`,
        },
      ],
    },
  },

  isDefault: false,
  recommended: false,
  defaultSetup: [DEFAULT_SEVERITY, DEFAULT_MAX_POSITIONAL_ARGUMENTS],

  schema: { type: 'integer', minimum: 1 },
}

class FunctionNamedParametersChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta)
    const configValue = config && config.getNumber(ruleId, DEFAULT_MAX_POSITIONAL_ARGUMENTS)
    this.maxPositionalArguments = configValue > 0 ? configValue : DEFAULT_MAX_POSITIONAL_ARGUMENTS
  }

  FunctionCall(node) {
    if (node.names.length === 0) {
      if (
        node.expression.type === 'MemberAccess' &&
        node.expression.expression.type === 'Identifier' &&
        node.expression.expression.name === 'abi'
      ) {
        // we're dealing with a call to abi.{encode*, decode} whose arguments cannot have names
        return
      }
      if (node.arguments.length > this.maxPositionalArguments) {
        this.error(
          node,
          `Call to function with arity > ${this.maxPositionalArguments} is using positional arguments. Use named arguments instead.`
        )
      }
    }
  }
}

module.exports = FunctionNamedParametersChecker
