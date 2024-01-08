const assert = require('assert')
const { processStr } = require('../../../lib/index')
const { configGetter } = require('../../../lib/config/config-file')

const config = {
  rules: { 'interface-starts-with-i': 'error' },
}

describe('Linter - interface-starts-with-i', () => {
  it('should raise error for interface not starting with I', () => {
    const code = 'interface Foo {}'
    const report = processStr(code, config)

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message === `Interface name 'Foo' must start with "I"`)
  })

  it('should be included in recommended config', () => {
    const code = 'interface Foo {function Foo() external;}'
    const report = processStr(code, {
      rules: { ...configGetter('solhint:recommended').rules, 'compiler-version': 'off' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message === `Interface name 'Foo' must start with "I"`)
  })

  it('should not raise error for interface starting with I', () => {
    const code = 'interface IFoo {}'
    const report = processStr(code, config)

    assert.equal(report.errorCount, 0)
  })
})
