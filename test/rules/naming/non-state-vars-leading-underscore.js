const assert = require('assert')
const { processStr } = require('../../../lib/index')
const { contractWith } = require('../../common/contract-builder')

const config = {
  rules: { 'non-state-vars-leading-underscore': 'error' },
}

describe('non-state-vars-leading-underscore', () => {
  describe('non state vars should have a leading underscore', function () {
    ;[
      {
        description: 'block variable',
        underscore: contractWith('function foo() public { uint _myVar; }'),
        noUnderscore: contractWith('function foo() public { uint myVar; }'),
      },
      {
        description: 'return variable',
        underscore: contractWith('function foo() public returns (uint256 _foo){}'),
        noUnderscore: contractWith('function foo() public returns (uint256 foo){}'),
      },
      {
        description: 'function param',
        underscore: contractWith('function foo( uint256 _foo ) public {}'),
        noUnderscore: contractWith('function foo( uint256 foo ) public {}'),
      },
      {
        description: 'file-level constant',
        underscore: 'uint256 constant _IMPORTANT_VALUE = 420;',
        noUnderscore: 'uint256 constant IMPORTANT_VALUE = 420;',
      },
    ].forEach(({ description, underscore, noUnderscore }) => {
      it(`should raise an error if a ${description} does not start with an underscore`, () => {
        const report = processStr(noUnderscore, config)
        assert.equal(report.errorCount, 1)
        assert(report.messages[0].message.includes('should start with _'))
      })

      it(`should NOT raise an error if a ${description} starts with an underscore`, () => {
        const report = processStr(underscore, config)
        assert.equal(report.errorCount, 0)
      })
    })
  })

  describe('state vars should NOT have a leading underscore', function () {
    ;[
      {
        description: 'immutable state variable',
        noUnderscore: contractWith('uint256 immutable foo;'),
        withUnderscore: contractWith('uint256 immutable _foo;'),
      },
      {
        description: 'constant state "variable"',
        noUnderscore: contractWith('uint256 constant foo;'),
        withUnderscore: contractWith('uint256 constant _foo;'),
      },
      {
        description: 'mutable state variable',
        noUnderscore: contractWith('uint256 foo;'),
        withUnderscore: contractWith('uint256 _foo;'),
      },
    ].forEach(({ description, noUnderscore, withUnderscore }) => {
      it(`should raise an error if a ${description} starts with an underscore`, () => {
        const report = processStr(withUnderscore, config)
        assert.equal(report.errorCount, 1)
        assert(report.messages[0].message.includes('should not start with _'))
      })

      it(`should NOT raise an error if a ${description} doesnt start with an underscore`, () => {
        const report = processStr(noUnderscore, config)
        assert.equal(report.errorCount, 0)
      })
    })
  })
})
