const BaseChecker = require('../base-checker')
const { isMixedCase } = require('../../common/identifier-naming')

const ruleId = 'var-name-mixedcase'
const meta = {
  type: 'naming',

  docs: {
    description: `Identifier name must be in mixedCase.`,
    category: 'Style Guide Rules',
    examples: {
      good: [
        {
          description: 'state variable in mixedCase',
          code: 'contract { uint public fooBar; }',
        },
        {
          description: 'stack variable in mixedCase',
          code: `contract {
function foo() {
  uint fooStack;
}
}`,
        },
        {
          description: 'function variable in mixedCase',
          code: `contract {
function foo(uint fooParam) { }
}`,
        },
        {
          description: 'event parameter in mixedCase',
          code: `contract {
event Foo(uint fooParam) { }
}`,
        },
      ],
      bad: [
        {
          description: 'name in CapWords',
          code: 'contract { uint public FooBar; }',
        },
        {
          description: 'name in UPPER_SNAKE_CASE',
          code: 'contract { uint public FOO_BAR; }',
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class VarNameMixedcaseChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  VariableDeclaration(node) {
    if (!node.isDeclaredConst && !node.isImmutable) {
      this.validateVariablesName(node)
    }
  }

  validateVariablesName(node) {
    if (!isMixedCase(node.name)) {
      this.error(node, 'Variable name must be in mixedCase')
    }
  }
}

module.exports = VarNameMixedcaseChecker
