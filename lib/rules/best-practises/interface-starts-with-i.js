const BaseChecker = require('../base-checker')

const ruleId = 'interface-starts-with-i'
const meta = {
  type: 'naming',
  docs: {
    description: 'Interfaces name should start with `I`',
    category: 'Style Guide Rules',
    examples: {
      good: [
        {
          description: 'Interface name starts with I',
          code: `interface IFoo { function foo () external; }`,
        },
      ],
      bad: [
        {
          description: 'Interface name doesnt start with I',
          code: `interface Foo { function foo () external; }`,
        },
      ],
    },
  },
  isDefault: true,
  recommended: true,
  defaultSetup: 'error',
  schema: [],
}

class InterfaceStartsWithIChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  ContractDefinition(node) {
    if (node.kind !== 'interface') return
    const interfaceName = node.name

    if (!interfaceName.startsWith('I')) {
      this.error(node, `Interface name '${interfaceName}' must start with "I"`)
    }
  }
}

module.exports = InterfaceStartsWithIChecker
