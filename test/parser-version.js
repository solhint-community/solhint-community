const { assertErrorCount } = require('./common/asserts')
const linter = require('../lib/index')

describe('Parser versions', () => {
  it('should handle transient storage vars', () => {
    const report = linter.processStr('contract Foo { uint256 private transient _entered; }', {})

    assertErrorCount(report, 0)
  })
})
