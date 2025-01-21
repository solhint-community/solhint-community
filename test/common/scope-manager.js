/* eslint-disable no-unused-expressions */
// We disable no-unused-expressions because chai does not have lint-friendly terminating assertions
const { expect } = require('chai')
const astParents = require('ast-parents')
const { ScopeManager, Scope, attachScopes } = require('../../lib/common/scope-manager')
const { parseInput } = require('../../lib/index')

describe('ScopeManager', () => {
  let scopeManager

  beforeEach(() => {
    scopeManager = new ScopeManager()
  })

  describe('addScope', () => {
    it('should create and store a new scope for a node', () => {
      const node = { type: 'SourceUnit' }
      const scope = scopeManager.addScope(node)
      expect(scope).to.be.instanceOf(Scope)
      expect(scopeManager.scopes.get(node)).to.equal(scope)
    })
  })

  describe('getScope and findScopeNode', () => {
    it('should find the nearest scope up the AST tree', () => {
      const parent = { type: 'SourceUnit' }
      const child = { type: 'Identifier', parent }
      const scope = scopeManager.addScope(parent)

      expect(scopeManager.getScope(child)).to.equal(scope)
    })

    it('should return undefined when no scope exists', () => {
      const node = { type: 'Identifier' }
      expect(scopeManager.getScope(node)).to.be.undefined
    })
  })
})

describe('Scope', () => {
  let scope
  let node

  beforeEach(() => {
    node = { type: 'Block' }
    scope = new Scope(node)
  })

  describe('addVariable', () => {
    it('should track variable declarations correctly with correct node and name', () => {
      const ast = parseInput('contract C { function f() public { uint x; } }')
      astParents(ast)
      attachScopes(ast)

      const funcNode = ast.children[0].subNodes[0]
      const funcScope = ast.scopeManager.getScope(funcNode)

      expect(funcScope.variables.has('x')).to.be.true

      const variable = funcScope.variables.get('x')
      expect(variable).to.exist

      const varDeclaration = funcNode.body.statements[0].variables[0]
      expect(variable.node).to.equal(varDeclaration)
      expect(variable.node.name).to.equal('x')
    })

    it('should handle multiple variable declarations', () => {
      const ast = parseInput('contract C { function f() public { uint x; uint y; } }')
      astParents(ast)
      attachScopes(ast)

      const funcNode = ast.children[0].subNodes[0]
      const funcScope = ast.scopeManager.getScope(funcNode)

      expect(funcScope.variables.has('x')).to.be.true
      expect(funcScope.variables.has('y')).to.be.true

      const varDeclarationX = funcNode.body.statements[0].variables[0]
      const varDeclarationY = funcNode.body.statements[1].variables[0]

      const variableX = funcScope.variables.get('x')
      const variableY = funcScope.variables.get('y')

      expect(variableX.node).to.equal(varDeclarationX)
      expect(variableX.node.name).to.equal('x')

      expect(variableY.node).to.equal(varDeclarationY)
      expect(variableY.node.name).to.equal('y')
    })

    it('should accurately reflect variable presence in variables Map', () => {
      const ast = parseInput('contract C { function f() public { uint x; } }')
      astParents(ast)
      attachScopes(ast)

      const funcNode = ast.children[0].subNodes[0]
      const funcScope = ast.scopeManager.getScope(funcNode)

      expect(funcScope.variables.has('x')).to.be.true
      expect(funcScope.variables.has('y')).to.be.false
    })

    it('should add a new variable to the scope', () => {
      const varNode = { type: 'VariableDeclaration', name: 'x' }
      scope.addVariable(varNode, 'x')
      expect(scope.variables.has('x')).to.be.true
      expect(scope.variables.get('x')).to.deep.equal({ node: varNode, usages: 0 })
    })

    it('should not overwrite existing variables', () => {
      const varNode1 = { type: 'VariableDeclaration', name: 'x' }
      const varNode2 = { type: 'VariableDeclaration', name: 'x' }
      scope.addVariable(varNode1, 'x')
      scope.addVariable(varNode2, 'x')
      expect(scope.variables.get('x').node).to.equal(varNode1)
    })

    it('should not add variables with no name', () => {
      scope.addVariable({ type: 'VariableDeclaration' }, '')
      expect(scope.variables.size).to.equal(0)
    })

    it('should skip payable parameter', () => {
      scope.addVariable({ type: 'VariableDeclaration' }, 'payable')
      expect(scope.variables.size).to.equal(0)
    })

    it('should skip ignored variables', () => {
      scope.addVariable({ type: 'VariableDeclaration', name: 'x' }, 'x', { ignore: true })
      expect(scope.variables.size).to.equal(0)
    })
  })

  describe('trackUsage', () => {
    it('should increment usage count and return true for existing variables', () => {
      const varNode = { type: 'VariableDeclaration', name: 'x' }
      scope.addVariable(varNode, 'x')
      expect(scope.trackUsage('x')).to.be.true
      expect(scope.variables.get('x')?.usages).to.equal(1)
    })

    it('should return false for non-existent variables', () => {
      expect(scope.trackUsage('nonexistent')).to.be.false
    })
  })

  describe('getUnusedVariables', () => {
    it('should return variables with zero usages', () => {
      const var1 = { type: 'VariableDeclaration', name: 'x' }
      const var2 = { type: 'VariableDeclaration', name: 'y' }
      scope.addVariable(var1, 'x')
      scope.addVariable(var2, 'y')
      scope.trackUsage('x')

      const unused = scope.getUnusedVariables()
      expect(unused).to.have.lengthOf(1)
      expect(unused[0]).to.deep.equal({ name: 'y', node: var2 })
    })
  })
})

describe('attachScopes', () => {
  describe('Scope Creation', () => {
    describe('SourceUnit', () => {
      it('should create scopes for SourceUnit', () => {
        const ast = parseInput('contract C {}')
        astParents(ast)
        attachScopes(ast)

        expect(ast.scopeManager.getScope(ast)).to.exist
      })
    })

    describe('ContractDefinition', () => {
      it('should create scopes for ContractDefinition', () => {
        const ast = parseInput('contract C {}')
        astParents(ast)
        attachScopes(ast)

        const contract = ast.children[0]
        expect(ast.scopeManager.getScope(contract)).to.exist
      })

      it('should create scope for empty contract', () => {
        const ast = parseInput('contract C {}')
        astParents(ast)
        attachScopes(ast)

        const contract = ast.children[0]
        expect(ast.scopeManager.scopes.get(contract)).to.exist
      })

      it('should create scope for interface', () => {
        const ast = parseInput('interface I {}')
        astParents(ast)
        attachScopes(ast)

        const iface = ast.children[0]
        expect(ast.scopeManager.scopes.get(iface)).to.exist
      })

      it('should create scope for library', () => {
        const ast = parseInput('library L {}')
        astParents(ast)
        attachScopes(ast)

        const lib = ast.children[0]
        expect(ast.scopeManager.scopes.get(lib)).to.exist
      })
    })

    describe('FunctionDefinition', () => {
      it('should create scopes for FunctionDefinition with body', () => {
        const ast = parseInput('contract C { function f() public {} }')
        astParents(ast)
        attachScopes(ast)

        const func = ast.children[0].subNodes[0]
        expect(ast.scopeManager.getScope(func)).to.exist
      })

      it('should not create scopes for function declarations without body', () => {
        const ast = parseInput('abstract contract C { function f() public virtual; }')
        astParents(ast)
        attachScopes(ast)

        // This is a function *declaration* (body = null), so no scope is created.
        const func = ast.children[0].subNodes[0]
        const immediateScope = ast.scopeManager.scopes.get(func)
        expect(immediateScope).to.be.undefined
      })

      it('should create scope for function with empty body', () => {
        const ast = parseInput('contract C { function f() public {} }')
        astParents(ast)
        attachScopes(ast)

        const func = ast.children[0].subNodes[0]
        expect(ast.scopeManager.scopes.get(func)).to.exist
      })

      it('should not create scope for function declaration (null body)', () => {
        const ast = parseInput('abstract contract C { function f() public virtual; }')
        astParents(ast)
        attachScopes(ast)

        const func = ast.children[0].subNodes[0]
        expect(ast.scopeManager.scopes.get(func)).to.be.undefined
      })
    })

    describe('Block', () => {
      it('should create scopes for non-function-body blocks', () => {
        const ast = parseInput('contract C { function f() public { if (true) { uint x; } } }')
        astParents(ast)
        attachScopes(ast)

        const ifBlock = ast.children[0].subNodes[0].body.statements[0].trueBody
        expect(ast.scopeManager.getScope(ifBlock)).to.exist
      })

      it('should not create redundant scope for function body blocks', () => {
        const ast = parseInput('contract C { function f() public { uint x; } }')
        astParents(ast)
        attachScopes(ast)

        const functionBody = ast.children[0].subNodes[0].body
        expect(ast.scopeManager.scopes.get(functionBody)).to.be.undefined
      })
    })
  })

  describe('Variable Declarations and Usages', () => {
    describe('Import Declarations', () => {
      it('should correctly assign unitAliasIdentifier and unitAlias for import with unit alias', () => {
        const ast = parseInput(`
              import "./A.sol" as AliasA;
              contract C {
                AliasA.A aInstance;
              }
            `)
        astParents(ast)
        attachScopes(ast)

        const contractC = ast.children.find(
          (child) => child.type === 'ContractDefinition' && child.name === 'C'
        )
        const scope = ast.scopeManager.getScope(contractC)
        expect(scope.variables.has('aInstance')).to.be.true

        const sourceScope = ast.scopeManager.getScope(ast)
        expect(sourceScope.variables.has('AliasA')).to.be.true
      })

      it('should correctly assign symbolAliasesIdentifiers and symbolAliases for import with symbol aliases', () => {
        const ast = parseInput(`
              import { Foo as Bar } from "./Foo.sol";
              contract C {
                Bar bInstance;
              }
            `)
        astParents(ast)
        attachScopes(ast)

        const sourceScope = ast.scopeManager.getScope(ast)
        expect(sourceScope.variables.has('Bar')).to.be.true
      })

      it('should track import declarations with unit alias', () => {
        const ast = parseInput(`
              import "./A.sol" as AliasA;
              contract C {
                  AliasA.A aInstance;
              }
            `)
        astParents(ast)
        attachScopes(ast)

        const sourceScope = ast.scopeManager.getScope(ast)
        expect(sourceScope.variables.has('AliasA')).to.be.true
      })

      it('should track import declarations with symbol aliases', () => {
        const ast = parseInput(`
              import { Foo as Bar } from "./Foo.sol";
              contract C {
                  Bar bInstance;
              }
            `)
        astParents(ast)
        attachScopes(ast)

        const sourceScope = ast.scopeManager.getScope(ast)
        expect(sourceScope.variables.has('Bar')).to.be.true
      })
    })

    describe('Variable Declarations', () => {
      it('should track variable declarations', () => {
        const ast = parseInput('contract C { function f() public { uint x; } }')
        astParents(ast)
        attachScopes(ast)

        const funcNode = ast.children[0].subNodes[0]
        const funcScope = ast.scopeManager.getScope(funcNode)
        expect(funcScope.variables.has('x')).to.be.true
      })
    })

    describe('Variable Usages', () => {
      it('should track state variable usages in contract scope', () => {
        const code = `
              contract C {
                uint x;
                function f() public {
                  x = 1;
                }
              }`
        const ast = parseInput(code)
        astParents(ast)
        attachScopes(ast)

        const contractScope = ast.scopeManager.getScope(ast.children[0])
        expect(contractScope.variables.has('x')).to.be.true
        expect(contractScope.variables.get('x')?.usages).to.equal(1)
      })
    })

    describe('Identifier Nodes', () => {
      it('should track identifier nodes appropriately in declarations', () => {
        const ast = parseInput('contract C { uint x; }')
        astParents(ast)
        attachScopes(ast)

        const contractScope = ast.scopeManager.getScope(ast.children[0])
        expect(contractScope.variables.has('x')).to.be.true
        expect(contractScope.variables.get('x')?.usages).to.equal(0)
      })
    })
  })
  describe('Assembly Variables', () => {
    it('should track assembly variable usage', () => {
      const ast = parseInput(`
        contract C {
          function f() public {
            assembly {
              let x := 1
              let y := x
            }
          }
        }
      `)
      astParents(ast)
      attachScopes(ast)

      const funcNode = ast.children[0].subNodes[0]
      const funcScope = ast.scopeManager.getScope(funcNode)

      expect(funcScope.variables.has('x')).to.be.true
      expect(funcScope.variables.get('x')?.usages).to.equal(1)
    })
  })

  describe('Assembly Tracking', () => {
    it('should track identifier usage in assembly let expressions', () => {
      const ast = parseInput(`
          contract C {
            function f() public {
              uint localVar = 1;
              assembly {
                let x := localVar
              }
            }
          }`)
      astParents(ast)
      attachScopes(ast)

      const funcNode = ast.children[0].subNodes[0]
      const funcScope = ast.scopeManager.getScope(funcNode)
      expect(funcScope.variables.get('localVar')?.usages).to.equal(1)
    })
  })

  describe('Import Tracking', () => {
    it('should handle unit alias without identifier', () => {
      const ast = parseInput(`
        import "./A.sol" as B;
        contract C { }
      `)
      astParents(ast)
      // Modify AST to test edge case
      ast.children[0].unitAliasIdentifier = null
      ast.children[0].unitAlias = 'B'

      attachScopes(ast)

      const sourceScope = ast.scopeManager.getScope(ast)
      expect(sourceScope.variables.has('B')).to.be.true
    })
  })

  describe('Scope Chain Navigation', () => {
    it('should handle detached nodes with null parent when traversing scope chain', () => {
      const ast = parseInput(`
        contract C {
          uint256 x;
          function f() public {
            x = 1;
          }
        }`)
      astParents(ast)

      const detachedNode = {
        type: 'Block',
        parent: {
          type: 'FunctionDefinition',
          parent: null,
        },
      }

      attachScopes(ast)
      const scope = ast.scopeManager.getScope(detachedNode)
      expect(scope).to.be.undefined
    })

    it('should track variable usage across multiple sibling blocks', () => {
      const ast = parseInput(`
        contract C {
          uint256 x;
          function f() public {
            if (true) {
              x = 1;
            }
            if (false) {
              x = 2;
            }
          }
        }`)
      astParents(ast)
      attachScopes(ast)

      const contractScope = ast.scopeManager.getScope(ast.children[0])
      expect(contractScope.variables.get('x')?.usages).to.equal(2)
    })
  })

  describe('Assembly Handling', () => {
    it('should track variable usage in complex assembly operations', () => {
      const ast = parseInput(`
        contract C {
          function f() public pure returns (uint256) {
            assembly {
              let x := 1
              let y := 2
              let z := add(mul(x, 2), y)
              mstore(0x40, z)
            }
            return 0;
          }
        }`)
      astParents(ast)
      attachScopes(ast)

      const assemblyBlock = ast.children[0].subNodes[0].body.statements[0].body
      const scope = ast.scopeManager.getScope(assemblyBlock)

      expect(scope.variables.get('x')?.usages).to.equal(1)
      expect(scope.variables.get('y')?.usages).to.equal(1)
      expect(scope.variables.get('z')?.usages).to.equal(1)
    })
  })
})
