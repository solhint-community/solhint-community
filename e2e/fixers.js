/* eslint-disable prefer-arrow-callback */

const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture, getFixtureFileContentSync } = require('./utils')

describe('e2e tests fixers', function () {
  describe('avoid-throw', () => {
    useFixture('09-fixers')

    it('GIVEN a file with a throw usage on disk WHEN fixing THEN it is replaced with revert', () => {
      const { code } = shell.exec('solhint --fix throw-error.sol')
      expect(code).to.equal(0)
      expect(getFixtureFileContentSync('throw-error.sol')).to.eq(
        getFixtureFileContentSync('throw-fixed.sol')
      )
    })
  })

  describe('avoid-sha3', () => {
    useFixture('09-fixers')

    it('GIVEN a file with a sha3 usage on disk WHEN fixing THEN it is replaced with keccak256', () => {
      const { code } = shell.exec('solhint --fix sha3-error.sol')
      expect(code).to.equal(0)
      expect(getFixtureFileContentSync('sha3-error.sol')).to.eq(
        getFixtureFileContentSync('sha3-fixed.sol')
      )
    })
  })
})
