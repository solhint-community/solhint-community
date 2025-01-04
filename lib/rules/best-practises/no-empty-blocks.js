const BaseChecker = require('../base-checker')
const { isFallbackFunction, isReceiveFunction } = require('../../common/ast-types')

const ruleId = 'no-empty-blocks'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Code block has zero statements inside. Some common exceptions apply.',
    category: 'Best Practise Rules',
    options: [
      { description: 'Allow empty modifiers containing only _', default: false },
      { description: 'Allow empty try-catch blocks', default: false },
    ],
    examples: {
      bad: [
        { description: 'empty block for an if statement', code: 'if(condition) {}' },
        { description: 'empty contract', code: 'contract Foo {}' },
        {
          description: 'empty block in constructor without parent initialization',
          code: 'constructor () {}',
        },
        {
          description: 'empty modifier with only _ (when allowEmptyModifiers is false)',
          code: 'modifier onlyOwner { _; }',
        },
        {
          description: 'empty modifier with only _ (when allowEmptyModifiers is true)',
          code: 'modifier onlyOwner { _; }',
        },
        { description: 'empty catch block', code: 'catch Error(string memory reason) {}' },
        { description: 'empty try block', code: 'try {}' },
      ],
      good: [
        { description: 'empty receive function', code: 'receive () external {}' },
        { description: 'empty fallback function', code: 'fallback () external {}' },
        {
          description: 'empty constructor with member initialization list',
          code: 'constructor(uint param) Foo(param) Bar(param*2)',
        },
        { description: 'empty modifier with _ allowed', code: 'modifier onlyOwner { _; }' },
      ],
    },
    notes: [
      {
        note: 'The rule ignores an empty constructor by default as long as parent contracts are being initialized. See "Empty Constructor" example.',
      },
      {
        note: 'Use allowEmptyModifiers / allowEmptyCatch to skip warnings for underscore-only modifiers / empty catch blocks.',
      },
    ],
  },

  recommended: true,
  defaultSetup: [
    'warn',
    {
      allowEmptyModifiers: false,
      allowEmptyCatch: false,
      allowEmptyTry: false,
    },
  ],
  schema: {
    type: 'object',
    properties: {
      allowEmptyModifiers: { type: 'boolean' },
      allowEmptyCatch: { type: 'boolean' },
      allowEmptyTry: { type: 'boolean' },
    },
  },
}

class NoEmptyBlocksChecker extends BaseChecker {
  constructor(reporter, config) {
    super(reporter, ruleId, meta)
    const ruleConfig = config || this.reporter?.config?.[ruleId] || meta.defaultSetup

    const [, options = {}] = Array.isArray(ruleConfig) ? ruleConfig : [ruleConfig, {}]

    this.allowEmptyModifiers = Boolean(options.allowEmptyModifiers)
    this.allowEmptyCatch = Boolean(options.allowEmptyCatch)
    this.allowEmptyTry = Boolean(options.allowEmptyTry)
  }

  ContractDefinition(node) {
    this.isAssemblyFor = false
    this._validateContractPartsCount(node)
  }

  Block(node) {
    // ignore empty constructor body when it's being defined to call a parent
    // constructor
    if (node.parent.isConstructor && node.parent.modifiers.length > 0) {
      return
    }

    // Skip fallback and receive
    if (isFallbackFunction(node.parent) || isReceiveFunction(node.parent)) {
      return
    }

    // Handle modifiers with _
    if (node.parent.type === 'ModifierDefinition') {
      if (node.statements.length === 0) {
        this._error(node)
        return
      }
      if (this.allowEmptyModifiers) {
        return
      }
      if (node.statements.length === 1 && !this.allowEmptyModifiers) {
        this._error(node)
      }
      return
    }

    // Handle try blocks
    if (node.parent.type === 'TryStatement') {
      if (this.allowEmptyTry && node.statements.length === 0) {
        return
      }
    }

    // Handle catch blocks
    if (node.parent.type === 'CatchClause') {
      if (this.allowEmptyCatch && node.statements.length === 0) {
        return
      }
    }

    if (node.statements.length === 0) {
      this._error(node)
    }
  }

  AssemblyBlock(node) {
    if (!this.isAssemblyFor) {
      this._validateChildrenCount(node, 'operations')
    }
  }

  AssemblyFor(node) {
    this.isAssemblyFor = true
    if (node.body.operations.length === 0) {
      this._error(node)
    }
  }

  'AssemblyFor:exit'() {
    this.isAssemblyFor = false
  }

  StructDefinition(node) {
    this._validateChildrenCount(node, 'members')
  }

  EnumDefinition(node) {
    this._validateChildrenCount(node, 'members')
  }

  _validateContractPartsCount(node) {
    if (node.subNodes.length === 0) {
      this._error(node)
    }
  }

  _validateChildrenCount(node, childFieldName) {
    if (node[childFieldName].length === 0) {
      this._error(node)
    }
  }

  _error(node) {
    this.warn(node, 'Code contains empty blocks')
  }
}

module.exports = NoEmptyBlocksChecker
