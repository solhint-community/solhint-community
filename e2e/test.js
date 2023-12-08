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
        shell.exec('solhint --init', { silent: true })
      })

      it('WHEN linting a file, THEN the config is used ', function () {
        const { code, stdout } = shell.exec('solhint Foo.sol', { silent: true })
        expect(code).to.equal(1)
        expect(stdout.trim()).to.contain('Code contains empty blocks')
      })
    })

    it('should fail', function () {
      const { code } = shell.exec('solhint Foo.sol', { silent: true })

      expect(code).to.equal(1)
    })

    it('should create an initial config with --init', function () {
      const { code } = shell.exec('solhint --init', { silent: true })

      expect(code).to.equal(0)

      const solhintConfigPath = path.join(this.testDirPath, '.solhint.json')

      expect(fs.existsSync(solhintConfigPath)).to.be.true
    })

    it('should print usage if called without arguments', function () {
      const { code, stdout } = shell.exec('solhint', { silent: true })

      expect(code).to.equal(0)

      expect(stdout).to.include('Usage: solhint [options]')
      expect(stdout).to.include('Linter for Solidity programming language')
      expect(stdout).to.include('linting of source code data provided to STDIN')
    })
  })

  describe('invalid config', function () {
    useFixture('13-invalid-configs')
    let code
    let stderr
    let stdout
    describe('GIVEN a config file with invalid syntax, WHEN linting', function () {
      beforeEach(function () {
        ;({ code, stderr, stdout } = shell.exec('solhint -c broken-json-syntax.json Foo.sol', {
          silent: true,
        }))
      })

      it('THEN linter exits with error 1', function () {
        expect(code).to.equal(1)
      })
      it('AND stdout is empty', function () {
        expect(stdout.trim()).to.eq('')
      })
      it('AND stderr logs whats wrong with the file', function () {
        expect(stderr.trim()).to.include('Solhint configuration is invalid')
        expect(stderr.trim()).to.include('JSONError')
      })
    })

    describe('GIVEN a config file with an unexpected field, WHEN linting', function () {
      beforeEach(function () {
        ;({ code, stderr, stdout } = shell.exec('solhint -c extraneous-field.json Foo.sol', {
          silent: true,
        }))
      })

      it('THEN linter exits with error 1', function () {
        expect(code).to.equal(1)
      })
      it('AND stdout is empty', function () {
        expect(stdout.trim()).to.eq('')
      })
      it('AND stderr logs whats wrong with the file', function () {
        expect(stderr.trim()).to.include('Solhint configuration is invalid')
        expect(stderr.trim()).to.include('Unexpected top-level property')
      })
    })

    describe('GIVEN a config file with a unexpected field type, WHEN linting', function () {
      beforeEach(function () {
        ;({ code, stderr, stdout } = shell.exec('solhint -c broken-schema.json Foo.sol', {
          silent: true,
        }))
      })

      it('THEN linter exits with error 1', function () {
        expect(code).to.equal(1)
      })
      it('AND stdout is empty', function () {
        expect(stdout.trim()).to.eq('')
      })
      it('AND stderr logs whats wrong with the file', function () {
        expect(stderr.trim()).to.include('Solhint configuration is invalid')
        expect(stderr.trim()).to.include('is the wrong type')
      })
    })

    describe('WHEN the config file extends a inexistent solhint core config', function () {
      beforeEach(function () {
        ;({ code, stderr, stdout } = shell.exec('solhint -c inexistent-core-extend.json Foo.sol', {
          silent: true,
        }))
      })

      it('THEN linter exits with error 1', function () {
        expect(code).to.equal(1)
      })
      it('AND stdout is empty', function () {
        expect(stdout.trim()).to.eq('')
      })
      it('AND stderr logs whats wrong with the file', function () {
        expect(stderr.trim()).to.include('ConfigMissing')
        expect(stderr.trim()).to.include('Failed to load config "solhint:verygood" to extend from')
      })
    })
  })

  describe('empty-config', function () {
    useFixture('02-empty-solhint-json')

    it('should print nothing', function () {
      const { code, stdout } = shell.exec('solhint Foo.sol', { silent: true })

      expect(code).to.equal(0)

      expect(stdout.trim()).to.equal('')
    })

    it('should show warning when using --init', function () {
      const { code, stdout } = shell.exec('solhint --init', { silent: true })

      expect(code).to.equal(0)

      expect(stdout.trim()).to.equal('Configuration file already exists')
    })
  })

  describe('.sol on path', function () {
    useFixture('04-dotSol-on-path')

    it('should handle directory names that end with .sol', function () {
      const { code } = shell.exec('solhint contracts/**/*.sol', { silent: true })

      expect(code).to.equal(0)
    })
  })

  // I used different config files and the same source file so it's testing both
  // functionalities. Since they're regressions for features already in
  // production, I'm gonna lean on being lazy for now and put something better
  // in place when/if we get rid of the stdin subcommand
  describe('--quiet and --config are respected', function () {
    useFixture('09-fixers')
    let code
    let stdout
    describe('WHEN checking a file with one warning and one error AND using --quiet', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint -c error-warning.json -q throw-error.sol', {
          silent: true,
        }))
      })
      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it('AND reports only one problem', function () {
        expect(stdout).to.include('1 problem')
        expect(stdout).to.include('1 error')
        expect(stdout).to.include('0 warnings')
      })
    })

    describe('WHEN checking a file with only warnings AND using --quiet', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint -c warning-rules.json -q throw-error.sol', {
          silent: true,
        }))
      })
      it('THEN it exits with code 0', function () {
        expect(code).to.eq(0)
      })
      it('AND reports no problems', function () {
        expect(stdout.trim()).to.equal('')
      })
    })
  })

  describe('--ignore-path is used', function () {
    describe('GIVEN IgnoredDefault.sol (1 error) and IgnoredOther.sol (1 error)', function () {
      useFixture('12-solhintignore')
      let code
      let stdout
      let stderr
      describe('WHEN linting with --ignore-path pointing to a non-existent file AND that file has errors', function () {
        beforeEach(function () {
          ;({ code, stdout, stderr } = shell.exec(
            'solhint --ignore-path does-not-exist IgnoredDefault.sol',
            {
              silent: true,
            }
          ))
        })
        it('THEN an error is printed to stderr', function () {
          expect(stderr).to.include('ERROR: does-not-exist is not a valid path.')
        })
        // FIXME: we should exit early on v4
        it('AND no ignore file is used, so errors are reported on the file', function () {
          expect(stdout).to.include('1 problem')
          expect(stdout).to.include('IgnoredDefault')
        })
        // FIXME: we should use a different error code for bad
        // settings/parameters on v4
        it('AND the program exits with error code 1', function () {
          expect(code).to.eq(1)
        })
      })

      describe('WHEN linting with --ignore-path pointing to a non-existent file AND that file does NOT have errors', function () {
        beforeEach(function () {
          ;({ code, stdout, stderr } = shell.exec(
            'solhint --ignore-path does-not-exist NoErrors.sol',
            {
              silent: true,
            }
          ))
        })
        it('THEN an error is printed to stderr', function () {
          expect(stderr).to.include('ERROR: does-not-exist is not a valid path.')
        })
        it('AND no errors are reported on stdout', function () {
          expect(stdout.trim()).to.eq('')
        })
        // FIXME: I seriously do not agree with this. Change on v4
        it('AND the program exits with error code 0', function () {
          expect(code).to.eq(0)
        })
      })

      // TODO: research what does eslint does with this and wether it's making
      // it needlessly hard for editor integrations
      describe('WHEN linting with the default .solhintignore AND passing an ignored file as a parameter', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec('solhint IgnoredDefault.sol', {
            silent: true,
          }))
        })
        it('THEN the file is ignored', function () {
          expect(code).to.eq(0)
          expect(stdout.trim()).to.equal('')
        })
      })

      describe('WHEN linting with the default .solhintignore AND passing a glob for both files as a parameter', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec('solhint *.sol', {
            silent: true,
          }))
        })

        it('THEN IgnoreDefault is ignored', function () {
          expect(stdout).not.to.contain('IgnoreDefault')
        })

        it('AND errors are reported on IgnoredOther', function () {
          expect(code).to.eq(1)
          expect(stdout).to.include('1 error')
          expect(stdout).to.include('IgnoredOther')
        })
      })

      describe('WHEN linting with a different ignore file AND passing a non-ignored file as a parameter', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint --ignore-path other-solhintignore IgnoredDefault.sol',
            {
              silent: true,
            }
          ))
        })
        it('THEN errors are reported on it', function () {
          expect(code).to.eq(1)
          expect(stdout).to.include('1 error')
          expect(stdout).to.include('IgnoredDefault')
        })
      })

      describe('WHEN linting with a different ignore file AND passing an ignored file as a parameter', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint --ignore-path other-solhintignore IgnoredOther.sol',
            {
              silent: true,
            }
          ))
        })
        it('THEN the file is ignored', function () {
          expect(code).to.eq(0)
          expect(stdout.trim()).to.equal('')
        })
      })

      describe('WHEN linting with a different ignore file AND passing a glob for both files as a parameter', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec('solhint --ignore-path other-solhintignore *.sol', {
            silent: true,
          }))
        })

        it('THEN IgnoreOther is ignored', function () {
          expect(stdout).not.to.contain('IgnoreOther')
        })

        it('AND errors are reported on IgnoredDefault', function () {
          expect(code).to.eq(1)
          expect(stdout).to.include('1 error')
          expect(stdout).to.include('IgnoredDefault')
        })
      })
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
            'solhint contracts/NoErrors6Warnings.sol --max-warnings 7',
            { silent: true }
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
            'solhint contracts/NoErrors6Warnings.sol --max-warnings 3',
            { silent: true }
          ))
        })
        it('THEN displays warnings exceeded message', function () {
          expect(stdout.trim()).to.contain(warningExceededMsg)
        })
        it('AND it exits with error 1', function () {
          expect(code).to.equal(1)
        })
      })

      describe('WHEN linting with --max-warnings 3 AND --quiet ', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint contracts/NoErrors6Warnings.sol --max-warnings 3 --quiet',
            { silent: true }
          ))
        })
        it('THEN reports 0 problems since all warnings are dropped', function () {
          expect(stdout.trim()).to.eq('')
        })
        it('AND it exits with error 0', function () {
          expect(code).to.equal(0)
        })
      })
    })

    describe('GIVEN a contract with one error and 14 warnings', function () {
      describe('WHEN linting with --max-warnings 3 ', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint contracts/OneError14Warnings.sol --max-warnings 3',
            { silent: true }
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
          ;({ code, stdout } = shell.exec('solhint list-rules', { silent: true }))
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
          ;({ code, stdout } = shell.exec(
            'solhint list-rules -c config-file-with-weird-name.json',
            { silent: true }
          ))
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
            'solhint list-rules -c config-file-with-weird-name.json',
            { silent: true }
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

  describe('configGetter', function () {
    let stdout
    describe('WHEN using a shareable config from an installed package', function () {
      useFixture('10-configGetter-fetch-via-npm')
      beforeEach(function () {
        // this might surprise you, but npm install is slow
        this.timeout(95000)
        // install globally since solhint is installed globally for e2e tests
        // install tarball to keep tests offline-friendly
        shell.exec('npm install -g solhint-config-web3studio-3.0.0.tgz', { silent: true })
        ;({ stdout } = shell.exec('solhint list-rules', { silent: true }))
      })
      it('THEN list-rules lists the rules defined in the plugin', function () {
        // coupled to web3studio 3.0.0 shareabe config
        expect(stdout).to.include('compiler-fixed')
        expect(stdout).to.include('indent')
        // no other recommended rules
        expect(stdout).not.to.include('imports-on-top')
      })
    })

    describe('WHEN using a shareable config from a local directory', function () {
      useFixture('11-configGetter-fetch-local-file')
      beforeEach(function () {
        ;({ stdout } = shell.exec('solhint list-rules', { silent: true }))
      })
      it('THEN list-rules lists the rules defined in the plugin', function () {
        // coupled to web3studio 3.0.0 shareabe config
        expect(stdout).to.include('compiler-fixed')
        expect(stdout).to.include('indent')
        // no rules from 'solhint:recommended' or anywhere else
        expect(stdout).not.to.include('imports-on-top')
      })
    })
  })
})
