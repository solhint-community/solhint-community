const parser = require('@solidity-parser/parser')

const { visit } = parser

/**
 * Manages lexical scoping for a Solidity AST
 * Used to track variable declarations and their usage across different scopes
 */
class ScopeManager {
  constructor() {
    this.scopes = new Map()
  }

  /**
   * Creates a new scope for an AST node
   * @param {ASTNode} node - The AST node to create a scope for
   * @returns {Scope} The newly created scope
   */
  addScope(node) {
    const scope = new Scope(node)
    this.scopes.set(node, scope)
    return scope
  }

  /**
   * Gets the scope that contains a given node
   * @param {ASTNode} node - The AST node to find the scope for
   * @returns {Scope|undefined} The containing scope, or undefined if none exists
   */
  getScope(node) {
    return this.scopes.get(this.findScopeNode(node))
  }

  findScopeNode(node) {
    let current = node
    while (current && !this.scopes.has(current)) {
      current = current.parent
    }
    return current
  }
}

/**
 * Represents a single lexical scope in the code
 * Tracks variables declared in this scope and their usage
 */
class Scope {
  constructor(node) {
    this.node = node
    this.variables = new Map()
  }

  /**
   * Adds a variable declaration to this scope
   * @param {ASTNode} node - The AST node representing the variable declaration
   * @param {string} name - The name of the variable
   */
  addVariable(node, name) {
    if (!this.variables.has(name)) {
      this.variables.set(name, { node, usages: 0 })
    }
  }

  /**
   * Records a usage of a variable in this scope
   * @param {string} name - The name of the variable used
   * @returns {boolean} Whether the variable exists in this scope
   */
  trackUsage(name) {
    const variable = this.variables.get(name)
    if (variable) {
      variable.usages++
      return true
    }
    return false
  }

  hasVariable(name) {
    return this.variables.has(name)
  }

  getUnusedVariables() {
    return Array.from(this.variables.entries())
      .filter(([, info]) => info.usages === 0)
      .map(([name, info]) => ({ name, node: info.node }))
  }
}

/**
 * Analyzes an AST and attaches scope information to it
 * Creates a ScopeManager and assigns it to ast.scopeManager
 * @param {ASTNode} ast - The AST to analyze
 * @returns {ASTNode} The AST with scope information attached
 */
function attachScopes(ast) {
  // Parent references are set up by astParents(ast) invocation upstream
  const scopeManager = new ScopeManager()

  const visitor = {
    // Create scopes
    SourceUnit(node) {
      scopeManager.addScope(node)
    },

    ContractDefinition(node) {
      scopeManager.addScope(node)
    },

    FunctionDefinition(node) {
      // Only create scope if it's not a function declaration
      if (node.body !== null) {
        scopeManager.addScope(node)
      }
    },

    Block(node) {
      // Don't create redundant scopes for function body blocks
      const isFunctionBody = node.parent?.type === 'FunctionDefinition' && node.parent.body === node
      if (!isFunctionBody) {
        scopeManager.addScope(node)
      }
    },

    ImportDirective(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return

      if (node.unitAlias) {
        scope.addVariable(node.unitAliasIdentifier, node.unitAlias)
      }
      if (node.symbolAliases) {
        node.symbolAliasesIdentifiers.forEach(([origId, aliasId]) => {
          const id = aliasId || origId
          scope.addVariable(id, id.name)
        })
      }
    },

    VariableDeclaration(node) {
      const scope = scopeManager.getScope(node)
      if (scope) {
        scope.addVariable(node, node.name)
      }
    },

    Identifier(node) {
      // Skip identifiers that are part of declarations
      if (isPartOfDeclaration(node)) return

      const name = node.name

      // Track usage up the scope chain
      let scope = scopeManager.getScope(node)
      while (scope) {
        if (scope.trackUsage(name)) {
          break
        }
        scope = scope.node.parent ? scopeManager.getScope(scope.node.parent) : null
      }
    },
  }

  function isPartOfDeclaration(node) {
    const parent = node.parent
    if (!parent) return false

    if (parent.type === 'VariableDeclaration' && parent.name === node.name) {
      return true
    }

    return false
  }

  visit(ast, visitor)
  ast.scopeManager = scopeManager
  return ast
}

module.exports = {
  ScopeManager,
  Scope,
  attachScopes,
}
