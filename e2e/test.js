/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */

const { expect } = require('chai')
const cp = require('child_process')
const fs = require('fs-extra')
const getStream = require('get-stream')
const os = require('os')
const path = require('path')
const shell = require('shelljs')

function useFixture(dir) {
  beforeEach(`switch to ${dir}`, function () {
    const fixturePath = path.join(__dirname, dir)

    const tmpDirContainer = os.tmpdir()
    this.testDirPath = path.join(tmpDirContainer, `solhint-tests-${dir}`)

    fs.ensureDirSync(this.testDirPath)
    fs.emptyDirSync(this.testDirPath)

    fs.copySync(fixturePath, this.testDirPath)

    shell.cd(this.testDirPath)
  })
}

describe('e2e', function () {
  describe('no config', function () {
    useFixture('01-no-config')
    describe('GIVEN a config file created with solhint --init', function () {
      beforeEach(function () {
        shell.exec('solhint --init')
      })

      it('WHEN linting a file, THEN the config is used ', function () {
        const { code, stdout } = shell.exec('solhint Foo.sol')
        expect(code).to.equal(1)
        expect(stdout.trim()).to.contain('Code contains empty blocks')
      })
    })

    it('should fail', function () {
      const { code } = shell.exec('solhint Foo.sol')

      expect(code).to.equal(1)
    })

    it('should create an initial config with --init', function () {
      const { code } = shell.exec('solhint --init')

      expect(code).to.equal(0)

      const solhintConfigPath = path.join(this.testDirPath, '.solhint.json')

      expect(fs.existsSync(solhintConfigPath)).to.be.true
    })

    it('should print usage if called without arguments', function () {
      const { code, stdout } = shell.exec('solhint')

      expect(code).to.equal(0)

      expect(stdout).to.include('Usage: solhint [options]')
      expect(stdout).to.include('Linter for Solidity programming language')
      expect(stdout).to.include('linting of source code data provided to STDIN')
    })
  })

  describe('empty-config', function () {
    useFixture('02-empty-solhint-json')

    it('should print nothing', function () {
      const { code, stdout } = shell.exec('solhint Foo.sol')

      expect(code).to.equal(0)

      expect(stdout.trim()).to.equal('')
    })

    it('should show warning when using --init', function () {
      const { code, stdout } = shell.exec('solhint --init')

      expect(code).to.equal(0)

      expect(stdout.trim()).to.equal('Configuration file already exists')
    })
  })

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

    describe('formatters', function () {
      it('unix', async function () {
        const { stdout } = shell.exec('solhint Foo.sol --formatter unix')
        const lines = stdout.split('\n')
        expect(lines[0]).to.eq('Foo.sol:3:1: Code contains empty blocks [Error/no-empty-blocks]')
        expect(lines[2]).to.eq('1 problem')
      })

      it('tap', async function () {
        const { stdout } = shell.exec('solhint Foo.sol --formatter tap')
        const lines = stdout.split('\n')

        expect(lines[0]).to.eq('TAP version 13')
        expect(lines[1]).to.eq('1..1')
        expect(lines[2]).to.eq('not ok 1 - Foo.sol')
        expect(lines[3]).to.eq('  ---')
        expect(lines[4]).to.eq('  message: Code contains empty blocks')
        expect(lines[5]).to.eq('  severity: error')
        expect(lines[6]).to.eq('  data:')
        expect(lines[7]).to.eq('    line: 3')
        expect(lines[8]).to.eq('    column: 1')
        expect(lines[9]).to.eq('    ruleId: no-empty-blocks')
      })

      it('stylish', async function () {
        const { stdout } = shell.exec('solhint Foo.sol --formatter stylish')
        const lines = stdout.split('\n')

        expect(lines[1]).to.eq('Foo.sol')
        expect(lines[2]).to.eq('  3:1  error  Code contains empty blocks  no-empty-blocks')
        expect(lines[4]).to.eq('✖ 1 problem (1 error, 0 warnings)')
      })

      it('compact', async function () {
        const { stdout } = shell.exec('solhint Foo.sol --formatter compact')
        const lines = stdout.split('\n')
        expect(lines[0]).to.eq(
          'Foo.sol: line 3, col 1, Error - Code contains empty blocks (no-empty-blocks)'
        )
        expect(lines[2]).to.eq('1 problem')
      })

      it('table', async function () {
        const { stdout } = shell.exec('solhint Foo.sol --formatter table')
        const lines = stdout.split('\n')

        expect(lines[1]).to.eq('Foo.sol')
        expect(lines[3]).to.eq(
          '║ Line     │ Column   │ Type     │ Message                                                │ Rule ID              ║'
        )
        expect(lines[4]).to.eq(
          '╟──────────┼──────────┼──────────┼────────────────────────────────────────────────────────┼──────────────────────╢'
        )
        expect(lines[5]).to.eq(
          '║ 3        │ 1        │ error    │ Code contains empty blocks                             │ no-empty-blocks      ║'
        )
        expect(lines[7]).to.eq(
          '╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗'
        )
        expect(lines[8]).to.eq(
          '║ 1 Error                                                                                                        ║'
        )
        expect(lines[9]).to.eq(
          '╟────────────────────────────────────────────────────────────────────────────────────────────────────────────────╢'
        )
        expect(lines[10]).to.eq(
          '║ 0 Warnings                                                                                                     ║'
        )
        expect(lines[11]).to.eq(
          '╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝'
        )
      })
    })
  })

  describe('.sol on path', function () {
    useFixture('04-dotSol-on-path')

    it('should handle directory names that end with .sol', function () {
      const { code } = shell.exec('solhint contracts/**/*.sol')

      expect(code).to.equal(0)
    })
  })
})
