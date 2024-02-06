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

    it('should NOT raise error when variable is in camelCase AND config ignores immutables', () => {
      const code = contractWith('uint32 private immutable camelCase;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': ['error', { ignoreImmutables: true }] },
      })
      assert.equal(report.errorCount, 0)
    })

    it('should NOT raise error when variable is in SNAKE_CASE and has a trailing underscore', () => {
      const code = contractWith('uint32 private immutable SNAKE_CASE_;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
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

    it('should NOT raise error when variable is in camelCase AND config ignores constants', () => {
      const code = contractWith('uint32 private constant camelCase;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': ['error', { ignoreConstants: true }] },
      })
      assert.equal(report.errorCount, 0)
    })

    it('should not raise const name error for constants in snake case', () => {
      const code = contractWith('uint32 private constant THE_CONSTANT = 10;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
    })

    it('should not raise const name error for constants in snake case with a trailing underscore', () => {
      const code = contractWith('uint32 private constant THE_CONSTANT_ = 10;')
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
    describe('disabling rule for different visibilities in config', function () {
      ;[
        {
          configKey: 'ignoreExternalFunctions',
          code: contractWith('function foo_bar() external {}'),
          name: 'external',
        },
        {
          configKey: 'ignoreInternalFunctions',
          code: contractWith('function foo_bar() internal {}'),
          name: 'internal',
        },
        {
          configKey: 'ignorePublicFunctions',
          code: contractWith('function foo_bar() public {}'),
          name: 'public',
        },
        {
          configKey: 'ignorePrivateFunctions',
          code: contractWith('function foo_bar() private {}'),
          name: 'private',
        },
        {
          configKey: 'ignoreInternalFunctions',
          code: 'function foo_bar() {}',
          name: 'free',
        },
      ].forEach(({ configKey, code, name }) => {
        it(`should not raise error for ${name} function`, function () {
          const report = processStr(code, { [configKey]: true })
          assert.equal(report.errorCount, 0)
        })
      })
    })

    it('should raise func name error when a free function is in CapWords', () => {
      const code = 'function AFuncName () {}'
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('mixedCase'))
    })

    it('should raise func name error when a contract function is in CapWords', () => {
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
    it('should NOT raise error when modifier name is snake_case AND config ignores it', () => {
      const code = contractWith('modifier snake_case(address a) { }')
      const report = processStr(code, {
        rules: { 'style-guide-casing': ['error', { ignoreModifiers: true }] },
      })
      assert.equal(report.errorCount, 0)
    })
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
      'mixedCaseWithOneTrailingUnderscore_',
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
    it('should NOT raise error when variable is in camelCase AND config ignores variables', () => {
      const code = contractWith('uint32 camelCase;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': ['error', { ignoreVariables: true }] },
      })
      assert.equal(report.errorCount, 0)
    })
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

    it('should NOT raise var name error for variable with trailing underscore', () => {
      const code = contractWith('uint256 private foo_;')
      const report = processStr(code, {
        rules: { 'style-guide-casing': 'error' },
      })
      assert.equal(report.errorCount, 0)
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
      { name: 'Contracts', correct: 'contract FooBar{}', incorrect: 'contract foobar {}' },
      { name: 'Interfaces', correct: 'interface FooBar{}', incorrect: 'interface foobar {}' },
      { name: 'Interfaces', correct: 'interface FooBar{}', incorrect: 'interface foobar {}' },
      { name: 'Interfaces', correct: 'interface FooBar_{}', incorrect: 'interface foobar_ {}' },
      { name: 'Libraries', correct: 'library FooBar{}', incorrect: 'library foobar {}' },
      {
        name: 'Enums',
        correct: contractWith('enum Abc { Value, OtherValue }'),
        incorrect: contractWith('enum abc { Value, OtherValue }'),
      },
      {
        name: 'Events',
        correct: contractWith('event SomethingHappened();'),
        incorrect: contractWith('event somethingHappened();'),
      },
      {
        name: 'Structs',
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
      })

      it(`should NOT raise error for ${name} with valid name`, () => {
        const report = processStr(correct, {
          rules: { 'style-guide-casing': 'error' },
        })
        assert.equal(report.errorCount, 0)
      })

      it(`should NOT raise error for ${name} with invalid name AND a config disabling it`, () => {
        const report = processStr(incorrect, {
          rules: { 'style-guide-casing': ['error', { [`ignore${name}`]: true }] },
        })
        assert.equal(report.errorCount, 0)
      })
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
