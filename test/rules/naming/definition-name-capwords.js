const assert = require('assert')
const linter = require('../../../lib/index')
const { contractWith } = require('../../common/contract-builder')
const { configGetter } = require('../../../lib/config/config-file')

describe('Linter - definition-name-capwords rule', () => {
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
      const report = linter.processStr(incorrect, {
        rules: { 'definition-name-capwords': 'error' },
      })
      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('CapWords'))
      assert.ok(report.messages[0].message.includes(name))
    })

    it(`should NOT raise error for ${name} with valid name`, () => {
      const report = linter.processStr(correct, {
        rules: { 'definition-name-capwords': 'error' },
      })
      assert.equal(report.errorCount, 0)
    })
  })

  it('rule is included in solhint:recommended ruleset with error severity', function () {
    const report = linter.processStr('contract foo_bar{}', {
      rules: {
        ...configGetter('solhint:recommended').rules,
        'compiler-version': 'off',
        'no-empty-blocks': 'off',
      },
    })
    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message.includes('CapWords'))
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
        const report = linter.processStr(code, {
          rules: { 'definition-name-capwords': 'error' },
        })

        assert.equal(report.errorCount, 0)
      })
    }
  })
})
