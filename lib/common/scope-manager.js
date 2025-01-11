const _ = require('lodash')

// TODO: docs
class ScopeManager {
  constructor() {
    this.scopes = new Map()
  }

  addScope(node) {
    const scope = new Scope(node)
    this.scopes.set(node, scope)
    return scope
  }

  getScope(node) {
    // TODO: findScopeNode implementation
    return this.scopes.get(this.findScopeNode(node))
  }
}

class Scope {
  constructor(node) {
    this.node = node
    this.variables = new Map()
  }

  addVariable(node, name) {
    if (!this.variables.has(name)) {
      this.variables.set(name, { node, usages: 0 })
    }
  }

  // TODO: functions to track variable usage
}

function attachScopes(ast) {
  const scopeManager = new ScopeManager()

  if (ast.type === 'SourceUnit') {
    scopeManager.addScope(ast)
  }

  const visitor = {
    ContractDefinition(node) {
      scopeManager.addScope(node)
    },

    FunctionDefinition(node) {
      if (node.body) {
        scopeManager.addScope(node)
      }
    },

    Block(node) {
      const isFunctionBody = node.parent?.type === 'FunctionDefinition'
      if (!isFunctionBody) {
        scopeManager.addScope(node)
      }
    },

    // TODO: Handle aliased imports and symbol aliases

    VariableDeclaration(node) {
      // TODO: Add variable to the correct scope
    },
  }

  // Traverse AST and attach scopes
  function visit(node) {
    if (!node || typeof node !== 'object') return

    if (visitor[node.type]) {
      visitor[node.type](node)
    }

    Object.keys(node).forEach(key => {
      const child = node[key]
      if (Array.isArray(child)) {
        child.forEach(item => visit(item))
      } else {
        visit(child)
      }
    })
  }

  visit(ast)

  // Attach scope manager to AST
  ast.scopeManager = scopeManager

  return ast
}

module.exports = { ScopeManager, Scope, attachScopes }
