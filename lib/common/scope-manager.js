const parser = require('@solidity-parser/parser')

const { visit } = parser

/**
 * Manages lexical scoping for a Solidity AST
 * Used to track variable declarations and their usage across different scopes.
 * Each scope (source unit, contract, function, block) maintains its own set of variables
 * and their usage counts.
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

  /**
   * Traverses up the AST to find the nearest ancestor node that has a scope
   * @param {ASTNode} node - Starting node to search from
   * @returns {ASTNode|undefined} The nearest ancestor with a scope, or undefined if none exists
   */
  findScopeNode(node) {
    let current = node
    while (current && !this.scopes.has(current)) {
      current = current.parent
    }
    return current
  }
}

/**
 * Represents a single lexical scope in the code.
 * Tracks variables declared in this scope and how many times they are used.
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
   * @param {Object} opts - Options object
   * @param {boolean} opts.ignore - If true, variable will be tracked but ignored in unused checks
   */
  addVariable(node, name, opts = {}) {
    if (!name) return
    // Special case: skip 'payable' as it can be both a type and parameter name
    if (name === 'payable') return
    if (opts.ignore) return

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
    const v = this.variables.get(name)
    if (v) {
      v.usages++
      return true
    }
    return false
  }

  /**
   * Returns all variables in this scope that were never used
   * @returns {Array<{name: string, node: ASTNode}>} Array of unused variables
   */
  getUnusedVariables() {
    return Array.from(this.variables.entries())
      .filter(([, info]) => info.usages === 0)
      .map(([name, info]) => ({ name, node: info.node }))
  }
}

/**
 * Checks if a function has no body (interface or abstract function)
 * @param {ASTNode} fn - Function definition node
 * @returns {boolean} True if function has no body
 */
function hasNoBody(fn) {
  return fn.body === null
}

/**
 * Checks if a function has an empty block body
 * @param {ASTNode} fn - Function definition node
 * @returns {boolean} True if function has empty body
 */
function hasEmptyBody(fn) {
  if (!fn.body) return false
  return (
    fn.body.type === 'Block' && Array.isArray(fn.body.statements) && fn.body.statements.length === 0
  )
}

/**
 * Checks if a variable declaration is a return parameter
 * @param {ASTNode} node - Variable declaration node
 * @returns {boolean} True if node is a return parameter
 */
function isReturnParameter(node) {
  const fn = findParentFunction(node)
  if (!fn || !fn.returnParameters) return false
  return fn.returnParameters.includes(node)
}

/**
 * Checks if an identifier is being used in its own import declaration
 * (e.g. the 'A' in 'import {A} from "./A.sol"')
 * @param {ASTNode} idNode - Identifier node
 * @returns {boolean} True if identifier is part of its own import
 */
function isImportDirectiveSelfReference(idNode) {
  let cur = idNode.parent
  while (cur) {
    if (cur.type === 'ImportDirective') {
      return true
    }
    // Stop if we hit a scope-creating node
    if (
      cur.type === 'Block' ||
      cur.type === 'FunctionDefinition' ||
      cur.type === 'ContractDefinition'
    ) {
      return false
    }
    cur = cur.parent
  }
  return false
}

/**
 * Finds the nearest function definition containing this node
 * @param {ASTNode} node - Starting node
 * @returns {ASTNode|null} Parent function node or null if not in a function
 */
function findParentFunction(node) {
  while (node) {
    if (node.type === 'FunctionDefinition') {
      return node
    }
    node = node.parent
  }
  return null
}

/**
 * Checks if an identifier node is part of its own declaration
 * @param {ASTNode} idNode - Identifier node
 * @returns {boolean} True if identifier is being declared
 */
function isPartOfDeclaration(idNode) {
  const p = idNode.parent
  if (!p) return false

  // Handle normal variable declarations
  if (p.type === 'VariableDeclaration' && p.name === idNode.name) {
    return true
  }

  // Handle assembly let declarations
  if (p.type === 'AssemblyLocalDefinition') {
    return p.names.some((n) => n.type === 'Identifier' && n.name === idNode.name)
  }

  return false
}

/**
 * Attaches scope information to an AST
 * @param {ASTNode} ast - The AST to analyze
 * @returns {ASTNode} The AST with attached scope information
 */
function attachScopes(ast) {
  // Parent references are set up by astParents(ast) invocation upstream
  const scopeManager = new ScopeManager()

  visit(ast, {
    // Create scopes for all major structural elements
    SourceUnit(node) {
      scopeManager.addScope(node)
    },

    ContractDefinition(node) {
      scopeManager.addScope(node)
    },

    FunctionDefinition(node) {
      if (!hasNoBody(node)) {
        const scope = scopeManager.addScope(node)

        // Special handling for constructor modifiers
        // Track usage of contract names in inheritance list
        if (node.isConstructor && node.modifiers?.length) {
          node.modifiers.forEach((mod) => {
            if (mod.name) {
              const namePart = mod.name.split('.')[0]
              let sc = scope
              while (sc) {
                if (sc.trackUsage(namePart)) break
                const p = sc.node?.parent
                sc = p ? scopeManager.getScope(p) : null
              }
            }
          })
        }
      }
    },

    Block(node) {
      // Skip function body blocks as they share scope with function parameters
      const fn = node.parent
      if (fn?.type === 'FunctionDefinition' && fn.body === node) {
        return
      }
      scopeManager.addScope(node)
    },

    // Special handling for inline assembly
    InlineAssemblyStatement(node) {
      const trackIdentifierUsage = (id) => {
        if (id.type === 'Identifier') {
          let sc = scopeManager.getScope(id)
          while (sc) {
            if (sc.trackUsage(id.name)) break
            const p = sc.node?.parent
            sc = p ? scopeManager.getScope(p) : null
          }
        }
      }

      // Recursively visit assembly nodes to track identifier usage
      const visit = (n) => {
        if (!n) return

        if (n.type === 'AssemblyLocalDefinition') {
          // Track expression (right side) of assembly let statements
        } else if (n.type === 'AssemblyAssignment') {
          // Track both sides of assignments
          visit(n.names)
          visit(n.expression)
        } else if (n.type === 'AssemblyCall') {
          // Track function name and arguments
          if (n.functionName) {
            trackIdentifierUsage({ type: 'Identifier', name: n.functionName })
          }
          if (n.arguments) {
            n.arguments.forEach(visit)
          }
        } else if (n.type === 'Identifier') {
          trackIdentifierUsage(n)
        }

        // Visit all array children
        if (Array.isArray(n)) {
          n.forEach(visit)
        }
        // Visit operations in assembly blocks
        else if (n.type === 'AssemblyBlock' && Array.isArray(n.operations)) {
          n.operations.forEach(visit)
        }
        // Visit other object properties recursively
        else if (typeof n === 'object') {
          Object.values(n).forEach(visit)
        }
      }

      visit(node.body)
    },

    // Track imported names in the source unit scope
    ImportDirective(node) {
      let top = node
      while (top && top.type !== 'SourceUnit') {
        top = top.parent
      }
      const sourceScope = top ? scopeManager.getScope(top) : null
      if (!sourceScope) return

      // Handle unit alias (import "..." as A)
      if (node.unitAliasIdentifier?.name) {
        sourceScope.addVariable(node.unitAliasIdentifier, node.unitAliasIdentifier.name)
      } else if (node.unitAlias) {
        sourceScope.addVariable(node, node.unitAlias)
      }

      // Handle symbol aliases (import {A as B} from "...")
      if (Array.isArray(node.symbolAliasesIdentifiers)) {
        for (const [origId, aliasId] of node.symbolAliasesIdentifiers) {
          if (!origId) continue
          const realId = aliasId || origId
          if (realId?.name) {
            sourceScope.addVariable(realId, realId.name)
          }
        }
      }
    },

    // Ignore state variables in unused checks
    StateVariableDeclaration(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return
      for (const v of node.variables) {
        if (v && v.name) {
          scope.addVariable(v, v.name, { ignore: false })
        }
      }
    },

    VariableDeclaration(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return

      // Ignore state variables
      if (node.isStateVar) {
        scope.addVariable(node, node.name, { ignore: true })
        return
      }

      const fn = findParentFunction(node)

      // Ignore parameters in interface functions
      if (fn && hasNoBody(fn)) {
        scope.addVariable(node, node.name, { ignore: true })
        return
      }

      // Ignore parameters in empty implementations (except return parameters)
      if (fn && hasEmptyBody(fn) && !isReturnParameter(node)) {
        scope.addVariable(node, node.name, { ignore: true })
        return
      }

      scope.addVariable(node, node.name)
    },

    // Track variables declared in variable declaration statements
    VariableDeclarationStatement(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return
      for (const v of node.variables) {
        if (!v) continue
        scope.addVariable(v, v.name)
      }
    },

    // Track assembly local variables
    AssemblyLocalDefinition(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return
      for (const v of node.names) {
        if (v.type === 'Identifier') {
          scope.addVariable(v, v.name)
        }
      }
    },

    // Track usage of library names in using declarations
    UsingForDeclaration(node) {
      const scope = scopeManager.getScope(node)
      if (!scope) return

      if (node.libraryName) {
        let cur = scope
        while (cur) {
          if (cur.trackUsage(node.libraryName)) break
          const p = cur.node?.parent
          cur = p ? scopeManager.getScope(p) : null
        }
      }

      // Track usage of function names in using declarations
      if (node.functions) {
        for (const fnStr of node.functions) {
          const first = fnStr.split('.')[0]
          const cur = scope
          while (cur) {
            if (cur.trackUsage(first)) break
          }
        }
      }
    },

    // Track usage of user-defined types
    UserDefinedTypeName(node) {
      const firstPart = node.namePath.split('.')[0]
      let sc = scopeManager.getScope(node)
      while (sc) {
        if (sc.trackUsage(firstPart)) break
        const p = sc.node?.parent
        sc = p ? scopeManager.getScope(p) : null
      }
    },

    // Track usage of identifiers in assembly calls
    AssemblyCall(node) {
      if (node.arguments.length === 0) {
        let sc = scopeManager.getScope(node)
        while (sc) {
          if (sc.trackUsage(node.functionName)) break
          const p = sc.node?.parent
          sc = p ? scopeManager.getScope(p) : null
        }
      }
    },

    // Track general identifier usage
    Identifier(node) {
      // Skip identifiers that are being declared
      if (isPartOfDeclaration(node)) return
      // Skip identifiers in their own import statement
      if (isImportDirectiveSelfReference(node)) return

      const name = node.name
      let sc = scopeManager.getScope(node)
      while (sc) {
        if (sc.trackUsage(name)) {
          break
        }
        const p = sc.node?.parent
        sc = p ? scopeManager.getScope(p) : null
      }
    },
  })

  ast.scopeManager = scopeManager
  return ast
}

module.exports = {
  ScopeManager,
  Scope,
  attachScopes,
}
