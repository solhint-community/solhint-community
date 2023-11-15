/* eslint-disable prefer-arrow-callback */

const { expect } = require('chai')
const cp = require('child_process')
const getStream = require('get-stream')
const shell = require('shelljs')
const { useFixture } = require('./utils')

describe('e2e tests for rules', function () {
  describe('no-empty-blocks', function () {
    useFixture('03-no-empty-blocks')

    it('should exit with 1', function () {
      const { code, stdout } = shell.exec('solhint Foo.sol')
      expect(code).to.equal(1)
      expect(stdout.trim()).to.contain('Code contains empty blocks')
    })

    it('should work with stdin', async function () {
      const child = cp.exec('solhint stdin')
      const stdoutPromise = getStream(child.stdout)
      const codePromise = new Promise((resolve) => {
        child.on('close', (code) => {
          resolve(code)
        })
      })
      child.stdin.write('contract Foo {}')
      child.stdin.end()

      const code = await codePromise
      expect(code).to.equal(1)
      const stdout = await stdoutPromise
      expect(stdout.trim()).to.contain('Code contains empty blocks')
    })
  })

  describe('foundry-test-functions', () => {
    // Foo contract has 1 warning
    // FooTest contract has 1 error
    useFixture('07-foundry-test')

    it(`should raise error for wrongFunctionDefinitionName() only`, () => {
      const { code, stdout } = shell.exec('solhint -c test/.solhint.json test/FooTest.sol')

      expect(code).to.equal(1)
      expect(stdout.trim()).to.contain(
        'Function wrongFunctionDefinitionName() must match Foundry test naming convention'
      )
      expect(stdout.trim()).to.contain('(1 error')
    })
  })
})
