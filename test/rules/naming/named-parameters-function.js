const linter = require('../../../lib/index')
const { assertNoWarnings, assertWarnsCount, assertErrorMessage } = require('../../common/asserts')
const { contractWith, multiLine } = require('../../common/contract-builder')

describe('Linter - named-parameters-function', () => {
  it('GIVEN a setting of 4, should NOT warn on calling with four positional arguments', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c, uint d) {}', `function bar (){foo(1,2,3,4);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 4] },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a default solhint config, THEN the rule is disabled and no errors are reported', () => {
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

  it('GIVEN a setting of 0, should NOT warn on calling with no arguments', () => {
    const code = contractWith(multiLine('function foo() {}', `function bar (){foo();}`))

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 0] },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a setting of 0, should warn on calls with one positional argument', () => {
    const code = contractWith(multiLine('function foo(uint a) {}', `function bar (){foo(3);}`))

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 0] },
    })

    assertWarnsCount(report, 1)
  })

  it('GIVEN a setting of 2, should warn on calls with 3 positional argument', () => {
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

  it('GIVEN default settings, should NOT warn on calling with two positional arguments', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b) {}', `function bar (){foo(1,2);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': 'warn' },
    })

    assertNoWarnings(report)
  })

  it('GIVEN default settings, should warn on calling with four positional arguments', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c, uint d) {}', `function bar (){foo(1,2,3,4);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': 'warn' },
    })

    assertWarnsCount(report, 1)
    assertErrorMessage(
      report,
      'Call to function with arity > 3 is using positional arguments. Use named arguments instead.'
    )
  })

  it('GIVEN default settings, should NOT warn on calling with four named arguments', () => {
    const code = contractWith(
      multiLine(
        'function foo(uint a, uint b, uint c, uint d) {}',
        `function bar (){foo({a: 1, b: 2, c:3, d:4});}`
      )
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': 'warn' },
    })
    assertNoWarnings(report)
  })
})
