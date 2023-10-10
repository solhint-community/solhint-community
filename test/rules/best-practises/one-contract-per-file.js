const { assertNoErrors, assertErrorMessage, assertErrorCount } = require('../../common/asserts')
const linter = require('../../../lib/index')
const contracts = require('../../fixtures/best-practises/one-contract-per-file')

describe('Linter - one-contract-per-file', () => {
  it('should not raise error for zero contracts', () => {
    const report = linter.processStr('pragma solidity ^0.8.14;', {
      rules: { 'one-contract-per-file': 'error' },
    })
    assertNoErrors(report)
  })

  it('should not raise error for ONE contract only', () => {
    const code = contracts.ONE_CONTRACT

    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })
    assertNoErrors(report)
  })

  it('should raise error for one library and one contract in same file', () => {
    const code = contracts.ONE_CONTRACT_ONE_LIBRARY
    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Found more than one contract per file. 2 contracts found!')
  })

  it('should raise error for TWO contracts in same file', () => {
    const code = contracts.TWO_CONTRACTS
    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Found more than one contract per file. 2 contracts found!')
  })

  it('should raise error for THREE contracts in same file', () => {
    const code = contracts.THREE_CONTRACTS
    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Found more than one contract per file. 3 contracts found!')
  })
})
