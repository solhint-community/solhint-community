const { assertNoWarnings, assertErrorMessage, assertWarnsCount } = require('../../common/asserts')
const linter = require('../../../lib/index')
const { contractWith, funcWith } = require('../../common/contract-builder')

describe('Linter - no-empty-blocks', () => {
  const EMPTY_BLOCKS = [
    funcWith('if (a < b) {  }'),
    contractWith('struct Abc {  }'),
    contractWith('enum Abc {  }'),
    contractWith('constructor () {  }'),
    'contract A { }',
    funcWith('assembly {  }'),
  ]

  EMPTY_BLOCKS.forEach((curData) =>
    it(`should raise warn for empty blocks ${label(curData)}`, () => {
      const report = linter.processStr(curData, {
        rules: { 'no-empty-blocks': 'warn' },
      })

      assertWarnsCount(report, 1)
      assertErrorMessage(report, 'empty block')
    })
  )

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

  it('should not warn for modifier with content besides _', () => {
    const code = contractWith(`
      modifier onlyOwner {
        require(msg.sender == owner);
        _;
      }
    `)
    const report = linter.processStr(code, {
      rules: {
        'no-empty-blocks': ['warn', { allowEmptyModifiers: false }],
      },
    })
    assertNoWarnings(report)
  })

  it('should not warn for empty try block when allowEmptyTry is true', () => {
    const code = contractWith(`
      function test() external {
        try this.foo() {} 
        catch Error(string memory reason) {
          revert(reason);
        }
      }
    `)

    const report = linter.processStr(code, {
      rules: {
        'no-empty-blocks': ['warn', { allowEmptyTry: true }],
      },
    })

    assertNoWarnings(report)
  })

  it('should warn for empty try block when allowEmptyTry is false', () => {
    const code = contractWith(`
      function test() external {
        try this.foo() {} 
        catch Error(string memory reason) {
          revert(reason);
        }
      }
    `)
    const report = linter.processStr(code, {
      rules: {
        'no-empty-blocks': ['warn', { allowEmptyTry: false }],
      },
    })
    assertWarnsCount(report, 1)
  })

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

  describe('configuration options', () => {
    it('should raise warning for empty modifier with _ when allowEmptyModifiers is false', () => {
      const code = contractWith(`
    modifier onlyOwner {
      _;
    }
  `)
      const report = linter.processStr(code, {
        rules: {
          'no-empty-blocks': ['warn', { allowEmptyModifiers: false }],
        },
      })

      assertWarnsCount(report, 1)
    })

    it('should raise warning for completely empty modifier', () => {
      const code = contractWith(`
        modifier onlyOwner {
        }
      `)

      const report = linter.processStr(code, {
        rules: {
          'no-empty-blocks': ['warn', { allowEmptyModifiers: true }],
        },
      })

      assertWarnsCount(report, 1)
      assertErrorMessage(report, 'Code contains empty blocks')
    })

    it('should raise warning for empty try-catch when allowEmptyCatch is false', () => {
      const code = contractWith(`
        function foo() external returns (uint) {
          return 1;
        }
    
        function test() external {
          try this.foo() {
            console.log('success');
          } catch Error(string memory) {
            // empty catch
          }
        }
      `)

      const report = linter.processStr(code, {
        rules: {
          'no-empty-blocks': ['warn', { allowEmptyCatch: false }],
        },
      })

      assertWarnsCount(report, 1)
      assertErrorMessage(report, 'Code contains empty blocks')
    })

    it('should not raise warning for empty try-catch when allowEmptyCatch is true', () => {
      const code = contractWith(`
        function foo() external returns (uint) {
          return 1;
        }
    
        function test() external {
          try this.foo() {
            console.log('success');
          } catch Error(string memory) {
            // empty catch allowed
          }
        }
      `)

      const report = linter.processStr(code, {
        rules: {
          'no-empty-blocks': ['warn', { allowEmptyCatch: true }],
        },
      })

      assertNoWarnings(report)
    })

    it('should not raise warning for non-empty catch block when allowEmptyCatch is false', () => {
      const code = contractWith(`
        function foo() external returns (uint) {
          return 1;
        }
    
        function test() external {
          try this.foo() {
            console.log('success');
          } catch Error(string memory) {
            revert('error');
          }
        }
      `)

      const report = linter.processStr(code, {
        rules: {
          'no-empty-blocks': ['warn', { allowEmptyCatch: false }],
        },
      })

      assertNoWarnings(report)
    })
  })

  it('should not raise warning for non-empty try block when allowEmptyTry is false', () => {
    const code = contractWith(`
      function test() external {
        try this.foo() {
          console.log('success');
        }
        catch Error(string memory reason) {
          revert(reason);
        }
      }
    `)

    const report = linter.processStr(code, {
      rules: {
        'no-empty-blocks': ['warn', { allowEmptyTry: true }],
      },
    })

    assertNoWarnings(report)
  })
})
