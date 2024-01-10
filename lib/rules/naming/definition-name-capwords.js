const BaseChecker = require('../base-checker')
const { isCapWords } = require('../../common/identifier-naming')

const ruleId = 'definition-name-capwords'
const meta = {
  type: 'naming',

  docs: {
    description: 'Contract, interface, library, struct, enum and event names must be in CapWords.',
    category: 'Style Guide Rules',
    examples: {
      good: [
        {
          description: 'contract name starts with a uppercase letter ',
          code: 'contract Contract{}',
        },
        {
          description: 'interface name starts with a uppercase letter ',
          code: 'interface Interface{}',
        },
        {
          description: 'library name starts with a uppercase letter ',
          code: 'library Library{}',
        },
        {
          description:
            'contract name starts with a uppercase letter and uses uppercase letters to divide words ',
          code: 'contract FunContract{}',
        },
        {
          description:
            'event name starts with a uppercase letter and uses uppercase letters to divide words ',
          code: 'event FunEvent{}',
        },
        {
          description:
            'enum name starts with a uppercase letter (enum values are not checked by this rule)',
          code: 'enum Enum{ Value, OtherValue }',
        },
        {
          description:
            'struct name starts with a uppercase letter and uses uppercase letters to divide words ',
          code: 'struct FunStruct{}',
        },
      ],
      bad: [
        {
          description: 'contract name starts with a lowercase letter',
          code: 'contract funContract{}',
        },
        {
          description: 'contract name uses underscores to separate words',
          code: 'contract Fun_contract{}',
        },
        {
          description: 'enum name uses underscores to separate words ',
          code: 'enum Fun_enum{ Value, OtherValue }',
        },
        {
          description: 'event name uses underscores to separate words ',
          code: 'event Fun_event()',
        },
        {
          description: 'struct name starts with a lowercase letter',
          code: 'struct funStruct{}',
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: 'error',

  schema: null,
}

class DefinitionNameCapWordsChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  StructDefinition(node) {
    this.validateName(node, 'struct')
  }

  ContractDefinition(node) {
    this.validateName(node, node.kind)
  }

  EnumDefinition(node) {
    this.validateName(node, 'enum')
  }

  EventDefinition(node) {
    this.validateName(node, 'event')
  }

  validateName(node, type) {
    if (!isCapWords(node.name)) {
      this.error(node, `${type} name must be in CapWords`)
    }
  }
}

module.exports = DefinitionNameCapWordsChecker
