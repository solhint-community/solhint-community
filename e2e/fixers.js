/* eslint-disable prefer-arrow-callback */

const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture, getFixtureFileContentSync } = require('./utils')

describe('e2e tests fixers', function () {
  describe('avoid-throw', () => {
    useFixture('09-fixers')

    it('GIVEN a file with a throw usage on disk WHEN fixing THEN it is replaced with revert', () => {
      const { code } = shell.exec('solhint --fix throw-error.sol', { silent: true })
      expect(code).to.equal(0)
      expect(getFixtureFileContentSync('throw-error.sol')).to.eq(
        getFixtureFileContentSync('throw-fixed.sol')
      )
    })

    it('GIVEN a file with a throw usage on stdin WHEN fixing THEN it is replaced with revert on stdout', () => {
      const { code, stdout } = shell.exec(
        'solhint stdin --fix --filename foo.sol < throw-error.sol',
        { silent: true }
      )
      expect(code).to.equal(0)
      expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
    })
  })

  describe('avoid-sha3', () => {
    useFixture('09-fixers')

    it('GIVEN a file with a sha3 usage on disk WHEN fixing THEN it is replaced with keccak256', () => {
      const { code } = shell.exec('solhint --fix sha3-error.sol', { silent: true })
      expect(code).to.equal(0)
      expect(getFixtureFileContentSync('sha3-error.sol')).to.eq(
        getFixtureFileContentSync('sha3-fixed.sol')
      )
    })
  })

  describe('explicit-types', () => {
    useFixture('09-fixers')

    it('GIVEN a contract with an implicit uint state var on disk WHEN fixing THEN it is replaced with uint256', () => {
      const { code } = shell.exec('solhint --fix explicit-types-error.sol', { silent: false })
      expect(code).to.equal(0)
      expect(getFixtureFileContentSync('explicit-types-error.sol')).to.eq(
        getFixtureFileContentSync('explicit-types-fixed.sol')
      )
    })
  })
})
