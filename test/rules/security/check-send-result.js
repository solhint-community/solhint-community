const assert = require('assert')
const linter = require('../../../lib/index')
const { funcWith, multiLine } = require('../../common/contract-builder')

describe('Linter - check-send-result', () => {
  it('should return "send" call verification error', () => {
    const code = funcWith('x.send(55);')

    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(report.reports[0].message.includes('send'))
  })

  it('should not return "send" call verification error', () => {
    const code = funcWith('if(x.send(55)) {}')

    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })

    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when a require is used', () => {
    const code = funcWith('require(x.send(1));')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when a require is used with a custom gas amount', () => {
    const code = funcWith('require(x.send{gas: 9000}(1));')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when a require is used upper in the tree', () => {
    const code = funcWith('require(!x.send(1));')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when return value is assigned to a new variable', () => {
    let report = linter.processStr(funcWith('bool success = x.send(1);'), {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
    report = linter.processStr(funcWith('bool success = x.send{gas: 4000}(1);'), {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  // no-unused-var should take it from there
  it('do not emit error when return value is assigned to an existing variable', () => {
    let report = linter.processStr(funcWith('bool success = false; success = x.send(1);'), {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
    report = linter.processStr(funcWith('bool success;', 'success = x.send(1);'), {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when an assert is used', () => {
    const code = funcWith('assert(x.send(1));')

    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })

    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when an assert is used upper in the tree', () => {
    const code = funcWith('assert(x.send(1) || something);')

    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })

    assert.equal(report.errorCount, 0)
  })

  it('do not emit error when the expression is passed to a function', () => {
    const code = funcWith('doThingWithSendResult(x.send(1));')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('do not crash on other .send member access without a parent FunctionCall', function () {
    const code = funcWith(multiLine('uint256 amount = foo.send;', 'recipient.send(amount);'))
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 1)
  })

  it('do not emit error when the expression is passed to a function using a custom gas amount', function () {
    const code = funcWith('doThingWithSendResult(x.send{gas: 4000}(1));')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('should not emit error when the send() is used for an ERC777', () => {
    const code = funcWith('erc777.send(recipient, amount, "");')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('should not emit error when the send() is called on an ERC777', () => {
    const code = funcWith('erc777.send(recipient, amount, "");')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })

  it('should not emit error when the send() is used for an ERC777 with a custom gas amount', () => {
    const code = funcWith('erc777.send{gas: 15000}(recipient, amount, "");')
    const report = linter.processStr(code, {
      rules: { 'check-send-result': 'error' },
    })
    assert.equal(report.errorCount, 0)
  })
})
