const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const IMPLICIT_TO_EXPLICIT = {
  uint: 'uint256',
  int: 'int256',
  ufixed: 'ufixed128x18',
  fixed: 'fixed128x18',
}
const DEFAULT_SEVERITY = 'warn'

const ruleId = 'explicit-types'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Enforce explicit types (like uint256) over implicit ones(like uint).',
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
          description: 'using a type that explicitly states the variable size',
          code: 'uint256 public variableName',
        },
        {
          description: 'using a type that explicitly states the variable size',
          code: 'fixed128x18 public foo',
        },
        {
          description: 'using a type that explicitly states the variable size',
          code: 'uint256 public variableName = uint256(5)',
        },
      ],
      bad: [
        {
          description: 'using the shorter alias for a type, which is implicit about its size',
          code: 'uint public variableName',
        },
        {
          description: 'using the shorter alias for a type, which is implicit about its size',
          code: 'fixed public foo',
        },
        {
          description: 'using the shorter alias for a type, which is implicit about its size',
          code: 'uint public variableName = uint(5)',
        },
      ],
    },
  },

  isDefault: false,
  recommended: false,
  fixable: true,
  defaultSetup: [DEFAULT_SEVERITY],

  schema: {},
}

class ExplicitTypesChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
    // TODO: I had to add the set because the FunctionCall callback was being
    // called multiple times for the same cast, it's possible that its a bug
    // with the AST visitor. Do a PoC and ask for help
    this.reported = new Set()
  }

  VariableDeclaration(node) {
    this.validateTypeName(node, node.typeName)
  }

  FunctionCall(node) {
    if (node.expression.type === 'ElementaryTypeName') {
      this.validateTypeName(node, node.expression)
    }
  }

  ArrayTypeName(node) {
    if (node.baseTypeName.type === 'ElementaryTypeName') {
      this.validateTypeName(node, node.baseTypeName)
    }
  }

  Mapping(node) {
    if (node.keyType.type === 'ElementaryTypeName') {
      this.validateTypeName(node, node.keyType)
    }
    if (node.valueType.type === 'ElementaryTypeName') {
      this.validateTypeName(node, node.valueType)
    }
  }

  validateTypeName(node, typeName) {
    if (Object.keys(IMPLICIT_TO_EXPLICIT).includes(typeName.name)) {
      if (!this.reported.has(node)) {
        this.error(
          node,
          `prefer use of explicit type ${IMPLICIT_TO_EXPLICIT[typeName.name]} over ${
            typeName.name
          }`,
          (fixer) => fixer.replaceTextRange(typeName.range, IMPLICIT_TO_EXPLICIT[typeName.name])
        )
        this.reported.add(node)
      }
    }
  }
}

module.exports = ExplicitTypesChecker
