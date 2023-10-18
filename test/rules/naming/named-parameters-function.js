const linter = require('../../../lib/index')
const { assertNoWarnings, assertWarnsCount, assertErrorMessage } = require('../../common/asserts')
const { contractWith, multiLine } = require('../../common/contract-builder')

describe('Linter - named-parameters-function', () => {
  describe('GIVEN default rule settings', function () {
    const config = {
      rules: { 'named-parameters-function': 'warn' },
    }

    it('WHEN calling with two positional arguments THEN it does NOT report', () => {
      const code = contractWith(
        multiLine('function foo(uint a, uint b) {}', `function bar (){foo(1,2);}`)
      )
      assertNoWarnings(linter.processStr(code, config))
    })
    it('WHEN calling with four positional arguments THEN it reports', () => {
      const code = contractWith(
        multiLine(
          'function foo(uint a, uint b, uint c, uint d) {}',
          `function bar (){foo(1,2,3,4);}`
        )
      )
      const report = linter.processStr(code, config)
      assertWarnsCount(report, 1)
      assertErrorMessage(
        report,
        'Call to function with arity > 3 is using positional arguments. Use named arguments instead.'
      )
    })
    it('WHEN calling with four named arguments THEN it does NOT report', () => {
      const code = contractWith(
        multiLine(
          'function foo(uint a, uint b, uint c, uint d) {}',
          `function bar (){foo({a: 1, b: 2, c:3, d:4});}`
        )
      )
      assertNoWarnings(linter.processStr(code, config))
    })
  })

  describe('GIVEN a setting of zero', function () {
    const config = {
      rules: { 'named-parameters-function': ['warn', 0] },
    }
    it('WHEN calling no arguments THEN it does NOT report', () => {
      const code = contractWith(multiLine('function foo() {}', `function bar (){foo();}`))
      assertNoWarnings(linter.processStr(code, config))
    })
    it('WHEN calling with one positional argument THEN it reports', () => {
      const code = contractWith(multiLine('function foo(uint a) {}', `function bar (){foo(3);}`))
      assertWarnsCount(linter.processStr(code, config), 1)
    })
  })

  it('GIVEN a setting of 4, THEN it does NOT warn on calls with four positional arguments', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c, uint d) {}', `function bar (){foo(1,2,3,4);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 4] },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a recommended solhint config, THEN the rule is disabled and no errors are reported', () => {
    const code = contractWith(
      multiLine(
        'function foo(uint a, uint b, uint c, uint d) public {}',
        `function bar () public {foo(1,2,3,4);}`
      )
    )

    const report = linter.processStr(code, {
      extends: 'solhint:recommended',
      rules: { 'compiler-version': 'off', 'no-empty-blocks': 'off' },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a setting of 2, THEN it warns on calls with 3 positional argument', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c) {}', `function bar (){foo(1,2,3);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 2] },
    })

    assertWarnsCount(report, 1)
    assertErrorMessage(
      report,
      'Call to function with arity > 2 is using positional arguments. Use named arguments instead.'
    )
  })
})
