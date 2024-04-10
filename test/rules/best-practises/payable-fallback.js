const { assertNoWarnings, assertErrorMessage, assertWarnsCount } = require('../../common/asserts')
const linter = require('../../../lib/index')
const { contractWith, multiLine } = require('../../common/contract-builder')

describe('Linter - payable-fallback', () => {
  it('should raise warn when fallback is not payable', () => {
    const code = contractWith('fallback () public {}')
    const report = linter.processStr(code, {
      rules: { 'payable-fallback': 'warn' },
    })
    assertWarnsCount(report, 1)
    assertErrorMessage(report, 'payable')
  })

  it('should not raise warn when fallback is payable -- legacy grammar', () => {
    const code = contractWith('function () public payable {}')
    const report = linter.processStr(code, {
      rules: { 'payable-fallback': 'warn' },
    })
    assertNoWarnings(report)
  })

  it('should not raise warn when fallback is payable', () => {
    const code = contractWith('fallback () public payable {}')
    const report = linter.processStr(code, {
      rules: { 'payable-fallback': 'warn' },
    })
    assertNoWarnings(report)
  })

  it('should ignore contracts without fallback functions', () => {
    const code = contractWith('function f() {} function g() payable {}')
    const report = linter.processStr(code, {
      rules: { 'payable-fallback': 'warn' },
    })
    assertNoWarnings(report)
  })

  it('should NOT warn when fallback is not payable AND there is a receive function', function () {
    const code = contractWith(multiLine('function () public {}', 'receive() public{}'))
    const report = linter.processStr(code, {
      rules: { 'payable-fallback': 'warn' },
    })
    assertNoWarnings(report)
  })
})
