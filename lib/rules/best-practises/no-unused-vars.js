const BaseChecker = require('../base-checker')

const { contractWith, funcWith } = require('../../../test/common/contract-builder')

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

  /**
   * We do the @inheritdoc usage detection here.
   * Once done, we then gather the scope's unused vars and report them.
   */

  'SourceUnit:exit'(node) {
    // get inheritdoc statements from the lexed (but not parsed) input
    const keywords = this.tokens.filter((t) => t.type === 'Keyword')
    const inheritdocs = keywords.filter((k) =>
      /^\/\/\/ *@inheritdoc|^\/\*\* *@inheritdoc/.test(k.value)
    )
    // mark inheritdoc'd names as used in the SourceUnit scope, since it only makes
    // sense to extend the documentation of a name defined somewhere else.
    // this doesn't break since all items that can have natspec (from the language docs):
    // > Documentation is inserted above each contract, interface, library, function, and event
    // cannot be inside a block
    inheritdocs.forEach(({ value }) => {
      const match = value.match(/@inheritdoc *([a-zA-Z0-9_]*)/)
      if (match && match[1]) {
        this._trackUsageUp(node, match[1])
      }
    })

    this._reportUnused(node)
  }

  'Block:exit'(node) {
    if (node.parent?.type === 'FunctionDefinition') return
    this._reportUnused(node)
  }

  'FunctionDefinition:exit'(node) {
    if (!node.body) return // Skip functions without bodies

    // Handle return parameters
    if (node.returnParameters) {
      const hasReturn = node.body.statements.some((st) => st.type === 'ReturnStatement')

      if (hasReturn) {
        // Mark named return params as used
        for (const param of node.returnParameters) {
          if (param.name) {
            this._trackUsageUp(node, param.name)
          }
        }
      }
    }

    // Handle assembly usage of parameters
    const hasAssembly = node.body.statements.some((st) => st.type === 'InlineAssemblyStatement')

    if (hasAssembly) {
      // Parameters used in assembly are considered used
      for (const param of node.parameters || []) {
        if (param.name) {
          const scope = this._getScope(node)
          if (scope) {
            scope.trackUsage(param.name)
          }
        }
      }
    }

    this._reportUnused(node)
  }

  _reportUnused(node) {
    const scope = this._getScope(node)
    if (!scope) return
    for (const { name, node: varNode } of scope.getUnusedVariables()) {
      this.warn(varNode, `Variable "${name}" is unused`)
    }
  }

  /**
   * `_trackVarUsage` recurses up scopes
   */
  _trackUsageUp(node, name) {
    // If we detect name is an import alias but no real references, skip
    let sc = this._getScope(node)
    while (sc) {
      if (sc.trackUsage(name)) {
        return
      }
      const parent = sc.node && sc.node.parent
      sc = parent ? this._getScope(parent) : null
    }
  }

  /**
   * Gets the nearest valid scope for a given AST node by traversing up the tree
   * @param {ASTNode} node - The AST node to find scope for
   * @returns {Scope|null} The nearest valid scope or null if none found
   */
  _getScope(node) {
    if (!node) return null

    // Traverse up until we find a node with a valid scopeManager
    let current = node
    while (current) {
      if (current.scopeManager) {
        return current.scopeManager.getScope(node)
      }
      current = current.parent
    }
  }
}

module.exports = NoUnusedVarsChecker
