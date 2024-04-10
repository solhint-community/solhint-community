const BaseChecker = require('../base-checker')
const { contractWith, multiLine } = require('../../../test/common/contract-builder')

const ruleId = 'payable-fallback'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'When fallback is not payable you will not be able to receive ethers.',
    category: 'Best Practise Rules',
    examples: {
      good: [
        {
          description: 'Fallback is payable',
          code: contractWith('function () public payable {}'),
        },
        {
          description: 'Fallback is not payable, but theres a receive function',
          code: contractWith(multiLine('function () public {}', 'receive() public{}')),
        },
      ],
      bad: [
        {
          description: 'Fallback is not payable and theres no receive function',
          code: contractWith('function () public {}'),
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class PayableFallbackChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  FunctionDefinition(node) {
    if (isFallbackFunction(node)) {
      if (node.stateMutability !== 'payable') {
        this.warn(node, 'When fallback is not payable you will not be able to receive ether')
      }
    }
  }
}

module.exports = PayableFallbackChecker
