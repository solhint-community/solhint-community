const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')
const { isCapWords, isUpperSnakeCase, isMixedCase } = require('../../common/identifier-naming')

const DEFAULT_SEVERITY = 'warn'
const DEFAULT_OPTION = {
  ignorePublicFunctions: false,
  ignoreExternalFunctions: false,
  ignoreInternalFunctions: false,
  ignorePrivateFunctions: false,
  ignoreModifiers: false,
  ignoreImmutables: false,
  ignoreConstants: false,
  ignoreVariables: false,
  ignoreEnums: false,
  ignoreStructs: false,
  ignoreEvents: false,
}

const ruleId = 'style-guide-casing'
const meta = {
  type: 'naming',

  docs: {
    description: 'Check identifier and type name casing conforms to the style guide',
    category: 'Style Guide Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
      {
        description:
          'An object with keys `ignore{{Public,External,Internal,Private}Functions,Contracts,Libraries,Interfaces,Modifiers,Immutables,Constants,Variables,Enums,Structs,Events}` which, when true, disables the rule for that node. You might want to use `{ignoreExternalFunctions: true, ignorePublicFunctions: true}` when also enabling `foundry-test-functions`, for example',
        default: JSON.stringify(DEFAULT_OPTION),
      },
    ],
    examples: {
      good: [
        {
          description: 'immutable/constant var name is capitalized snake case',
          code: 'uint private immutable WAD_DECIMALS = 18',
        },
        {
          description: 'constant var name is capitalized snake case',
          code: 'uint private constant WAD_DECIMALS = 18',
        },
        {
          description: 'function/modifier name in mixedCase',
          code: 'function foo_bar() {}',
        },
        {
          description: 'contract/enum/struct name in CapWords',
          code: 'contract Foo {}',
        },
      ],
      bad: [
        {
          description: 'immutable/constant var name in lowercase snake_case',
          code: 'uint private immutable wad_decimals = 18',
        },
        {
          description: 'function/modifier name in snake case',
          code: 'function foo_bar() {}',
        },
        {
          description: 'function/modifier name in upper snake case',
          code: 'modifier FOO_BAR() {}',
        },
        {
          description: 'mutable var name in upper snake case',
          code: 'uint private FOO_BAR;',
        },
        {
          description: 'contract name not in CapWords',
          code: 'contract foo {}',
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: [DEFAULT_SEVERITY, DEFAULT_OPTION],

  schema: {
    type: 'object',
    properties: {
      ignorePublicFunctions: {
        type: 'boolean',
      },
      ignoreExternalFunctions: {
        type: 'boolean',
      },
      ignoreInternalFunctions: {
        type: 'boolean',
      },
      ignorePrivateFunctions: {
        type: 'boolean',
      },
      ignoreModifiers: {
        type: 'boolean',
      },
      ignoreImmutables: {
        type: 'boolean',
      },
      ignoreConstants: {
        type: 'boolean',
      },
      ignoreVariables: {
        type: 'boolean',
      },
      ignoreEnums: {
        type: 'boolean',
      },
      ignoreContracts: {
        type: 'boolean',
      },
      ignoreInterfaces: {
        type: 'boolean',
      },
      ignoreLibraries: {
        type: 'boolean',
      },
      ignoreStructs: {
        type: 'boolean',
      },
      ignoreEvents: {
        type: 'boolean',
      },
    },
  },
}

class StyleGuideCasingChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  ModifierDefinition(node) {
    if (!isMixedCase(node.name)) {
      this.error(node, 'Modifier name must be in mixedCase')
    }
  }

  FunctionDefinition(node) {
    if (!isMixedCase(node.name) && !node.isConstructor) {
      this.error(node, 'Function name must be in mixedCase')
    }
  }

  VariableDeclaration(node) {
    if (node.isDeclaredConst) {
      if (!isUpperSnakeCase(node.name)) {
        this.error(node, 'Constant name must be in capitalized SNAKE_CASE')
      }
    } else if (node.isImmutable) {
      if (!isUpperSnakeCase(node.name)) {
        this.error(node, 'Immutable variables name should be capitalized SNAKE_CASE')
      }
    } else {
      this.validateMutableName(node)
    }
  }

  StructDefinition(node) {
    this.validateCapWords(node, 'struct')
  }

  ContractDefinition(node) {
    this.validateCapWords(node, node.kind)
  }

  EnumDefinition(node) {
    this.validateCapWords(node, 'enum')
  }

  EventDefinition(node) {
    this.validateCapWords(node, 'event')
  }

  validateCapWords(node, type) {
    if (!isCapWords(node.name)) {
      this.error(node, `${type} name must be in CapWords`)
    }
  }

  validateMutableName(node) {
    if (!isMixedCase(node.name)) {
      this.error(node, 'Variable name must be in mixedCase')
    }
  }
}

module.exports = StyleGuideCasingChecker
