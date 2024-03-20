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
      const { code, stdout } = shell.exec('solhint Foo.sol', { silent: true })
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
})
