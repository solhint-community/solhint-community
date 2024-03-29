const {
  assertNoErrors,
  assertNoWarnings,
  assertErrorMessage,
  assertErrorCount,
  assertWarnsCount,
} = require('../../common/asserts')
const linter = require('../../../lib/index')
const { configGetter } = require('../../../lib/config/config-file')
const contracts = require('../../fixtures/best-practises/one-contract-per-file')

describe('Linter - one-contract-per-file', () => {
  it('should be included in recommended config', () => {
    const report = linter.processStr(contracts.TWO_CONTRACTS, {
      rules: {
        ...configGetter('solhint:recommended').rules,
        'no-empty-blocks': 'off',
        'style-guide-casing': 'off',
        'compiler-version': 'off',
      },
    })
    assertWarnsCount(report, 1)
    assertErrorMessage(report, 'Found more than one contract per file. 2 contracts found!')
  })

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

  it('should not raise error for ONE contract and multiple interfaces in the same file', () => {
    const code = contracts.ONE_CONTRACT_WITH_INTERFACES

    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertNoWarnings(report)
  })

  it('should not raise error for ONE library and multiple interfaces in the same file', () => {
    const code = contracts.ONE_LIBRARY_WITH_INTERFACES

    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertNoWarnings(report)
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

  it('should raise error for TWO libraries in same file', () => {
    const code = contracts.TWO_LIBRARIES

    const report = linter.processStr(code, {
      rules: { 'one-contract-per-file': 'error' },
    })

    assertErrorCount(report, 1)
    assertErrorMessage(report, 'Found more than one contract per file. 2 contracts found!')
  })
})
