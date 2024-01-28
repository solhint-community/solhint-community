const assert = require('assert')
const { processStr } = require('../../../lib/index')
const { contractWith, funcWith } = require('../../common/contract-builder')
const { configGetter } = require('../../../lib/config/config-file')

describe('style-guide-casing', function () {
  describe('immutable names should be in SNAKE_CASE', () => {
    it('should raise error when variable is in camelCase', () => {
      const code = contractWith('uint32 private immutable camelCase;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(
        report.messages[0].message.includes(
          'Immutable variables name should be capitalized SNAKE_CASE'
        )
      )
    })

    it('should raise error when variable is in lowercase_snakecase', () => {
      const code = contractWith('uint32 private immutable snake_case;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(
        report.messages[0].message.includes(
          'Immutable variables name should be capitalized SNAKE_CASE'
        )
      )
    })

    describe('Immutable variable with $ character as SNAKE_CASE', () => {
      const WITH_$ = {
        'starting with $': contractWith('uint32 immutable private $_D;'),
        'starting with $D': contractWith('uint32 immutable private $D;'),
        'containing a $': contractWith('uint32 immutable private TEST_WITH_$_CONTAINED;'),
        'ending with $': contractWith('uint32 immutable private TEST_WITH_ENDING_$;'),
        'ending with D$': contractWith('uint32 immutable private TEST_WITH_ENDING_D$;'),
        'only with $': contractWith('uint32 immutable private $;'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise immutable error for variables ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })
          assert.equal(report.errorCount, 0)
        })
      }
    })
  })

  describe('constant names should be in SNAKE_CASE', () => {
    it('should raise const name error', () => {
      const code = contractWith('uint private constant a;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('SNAKE_CASE'))
    })

    it('should not raise const name error for constants in snake case', () => {
      const code = contractWith('uint32 private constant THE_CONSTANT = 10;')

      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })

      assert.equal(report.errorCount, 0)
    })

    it('should not raise const name error for constants in snake case with single leading underscore', () => {
      const code = contractWith('uint32 private constant _THE_CONSTANT = 10;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
    })

    it('should not raise const name error for constants in snake case with double leading underscore', () => {
      const code = contractWith('uint32 private constant __THE_CONSTANT = 10;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
    })

    it('should raise const name error for constants in snake case with more than two leading underscores', () => {
      const code = contractWith('uint32 private constant ___THE_CONSTANT = 10;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('SNAKE_CASE'))
    })

    describe('constant name with $ character', () => {
      const WITH_$ = {
        'starting with $': contractWith('uint32 private constant $THE_CONSTANT = 10;'),
        'containing a $': contractWith('uint32 private constant THE_$_CONSTANT = 10;'),
        'ending with $': contractWith('uint32 private constant THE_CONSTANT$ = 10;'),
        'only with $': contractWith('uint32 private constant $ = 10;'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise error for  ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })

          assert.equal(report.errorCount, 0)
        })
      }
    })
  })
  describe('function names should be in mixedCase', () => {
    it('should raise incorrect func name error', () => {
      const code = contractWith('function AFuncName () public {}')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('mixedCase'))
    })

    it('should not raise incorrect func name error', () => {
      const code = contractWith('function aFunc1Nam23e () public {}')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
    })

    describe('Function names with $ character', () => {
      const WITH_$ = {
        'starting with $': contractWith('function $aFunc1Nam23e () public {}'),
        'containing a $': contractWith('function aFunc$1Nam23e () public {}'),
        'ending with $': contractWith('function aFunc1Nam23e$ () public {}'),
        'only with $': contractWith('function $() public {}'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise func name error for Functions ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })
          assert.equal(report.errorCount, 0)
        })
      }
    })
  })

  describe('modifier names should be in mixedCase', () => {
    ;['snake_case', 'twoTrailingUnderscores__', 'threeTrailingUnderscores___'].forEach((name) => {
      it(`should raise modifier name error on ${name}`, () => {
        const code = contractWith(`modifier ${name}(address a) { }`)
        const report = processStr(code, {
          rules: { 'style-guide-casing': 'error' },
        })
        assert.equal(report.errorCount, 1)
        assert.ok(report.messages[0].message.includes('mixedCase'))
      })
    })
    ;[
      'mixedCase',
      '_leadingUnderscore',
      '__twoLeadingUnderscores',
      '___threeLeadingUnderscores',
      'trailingUnderscore_',
    ].forEach((name) => {
      it(`should not raise modifier name error on ${name}`, () => {
        const code = contractWith(`modifier ${name}(address a) { }`)
        const report = processStr(code, {
          rules: { 'style-guide-casing': 'error' },
        })
        assert.equal(report.errorCount, 0)
      })
    })

    describe('with $ character', () => {
      const WITH_$ = {
        'starting with $': contractWith('modifier $ownedBy(address a) { }'),
        'containing a $': contractWith('modifier owned$By(address a) { }'),
        'ending with $': contractWith('modifier ownedBy$(address a) { }'),
        'only with $': contractWith('modifier $(uint a) { }'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise func name error for Modifiers ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })
          assert.equal(report.errorCount, 0)
        })
      }
    })
  })
  describe('mutable variable names should be in mixedCase', () => {
    it('should raise incorrect var name error', () => {
      const code = funcWith('var (a, B);')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.ok(report.errorCount > 0)
      assert.equal(report.messages[0].message, 'Variable name must be in mixedCase')
    })

    it('should raise incorrect func param name error', () => {
      const code = contractWith('function funcName (uint A) public {}')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('name'))
    })

    it('should raise var name error for event arguments illegal styling', () => {
      const code = contractWith('event Event1(uint B);')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('mixedCase'))
    })

    it('should raise incorrect var name error for typed declaration', () => {
      const code = funcWith('uint B = 1;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.ok(report.errorCount > 0)
      assert.equal(report.messages[0].message, 'Variable name must be in mixedCase')
    })

    it('should raise incorrect var name error for state declaration', () => {
      const code = contractWith('uint32 private D = 10;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('Variable name'))
    })

    describe('with $ character', () => {
      const WITH_$ = {
        'starting with $': contractWith('uint32 private $D = 10;'),
        'containing a $': contractWith('uint32 private testWith$Contained = 10;'),
        'ending with $': contractWith('uint32 private testWithEnding$ = 10;'),
        'only with $': contractWith('uint32 private $;'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise var name error for variables ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })
          assert.equal(report.errorCount, 0)
        })
      }
    })
  })
  describe('type definition names should be in CapWords', () => {
    ;[
      { name: 'contract', correct: 'contract FooBar{}', incorrect: 'contract foobar {}' },
      { name: 'interface', correct: 'interface FooBar{}', incorrect: 'interface foobar {}' },
      { name: 'library', correct: 'library FooBar{}', incorrect: 'library foobar {}' },
      {
        name: 'enum',
        correct: contractWith('enum Abc { Value, OtherValue }'),
        incorrect: contractWith('enum abc { Value, OtherValue }'),
      },
      {
        name: 'event',
        correct: contractWith('event SomethingHappened();'),
        incorrect: contractWith('event somethingHappened();'),
      },
      {
        name: 'struct',
        correct: contractWith('struct Thingy{uint256 a;}'),
        incorrect: contractWith('struct thingy{uint256 a;}'),
      },
    ].forEach(({ name, correct, incorrect }) => {
      it(`should raise error for ${name} with invalid name`, () => {
        const report = processStr(incorrect, {
          rules: { 'style-guide-casing': 'error' },
        })
        assert.equal(report.errorCount, 1)
        assert.ok(report.messages[0].message.includes('CapWords'))
        assert.ok(report.messages[0].message.includes(name))
      })

      it(`should NOT raise error for ${name} with valid name`, () => {
        const report = processStr(correct, {
          rules: { 'style-guide-casing': 'error' },
        })
        assert.equal(report.errorCount, 0)
      })
    })

    describe('name with $ character', () => {
      const WITH_$ = {
        'starting with $': contractWith('struct $MyStruct {}'),
        'containing a $': contractWith('struct My$Struct {}'),
        'ending with $': contractWith('struct MyStruct$ {}'),
        'only with $': contractWith('struct $ {}'),
      }

      for (const [key, code] of Object.entries(WITH_$)) {
        it(`should not raise contract name error for Structs ${key}`, () => {
          const report = processStr(code, {
            rules: { 'style-guide-casing': 'error' },
          })

          assert.equal(report.errorCount, 0)
        })
      }
    })
  })

  it('rule is included in solhint:recommended ruleset with warning severity', function () {
    const report = processStr('contract foo_bar{}', {
      rules: {
        ...configGetter('solhint:recommended').rules,
        'compiler-version': 'off',
        'no-empty-blocks': 'off',
      },
    })
    assert.equal(report.warningCount, 1)
    assert.ok(report.messages[0].message.includes('CapWords'))
  })
})
