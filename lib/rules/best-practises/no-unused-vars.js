const _ = require('lodash')
const BaseChecker = require('../base-checker')
const TreeTraversing = require('../../common/tree-traversing')
const { contractWith, funcWith } = require('../../../test/common/contract-builder')

const { findParentType, findFirstParent } = new TreeTraversing()

const ruleId = 'no-unused-vars'
const meta = {
  type: 'best-practises',

  docs: {
    description: 'Ensure defined names are used',
    category: 'Best Practise Rules',
    examples: {
      good: [
        {
          description: 'imported name is used',
          code: `
            import {A} from './A.sol';
            contract Foo is A{ }
            `,
        },
        {
          description: 'defined stack variable is used',
          code: contractWith('function fun(uint a) public { uint b = bytes32(a); b += 1; }'),
        },
        {
          description: 'note: function parameters of functions with empty blocks are not checked',
          code: contractWith('function fun(uint d) public returns (uint c) { }'),
        },
        {
          description: 'note: function parameters of functions without blocks are not checked',
          code: contractWith('function fun(uint a, uint b) public returns (uint c);'),
        },
        {
          description: 'note: state variables are not checked',
          code: contractWith('uint public foo;'),
        },
      ],
      bad: [
        {
          description: 'imported name is not used',
          code: `
            import {A} from './A.sol';
            contract Foo { }
            `,
        },
        {
          description: 'stack variable is not used',
          code: funcWith('uint a = 0;'),
        },
        {
          description: 'function parameter is not used',
          code: contractWith('function fun(uint a) public returns (uint){ return 42; }'),
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: 'warn',

  schema: null,
}

class NoUnusedVarsChecker extends BaseChecker {
  constructor(reporter, tokens) {
    super(reporter, ruleId, meta)
    this.tokens = tokens
  }

  // imported variables need a scope to be tracked in
  SourceUnit(node) {
    VarUsageScope.activate(node)
  }

  'SourceUnit:exit'(node) {
    // get inheritdoc statements from the lexed (but not parsed) input
    const keywords = this.tokens.filter((it) => it.type === 'Keyword')
    const inheritdocStatements = keywords.filter(
      ({ value }) => /^\/\/\/ *@inheritdoc/.test(value) || /^\/\*\* *@inheritdoc/.test(value)
    )
    // mark inheritdoc'd names as used in the SourceUnit scope, since it only makes
    // sense to extend the documentation of a name defined somewhere else.
    // this doesn't break since all items that can have natspec (from the language docs):
    // > Documentation is inserted above each contract, interface, library, function, and event
    // cannot be inside a block
    inheritdocStatements.forEach(({ value }) => {
      const match = value.match(/@inheritdoc *([a-zA-Z0-9_]*)/)
      if (match && match[1]) {
        node.scope.trackVarUsage(match[1])
      }
    })

    node.scope.unusedVariables().forEach(this._error.bind(this))
  }

  Block(node) {
    if (node.parent?.type === 'FunctionDefinition') {
      return
    }
    VarUsageScope.activate(node)
  }

  'Block:exit'(node) {
    if (node.parent?.type === 'FunctionDefinition') {
      return
    }
    node.scope.unusedVariables().forEach(this._error.bind(this))
  }

  'FunctionDefinition:exit'(node) {
    node.scope.unusedVariables().forEach(this._error.bind(this))
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

  FunctionDefinition(node) {
    if (node.body === null) {
      return
    }
    if (node.isConstructor) {
      // track usage of extended contracts in member initialization list
      node.modifiers.forEach((it) => this._trackVarUsage(it))
    }
    VarUsageScope.activate(node)
    // filters 'payable' keyword as name when defining function like this:
    // function foo(address payable) public view {}. I believe this is a parser limitation
    node.parameters
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
        node.scope.addVar(typeName, name)
      })
    node.modifiers.forEach((modifier) =>
      modifier.arguments.forEach((argument) => this._trackVarUsage(argument))
    )
  }

  UserDefinedTypeName(node) {
    this._trackVarUsage(node, true)
  }

  UsingForDeclaration(node) {
    if (node.libraryName) {
      this._trackVarUsage(node)
    }
    // It's okay to not search upwards for the scope containing it, since it's
    // defined at the grammar level that using-for directives can only be childs
    // of source units or contract definitions
    const scope = VarUsageScope.of(node)
    // the name can be either the imported thing, or a member access of it
    node.functions.forEach((it) => scope.trackVarUsage(it.split('.')[0]))
  }

  Identifier(node) {
    this._trackVarUsage(node)
  }

  ImportDirective(node) {
    if (node.unitAlias) {
      node.unitAliasIdentifier.parent = node
      this._addVariable(node, node.unitAliasIdentifier.name)
    } else {
      node.symbolAliasesIdentifiers.forEach((it) => {
        const idNode = it[1] || it[0]
        // I have to define the parent manually because of a bug with ast-parents
        // see #119
        Object.defineProperty(idNode, 'parent', {
          value: node,
          configurable: true,
          enumerable: false,
          writable: true,
        })
        this._addVariable(idNode)
      })
    }
  }

  AssemblyCall(node) {
    const firstChild = node.arguments.length === 0 && node

    if (firstChild) {
      firstChild.name = firstChild.functionName
      this._trackVarUsage(firstChild)
    }
  }

  _addVariable(idNode, customName) {
    const scope = VarUsageScope.of(idNode)

    if (idNode && scope) {
      scope.addVar(idNode, customName || idNode.name)
    }
  }

  _trackVarUsage(node, trackInsideVarDeclaration = false) {
    if (!trackInsideVarDeclaration && this._isVarDeclaration(node)) return
    // nodes passed here can be of various types, and have its 'name' in different fields
    // plus the name itself can be a member access of the name that's actually defined
    const name = (node.name || node.namePath || node.libraryName).split('.')[0]
    // if I can't find the name here, search upwards for a scope that might
    // have it
    while (!VarUsageScope.of(node).hasVar(name)) {
      node = node.parent
    }
    VarUsageScope.of(node).trackVarUsage(name)
  }

  _error({ name, node }) {
    this.warn(node, `Variable "${name}" is unused`)
  }

  _isVarDeclaration(node) {
    const importDirective = findParentType(node, 'ImportDirective')
    const variableDeclaration = findParentType(node, 'VariableDeclaration')
    const identifierList = findParentType(node, 'IdentifierList')
    const parameterList = findParentType(node, 'ParameterList')
    const assemblyLocalDefinition = findParentType(node, 'AssemblyLocalDefinition')

    // otherwise `let t := a` doesn't track usage of `a`
    const isAssemblyLocalDefinition =
      assemblyLocalDefinition &&
      assemblyLocalDefinition.names &&
      assemblyLocalDefinition.names.includes(node)

    return !!(
      variableDeclaration ||
      identifierList ||
      parameterList ||
      isAssemblyLocalDefinition ||
      importDirective
    )
  }
}

class VarUsageScope {
  static of(node) {
    return findFirstParent(node, (it) => !!it.scope)?.scope
  }

  static activate(node) {
    node.scope = new VarUsageScope()
  }

  static isActivated(node) {
    return !!node.scope
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
