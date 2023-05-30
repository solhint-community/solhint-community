const BaseChecker = require('../base-checker')
const { isFallbackFunction } = require('../../common/ast-types')

const ruleId = 'no-empty-blocks'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Code block has zero statements inside. Some common exceptions apply.',
    category: 'Best Practise Rules',
    examples: {
      bad: [
        { description: 'empty block for an if statement', code: 'if(condition) {}' },
        { description: 'empty contract', code: 'contract Foo {}' },
        {
          description: 'empty block in constructor without parent initialization',
          code: 'constructor () {}',
        },
      ],
      good: [
        { description: 'empty fallback function', code: 'fallback () external {}' },
        {
          description: 'empty constructor with member initialization list',
          code: 'constructor(uint param) Foo(param) Bar(param*2) {}',
        },
      ],
    },
  },

  isDefault: false,
  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class NoEmptyBlocksChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
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

    const isFallbackFunctionBlock = isFallbackFunction(node.parent)
    if (isFallbackFunctionBlock) {
      // ignore empty blocks in fallback functions
      return
    }
    this._validateChildrenCount(node, 'statements')
  }

  StructDefinition(node) {
    this._validateChildrenCount(node, 'members')
  }

  EnumDefinition(node) {
    this._validateChildrenCount(node, 'members')
  }

  AssemblyBlock(node) {
    if (!this.isAssemblyFor) {
      this._validateChildrenCount(node, 'operations')
    }
  }

  AssemblyFor(node) {
    this.isAssemblyFor = true
    const operationsCount = node.body.operations.length
    if (operationsCount === 0) this._error(node)
  }

  'AssemblyFor:exit'() {
    this.isAssemblyFor = false
  }

  _validateChildrenCount(node, children) {
    const blockChildrenCount = node[children].length

    if (blockChildrenCount === 0) {
      this._error(node)
    }
  }

  _validateContractPartsCount(node) {
    const contractPartCount = node.subNodes.length

    if (contractPartCount === 0) {
      this._error(node)
    }
  }

  _error(node) {
    this.warn(node, 'Code contains empty blocks')
  }
}

module.exports = NoEmptyBlocksChecker
