/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')
const shell = require('shelljs')
const glob = require('glob')
const { useFixture } = require('./utils')

describe('main executable tests', function () {
  describe('no config', function () {
    useFixture('01-no-config')
    describe('GIVEN a config file created with solhint init-config', function () {
      beforeEach(function () {
        shell.exec('solhint init-config', { silent: true })
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

    it('should create an initial config with init-config', function () {
      const { code } = shell.exec('solhint init-config', { silent: true })

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
    ;['globals', 'env', 'parserOptions'].forEach((field) => {
      describe(`GIVEN a config file using the deprecated field ${field}, WHEN linting`, function () {
        beforeEach(function () {
          ;({ code, stderr, stdout } = shell.exec(`solhint -c deprecated-${field}.json Foo.sol`, {
            silent: true,
          }))
        })

        it('THEN linter exits with error 1', function () {
          expect(code).to.equal(1)
        })
        it('AND stdout is empty', function () {
          expect(stdout.trim()).to.eq('')
        })
        it('AND stderr logs support for the field was removed', function () {
          expect(stderr.trim()).to.include('Solhint configuration is invalid')
          expect(stderr.trim()).to.include(
            `${field}" in solhint config is no longer supported since version 4.0.0`
          )
        })
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

    describe('WHEN the config file extends solhint:default core config (which is no longer supported)', function () {
      beforeEach(function () {
        ;({ code, stderr, stdout } = shell.exec('solhint -c extends-solhint-default.json Foo.sol', {
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
        expect(stderr.trim()).to.include('Failed to load config "solhint:default" to extend from')
      })
    })
  })

  describe('empty-config', function () {
    useFixture('02-empty-solhint-json')

    it('should print an error', function () {
      const { code, stdout, stderr } = shell.exec('solhint Foo.sol', { silent: true })

      expect(code).to.equal(1)

      expect(stdout.trim()).to.equal('')
      expect(stderr).to.include('ConfigMissingError')
    })

    it('should exit with bad options code and print an error when calling init-config', function () {
      const { code, stdout } = shell.exec('solhint init-config', { silent: true })
      expect(stdout.trim()).to.contain('Configuration file already exists')
      expect(code).to.eq(255)
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

  describe('no files to lint', function () {
    let code
    let stderr
    let stdout
    useFixture('03-no-empty-blocks')
    describe('WHEN calling solhint with no arguments', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint', { silent: true }))
      })
      it('THEN prints a help message AND reports no error', function () {
        expect(code).to.eq(0)
        expect(stdout).to.include('Linter for Solidity programming language')
      })
    })

    describe('WHEN calling solhint with an argument matching zero files', function () {
      beforeEach(function () {
        ;({ code, stderr } = shell.exec('solhint wrongfile.sol', { silent: true }))
      })
      it('THEN it exits with bad options code AND reports an error on stderr', function () {
        expect(code).to.eq(255)
        expect(stderr).to.include('No files to lint')
        expect(stderr).to.include('check glob arguments "wrongfile.sol"')
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
          expect(stderr).to.contain("Failed to load a solhint's config file")
        })
        it('AND it does NOT list disabled rules', function () {
          expect(stdout).to.eq('')
        })
      })
    })
  })

  describe('plugins', function () {
    describe('GIVEN a node project set up with solhint-plugin-prettier', function () {
      const projectRoot = process.cwd()
      useFixture('15-plugins')
      beforeEach(function () {
        // this might surprise you, but npm install is slow
        this.timeout(95000)
        // using `npm i solhint-community*.tgz` would be easier but that doesn't
        // work under windows
        const tgz = glob.sync('solhint-community*.tgz', { cwd: projectRoot })
        shell.exec(`cp ${projectRoot}/${tgz} . `, { silent: true })
        shell.exec(`npm i ${tgz}`, { silent: true })
      })
      describe('WHEN linting a file for which prettier/prettier reports an error', function () {
        let stdout
        let stderr
        beforeEach(function () {
          ;({ stdout, stderr } = shell.exec('npx solhint PrettierErrors.sol', { silent: true }))
        })
        it('AND the rule exists', function () {
          expect(stderr).not.to.include("Warning: Rule 'prettier/prettier' doesn't exist")
          expect(stdout).not.to.include("Warning: Rule 'prettier/prettier' doesn't exist")
        })
        it('AND an error is reported on it', function () {
          expect(stdout).to.include('error  Insert ·  prettier/prettier')
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
