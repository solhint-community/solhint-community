const _ = require('lodash')
const BaseChecker = require('../base-checker')
const TreeTraversing = require('../../common/tree-traversing')

const { findParentType, findFirstParent } = new TreeTraversing()

const ruleId = 'no-unused-vars'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Variable "name" is unused.',
    category: 'Best Practise Rules',
  },

  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class NoUnusedVarsChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }

  Block(node) {
    VarUsageScope.activate(node)
    // skip functions with an empty block, no-empty-blocks takes care of that
    // in cases where it matters, and they can be used to document what exactly
    // the function is ignoring? I think. The rule worked like that before I
    // took it apart
    if (node?.parent?.type === 'FunctionDefinition' && _.size(node.statements) !== 0) {
      // filters 'payable' keyword as name when defining function like this:
      // function foo(address payable) public view {}
      node.parent.parameters
        .filter((parameter) => {
          if (
            parameter.typeName.name === 'address' &&
            parameter.typeName.stateMutability === null &&
            parameter.name === 'payable'
          )
            return null
          else return parameter.name
        })

        .forEach(({ name, typeName }) => {
          node.funcScope.addVar(typeName, name)
        })
    }
  }

  'Block:exit'(node) {
    node.funcScope.unusedVariables().forEach(this._error.bind(this))
  }

  VariableDeclarationStatement(node) {
    // skip the definitions of function parameters, they're taken care of by
    // Block visitor
    if (node.parent.type === 'FunctionDefinition') return
    node.variables.forEach((variable) => this._addVariable(variable))
  }

  AssemblyLocalDefinition(node) {
    node.names.forEach((variable) => this._addVariable(variable))
  }

  Identifier(node) {
    this._trackVarUsage(node)
  }

  AssemblyCall(node) {
    const firstChild = node.arguments.length === 0 && node

    if (firstChild) {
      firstChild.name = firstChild.functionName
      this._trackVarUsage(firstChild)
    }
  }

  _addVariable(idNode) {
    const funcScope = VarUsageScope.of(idNode)

    if (idNode && funcScope) {
      funcScope.addVar(idNode, idNode.name)
    }
  }

  _trackVarUsage(node) {
    if (this._isVarDeclaration(node)) return
    let funcScope = VarUsageScope.of(node)
    let parent = node
    // if I can't find the name here, search upwards for a scope that might
    // have the name
    while (funcScope && !funcScope.hasVar(node.name)) {
      parent = parent.parent
      funcScope = VarUsageScope.of(parent)
    }
    funcScope.trackVarUsage(node.name)
  }

  _error({ name, node }) {
    this.warn(node, `Variable "${name}" is unused`)
  }

  _isVarDeclaration(node) {
    const variableDeclaration = findParentType(node, 'VariableDeclaration')
    const identifierList = findParentType(node, 'IdentifierList')
    const parameterList = findParentType(node, 'ParameterList')
    const assemblyLocalDefinition = findParentType(node, 'AssemblyLocalDefinition')

    // otherwise `let t := a` doesn't track usage of `a`
    const isAssemblyLocalDefinition =
      assemblyLocalDefinition &&
      assemblyLocalDefinition.names &&
      assemblyLocalDefinition.names.includes(node)

    return variableDeclaration || identifierList || parameterList || isAssemblyLocalDefinition
  }
}

class VarUsageScope {
  static of(node) {
    return findFirstParent(node, (it) => !!it.funcScope)?.funcScope
  }

  static activate(node) {
    node.funcScope = new VarUsageScope()
  }

  static isActivated(node) {
    return !!node.funcScope
  }

  constructor() {
    this.vars = {}
  }

  addVar(node, name) {
    this.vars[name] = { node, usage: 0 }
  }

  hasVar(name) {
    return this.vars[name] !== undefined
  }

  trackVarUsage(name) {
    const curVar = this.vars[name]

    if (curVar) {
      curVar.usage += 1
    }
  }

  unusedVariables() {
    return _(this.vars)
      .pickBy((val) => val.usage === 0)
      .map((info, varName) => ({ name: varName, node: info.node }))
      .value()
  }
}

module.exports = NoUnusedVarsChecker
