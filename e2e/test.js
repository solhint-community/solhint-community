/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')
const shell = require('shelljs')
const { useFixture } = require('./utils')

describe('main executable tests', function () {
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

  describe('.sol on path', function () {
    useFixture('04-dotSol-on-path')

    it('should handle directory names that end with .sol', function () {
      const { code } = shell.exec('solhint contracts/**/*.sol')

      expect(code).to.equal(0)
    })
  })

  describe('--max-warnings parameter tests', function () {
    useFixture('05-max-warnings')
    const warningExceededMsg = 'Solhint found more warnings than the maximum specified'
    let code
    let stdout

    describe('GIVEN a contract with no errors and 6 warnings', function () {
      describe('WHEN linting with --max-warnings 7 ', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint contracts/NoErrors6Warnings.sol --max-warnings 7'
          ))
        })
        it('THEN it does NOT display warnings exceeded message', function () {
          expect(stdout.trim()).to.not.contain(warningExceededMsg)
        })
        it('AND it exits without error', function () {
          expect(code).to.equal(0)
        })
      })

      describe('WHEN linting with --max-warnings 3 ', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint contracts/NoErrors6Warnings.sol --max-warnings 3'
          ))
        })
        it('THEN displays warnings exceeded message', function () {
          expect(stdout.trim()).to.contain(warningExceededMsg)
        })
        it('AND it exits with error 1', function () {
          expect(code).to.equal(1)
        })
      })
    })

    describe('GIVEN a contract with one error and 14 warnings', function () {
      describe('WHEN linting with --max-warnings 3 ', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint contracts/OneError14Warnings.sol --max-warnings 3'
          ))
        })
        it('THEN it exits error code 1', function () {
          expect(code).to.equal(1)
        })
        it('AND does not to print the "there are too many warnings" message', function () {
          expect(stdout.trim()).to.not.contain(warningExceededMsg)
        })
      })
    })
  })

  describe('list-rules ', function () {
    let code
    let stdout
    let stderr

    describe('GIVEN a config file on the default path with 2 rules on and 1 off', function () {
      useFixture('08-list-rules')
      describe('WHEN executing with list-rules', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec('solhint list-rules'))
        })
        it('THEN it completes without error', function () {
          expect(code).to.equal(0)
        })
        it('AND it lists enabled rules', function () {
          expect(stdout).to.contain('compiler-version')
          expect(stdout).to.contain('no-empty-blocks')
        })
        it('AND it does NOT list disabled rules', function () {
          expect(stdout).to.not.contain('func-visibility')
        })
      })
    })

    describe('GIVEN a config file on a custom path with 2 rules on and 1 off', function () {
      useFixture('08-list-rules')
      describe('WHEN executing with list-rules -c config-file-with-weird-name.json', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec('solhint list-rules -c config-file-with-weird-name.json'))
        })
        it('THEN it completes without error', function () {
          expect(code).to.equal(0)
        })
        it('AND it lists enabled rules', function () {
          expect(stdout).to.contain('compiler-version')
          expect(stdout).to.contain('no-empty-blocks')
          expect(stdout).to.contain('func-visibility')
          expect(stdout).to.contain('no-empty-blocks')
        })
        it('AND it does NOT list disabled rules', function () {
          expect(stdout).to.not.contain('not-rely-on-time')
        })
      })
    })

    describe('GIVEN non-existing config file', function () {
      useFixture('01-no-config')
      describe('WHEN executing with list-rules', function () {
        beforeEach(function () {
          ;({ code, stdout, stderr } = shell.exec(
            'solhint list-rules -c config-file-with-weird-name.json'
          ))
        })
        it('THEN it returns error code 1', function () {
          expect(code).to.equal(1)
        })
        it('AND it reports the problem to stderr', function () {
          expect(stderr).to.contain('config file passed as a parameter does not exist')
        })
        it('AND it does NOT list disabled rules', function () {
          expect(stdout).to.eq('')
        })
      })
    })
  })
})
