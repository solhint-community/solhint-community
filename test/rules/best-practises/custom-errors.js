const {
  assertNoWarnings,
  assertNoErrors,
  assertErrorMessage,
  assertErrorCount,
} = require('../../common/asserts')
const { configGetter } = require('../../../lib/config/config-file')
const linter = require('../../../lib/index')
const { funcWith } = require('../../common/contract-builder')

describe('Linter - custom-errors', () => {
  it('should raise error for revert()', () => {
    const code = funcWith(`revert();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
  })

  it('should raise error for revert([string])', () => {
    const code = funcWith(`revert("Insufficent funds");`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of revert statement')
  })

  it('should NOT raise error for revert ErrorFunction()', () => {
    const code = funcWith(`revert ErrorFunction();`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should NOT raise error for revert ErrorFunction() with arguments', () => {
    const code = funcWith(`revert ErrorFunction({ msg: "Insufficent funds msg" });`, '0.8.5')
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should raise error for require', () => {
    const code = funcWith(
      `require(!has(role, account), "Roles: account already has role");
        role.bearer[account] = true;role.bearer[account] = true;
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Use Custom Errors instead of require statement')
  })

  it('should NOT raise error for regular function call', () => {
    const code = funcWith(
      `callOtherFunction();
        role.bearer[account] = true;role.bearer[account] = true;
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { 'custom-errors': 'error' },
    })
    assertNoWarnings(report)
    assertNoErrors(report)
  })

  it('should be included in [recommended] config', () => {
    const code = funcWith(
      `require(!has(role, account), "Roles: account already has role");
        revert("RevertMessage");
        revert CustomError();
    `,
      '0.8.5'
    )
    const report = linter.processStr(code, {
      rules: { ...configGetter('solhint:recommended').rules, 'compiler-version': 'off' },
    })

    assertErrorCount(report, 2)
    assertErrorMessage(report, 0, 'Use Custom Errors instead of require statements')
    assertErrorMessage(report, 1, 'Use Custom Errors instead of revert statements')
  })
})
