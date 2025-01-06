const {
  assertNoWarnings,
  assertErrorMessage,
  assertWarnsCount,
  assertErrorCount,
} = require('../../common/asserts')
const linter = require('../../../lib/index')
const { contractWith, funcWith } = require('../../common/contract-builder')

describe('Linter - no-empty-blocks', () => {
  describe('Basic empty blocks', () => {
    const EMPTY_BLOCKS = [
      funcWith('if (a < b) {  }'),
      funcWith('for(uint i = 0; i < 10; i++) {  }'),
      funcWith('while(true) {  }'),
      funcWith('do {  } while(true);'),
      funcWith('try foo() {  } catch {  }'),
      contractWith('struct Abc {  }'),
      contractWith('enum Abc {  }'),
      contractWith('constructor () {  }'),
      'contract A { }',
      funcWith('assembly {  }'),
    ]

    EMPTY_BLOCKS.forEach((curData) =>
      it(`should raise warn for empty block: ${label(curData)}`, () => {
        const report = linter.processStr(curData, {
          rules: { 'no-empty-blocks': 'warn' },
        })
        assertWarnsCount(report, curData.includes('try') ? 2 : 1)
        assertErrorMessage(report, 'empty block')
      })
    )
  })

  describe('Valid non-empty blocks', () => {
    const VALID_BLOCKS = [
      funcWith('if (a < b) { uint x = 1; }'),
      funcWith('for(uint i = 0; i < 10; i++) { sum += i; }'),
      funcWith('while(true) { count++; }'),
      funcWith('do { count--; } while(true)'),
      funcWith('try foo() { emit Event(); } catch { revert(); }'),
      contractWith('struct Point { uint x; uint y; }'),
      contractWith('enum Color { Red, Green, Blue }'),
      contractWith('constructor () BaseContract(1) {  }'),
      'contract Token { string private name; }',
      funcWith('assembly { let x := 1 }'),
    ]

    VALID_BLOCKS.forEach((curData) =>
      it(`should not raise warn for valid block: ${label(curData)}`, () => {
        const report = linter.processStr(curData, {
          rules: { 'no-empty-blocks': 'warn' },
        })
        assertNoWarnings(report)
      })
    )
  })

  describe('Nested blocks', () => {
    it('should detect multiple empty blocks in one contract', () => {
      const code = contractWith(`
        function f1() public { }
        function f2() public { }
        struct S { }
      `)
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertWarnsCount(report, 3)
    })
  })

  const BLOCKS_WITH_DEFINITIONS = [
    contractWith('function () public payable { make1(); }'),
    contractWith('receive() external payable {}'),
    contractWith('fallback() external payable {}'),
    funcWith('if (a < b) { make1(); }'),
    contractWith('struct Abc { uint a; }'),
    contractWith('enum Abc { Test1 }'),
    'contract A { uint private a; }',
    funcWith('assembly { "literal" }'),
    contractWith('constructor () BaseContract() {  }'),
  ]

  BLOCKS_WITH_DEFINITIONS.forEach((curData) =>
    it(`should not raise warn for blocks ${label(curData)}`, () => {
      const report = linter.processStr(curData, {
        rules: { 'no-empty-blocks': 'warn' },
      })

      assertNoWarnings(report)
    })
  )

  it('should not raise error for default function', () => {
    const defaultFunction = contractWith('function () public payable {}')
    const report = linter.processStr(defaultFunction, {
      rules: { 'no-empty-blocks': 'warn' },
    })

    assertNoWarnings(report)
  })

  it('should not raise error for inline assembly [for] statement with some content', () => {
    const code = funcWith(`
      assembly {  
        for { } lt(i, 0x100) { } {     
          i := add(i, 0x20)
        } 
      }`)

    const report = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'warn' },
    })

    assertNoWarnings(report)
  })

  it('should raise error for inline assembly [for] statement with empty content', () => {
    const code = funcWith(`
      assembly {  
        for { } lt(i, 0x100) { } {     
        } 
      }`)

    const report = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'warn' },
    })
    assertWarnsCount(report, 1)
    assertErrorMessage(report, 'empty block')
  })

  it('should raise error for inline assembly [for nested] statement with empty content', () => {
    const code = funcWith(`
      assembly {  
        for { } lt(i, 0x100) { } {     
          for { } lt(j, 0x100) { } {     
          } 
        } 
      }`)

    const report = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'warn' },
    })
    assertWarnsCount(report, 1)
    assertErrorMessage(report, 'empty block')
  })

  it('should not raise error for inline assembly [for nested] statement with some content', () => {
    const code = funcWith(`
      assembly {  
        for { } lt(i, 0x100) { } {
          i := add(i, 0x20)     
          for { } lt(i, 0x100) { } {     
            j := add(j, 0x20)
          } 
        } 
      }`)

    const report = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'warn' },
    })

    assertNoWarnings(report)
  })

  function label(data) {
    const items = data.split('\n')
    const lastItemIndex = items.length - 1
    const labelIndex = Math.floor(lastItemIndex / 5) * 4
    return items[labelIndex]
  }

  it('should respect config severity level', () => {
    const code = 'contract A { }'

    const warnReport = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'warn' },
    })
    assertWarnsCount(warnReport, 1)

    const errorReport = linter.processStr(code, {
      rules: { 'no-empty-blocks': 'error' },
    })
    assertErrorCount(errorReport, 1)
  })

  describe('Abstract contract cases', () => {
    it('should not raise warning for abstract contract with virtual functions', () => {
      const code = `
        abstract contract Base {
          function foo() public virtual;
        }
      `
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })
  })

  describe('Try-catch variations', () => {
    const TRY_CATCH_CASES = [
      funcWith('try foo() { revert(); } catch Error(string memory) { }'),
      funcWith('try foo() { revert(); } catch (bytes memory) { }'),
      funcWith('try foo() returns (uint) { } catch Error(string memory) { revert(); }'),
    ]

    TRY_CATCH_CASES.forEach((code) => {
      it(`should detect empty blocks in try-catch: ${label(code)}`, () => {
        const report = linter.processStr(code, {
          rules: { 'no-empty-blocks': 'warn' },
        })
        assertWarnsCount(report, 1)
      })
    })
  })

  describe('Constructor inheritance', () => {
    it('should not raise warning for empty constructor with multiple inheritance', () => {
      const code = `
        contract C is A, B {
          constructor() A(1) B(2) { }
        }
      `
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })
  })

  describe('Modifier cases', () => {
    it('should raise warning for empty modifier', () => {
      const code = contractWith('modifier onlyOwner() { }')
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertWarnsCount(report, 1)
    })

    it('should not raise warning for modifier with placeholder', () => {
      const code = contractWith('modifier onlyOwner() { _; }')
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })

    it('should not raise warning for modifier with content besides placeholder', () => {
      const code = contractWith(`
        modifier checkValue(uint value) { 
          require(value > 100);
          _;
          require(value < 200);
        }
      `)
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })

    it('should not raise warning for modifier with multiple placeholders', () => {
      const code = contractWith(`
        modifier sandwich() {
          _; // Start
          require(msg.sender != address(0));
          _; // End
        }
      `)
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })

    it('should not raise warning for modifier with conditional and placeholder', () => {
      const code = contractWith(`
        modifier checkRole() {
          if (hasRole(msg.sender)) {
            _;
          }
        }
      `)
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertNoWarnings(report)
    })
  })

  describe('Complex assembly', () => {
    it('should handle nested assembly blocks', () => {
      const code = funcWith(`
        assembly {
          {
            let x := 1
            {
              
            }
          }
        }
      `)
      const report = linter.processStr(code, {
        rules: { 'no-empty-blocks': 'warn' },
      })
      assertWarnsCount(report, 1)
    })
  })

  describe('No empty blocks with configuration options', () => {
    describe('Empty modifiers', () => {
      const modifierCode = contractWith('modifier onlyOwner() { }')

      it('should warn when allowEmptyModifiers is false', () => {
        const report = linter.processStr(modifierCode, {
          rules: {
            'no-empty-blocks': ['warn', { allowEmptyModifiers: false }],
          },
        })
        assertWarnsCount(report, 1)
      })

      it('should not warn when allowEmptyModifiers is true', () => {
        const report = linter.processStr(modifierCode, {
          rules: {
            'no-empty-blocks': ['warn', { allowEmptyModifiers: true }],
          },
        })
        assertNoWarnings(report)
      })
    })

    describe('Empty try-catch', () => {
      const tryCatchCode = funcWith('try foo() { } catch { }')

      it('should warn for both empty try and catch when not allowed', () => {
        const report = linter.processStr(tryCatchCode, {
          rules: {
            'no-empty-blocks': [
              'warn',
              {
                allowEmptyTry: false,
                allowEmptyCatch: false,
              },
            ],
          },
        })
        assertWarnsCount(report, 2)
      })

      it('should only warn for empty catch when try is allowed', () => {
        const report = linter.processStr(tryCatchCode, {
          rules: {
            'no-empty-blocks': [
              'warn',
              {
                allowEmptyTry: true,
                allowEmptyCatch: false,
              },
            ],
          },
        })
        assertWarnsCount(report, 1)
      })

      it('should only warn for empty try when catch is allowed', () => {
        const report = linter.processStr(tryCatchCode, {
          rules: {
            'no-empty-blocks': [
              'warn',
              {
                allowEmptyTry: false,
                allowEmptyCatch: true,
              },
            ],
          },
        })
        assertWarnsCount(report, 1)
      })

      it('should not warn when both empty try and catch are allowed', () => {
        const report = linter.processStr(tryCatchCode, {
          rules: {
            'no-empty-blocks': [
              'warn',
              {
                allowEmptyTry: true,
                allowEmptyCatch: true,
              },
            ],
          },
        })
        assertNoWarnings(report)
      })
    })
  })
})
