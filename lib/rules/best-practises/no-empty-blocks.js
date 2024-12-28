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
      ],
      good: [
        { description: 'empty receive function', code: 'receive () external {}' },
        { description: 'empty fallback function', code: 'fallback () external {}' },
        {
          description: 'empty constructor with parent init',
          code: 'constructor(uint x) Base(x) {}',
        },
        { description: 'empty modifier with _ allowed', code: 'modifier onlyOwner { _; }' },
        { description: 'empty try-catch block allowed', code: 'try foo() {} catch {}' },
      ],
    },
    notes: [
      {
        note: 'Empty constructor is ignored if the constructor has parent-initialization modifiers.',
      },
      {
        note: 'Use allowEmptyModifiers / allowEmptyCatch to skip warnings for underscore-only modifiers / empty catch blocks.',
      },
    ],
  },

  recommended: true,
  defaultSetup: ['warn', { allowEmptyModifiers: false, allowEmptyCatch: false }],
  schema: {
    type: 'object',
    properties: {
      allowEmptyModifiers: { type: 'boolean' },
      allowEmptyCatch: { type: 'boolean' },
    },
  },
}

class NoEmptyBlocksChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)

    const [, options = {}] = Array.isArray(this.reporter?.config?.[ruleId])
      ? this.reporter.config[ruleId]
      : meta.defaultSetup

    this.allowEmptyModifiers = options.allowEmptyModifiers || false
    this.allowEmptyCatch = options.allowEmptyCatch || false
  }

  ContractDefinition(node) {
    this.isAssemblyFor = false
    this._validateContractPartsCount(node)
  }

  Block(node) {
    // Skip constructor with modifiers
    if (node.parent.isConstructor && node.parent.modifiers && node.parent.modifiers.length > 0) {
      return
    }

    // Skip fallback and receive
    if (isFallbackFunction(node.parent) || isReceiveFunction(node.parent)) {
      return
    }

    if (node.parent.type === 'ModifierDefinition') {
      if (this.allowEmptyModifiers) {
        if (!this._hasUnderscore(node)) {
          this._error(node)
        }
      } else {
        this._error(node)
      }
      return
    }

    if (node.parent.type === 'CatchClause') {
      if (!this.allowEmptyCatch) {
        this._error(node)
      }
      return
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

  /**
   * Checks if block has a statement recognized by the parser as `_;`.
   */
  _hasUnderscore(node) {
    return node.statements.some((stmt) => {
      if (stmt.type === 'PlaceholderStatement') {
        return true
      }
      if (
        stmt.type === 'ExpressionStatement' &&
        stmt.expression?.type === 'Identifier' &&
        stmt.expression?.name === '_'
      ) {
        return true
      }
      return false
    })
  }

  _error(node) {
    this.warn(node, 'Code contains empty blocks')
  }
}

module.exports = NoEmptyBlocksChecker
