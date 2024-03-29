/* eslint-disable prefer-arrow-callback */

const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture, getFixtureFileContentSync } = require('./utils')

describe('e2e: stdin subcommand', function () {
  let code
  let stdout
  let stderr
  describe('WHEN passing init-config ', function () {
    useFixture('09-fixers')
    let originalConfig
    beforeEach(function () {
      originalConfig = getFixtureFileContentSync('.solhint.json')
      ;({ code, stdout, stderr } = shell.exec('solhint stdin init-config < throw-error.sol', {
        silent: true,
      }))
    })
    it('THEN it is silently ignored', function () {
      expect(code).to.eq(1)
      expect(stderr).not.to.include('Configuration file created')
      expect(stdout).not.to.include('Configuration file created')
      expect(stderr).not.to.include('Configuration file already exists')
      expect(stdout).not.to.include('Configuration file already exists')
      expect(getFixtureFileContentSync('.solhint.json')).to.eq(originalConfig)
    })
  })

  describe('WHEN passing --ignore-path ', function () {
    useFixture('09-fixers')
    beforeEach(function () {
      ;({ code, stdout, stderr } = shell.exec(
        'solhint stdin --ignore-path ignore-throw-error --filename throw-error.sol < throw-error.sol',
        {
          silent: true,
        }
      ))
    })
    it('THEN it is silently ignored', function () {
      expect(code).to.eq(1)
      expect(stdout).to.include('3:9  error')
    })
  })

  describe('--quiet is respected', function () {
    useFixture('09-fixers')
    describe('WHEN checking a file with one warning and one error AND using --quiet', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin -c error-warning.json -q < throw-error.sol',
          { silent: true }
        ))
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
  })

  describe('--quiet does NOT drop warnings when they exceed --max-warnings', function () {
    useFixture('09-fixers')
    describe('WHEN checking a file with one warning AND using --quiet AND using --max-warnings 0', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin -c warning-rules.json -q -w 0 < throw-error.sol',
          { silent: true }
        ))
      })
      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it('AND it prints the warning messages', function () {
        expect(stdout).to.include('3:9  warning')
        expect(stdout).not.to.include('3:9  error')
      })
      it('AND it prints the too many warnings message', function () {
        expect(stdout).to.include('found more warnings than the maximum')
      })
    })
  })

  describe('--filename value is used for report ', () => {
    useFixture('09-fixers')
    describe('WHEN running the linter on a file with an error on stdin', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint stdin < throw-error.sol', {
          silent: true,
        }))
      })
      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it("AND reports an error on file 'stdin' ", function () {
        expect(stdout).to.include('stdin')
        expect(stdout).to.include('3:9  error')
        expect(stdout).to.include('1 error')
      })
    })

    describe('WHEN running the linter on a stdin stream with an error AND passing --filename pointing to a file without errors', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin --filename throw-fixed.sol < throw-error.sol',
          {
            silent: true,
          }
        ))
      })

      it('THEN it exits with code 1, showing stdin and not the file on disk is read', function () {
        expect(code).to.eq(1)
      })
    })

    describe('WHEN running the linter on a file with an error on stdin AND passing --filename', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint stdin --filename foo.sol < throw-error.sol', {
          silent: true,
        }))
      })

      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it("AND reports an error on file 'foo.sol' ", function () {
        expect(stdout).to.include('foo.sol')
        expect(stdout).to.include('3:9  error')
        expect(stdout).to.include('1 error')
      })
    })
  })

  describe('--formatter is used', () => {
    useFixture('09-fixers')
    describe('WHEN running the linter on a file with an error on stdin AND choosing the unix formatter', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint stdin --formatter unix < throw-error.sol', {
          silent: true,
        }))
      })

      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it("AND reports an error on file 'stdin' with unix format ", function () {
        expect(stdout).to.include('stdin:3:9: "throw" is deprecated')
        expect(stdout).to.include('1 problem')
      })
    })
  })

  describe('--config is used', () => {
    describe('GIVEN a directory with a config', function () {
      useFixture('09-fixers')
      describe('WHEN linting a file AND passing a non-existent extra config via -c', function () {
        beforeEach(function () {
          ;({ code, stderr, stdout } = shell.exec(
            'solhint stdin -c nothere.json < throw-error.sol',
            {
              silent: true,
            }
          ))
        })
        it('THEN it returns error code 255 for bad options', function () {
          expect(code).to.equal(255)
        })
        it('AND no errors are reported on stdout', function () {
          expect(stdout.trim()).to.eq('')
        })
        it('AND it vomits a ConfigMissing exception', function () {
          expect(stderr).to.include('ConfigMissingError')
        })
      })

      describe('WHEN running the linter on a file with an error on stdin AND a config file that disables the rule for said error', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint stdin --config disabled-rules.json < throw-error.sol',
            { silent: true }
          ))
        })

        it('THEN it exits with code 0', function () {
          expect(code).to.eq(0)
        })
        it('AND reports no errors', function () {
          expect(stdout.trim()).to.eq('')
        })
      })
    })

    describe('GIVEN a directory without a config', function () {
      useFixture('01-no-config')
      describe('WHEN linting a file via stdin', function () {
        beforeEach(function () {
          ;({ code, stderr, stdout } = shell.exec('solhint stdin < Foo.sol', { silent: true }))
        })
        it('THEN it returns error code 1 for found errors', function () {
          expect(code).to.equal(1)
        })
        it('AND it reports errors on recommended rules', function () {
          expect(stdout).to.include('compiler-version')
          expect(stdout).to.include('no-empty-blocks')
          expect(stdout).to.include('2 problems')
        })
        it('AND it prints a warning to stderr to let the dev know no config was found', function () {
          expect(stderr).to.include(
            'No rule configuration provided for stdin! proceeding with solhint:recommended'
          )
        })
      })

      describe('WHEN linting a file AND passing a non-existent extra config via -c', function () {
        beforeEach(function () {
          ;({ code, stderr, stdout } = shell.exec('solhint stdin -c nothere.json < Foo.sol', {
            silent: true,
          }))
        })
        it('THEN it returns error code 255 for bad options', function () {
          expect(code).to.equal(255)
        })
        it('AND no errors are reported on stdout', function () {
          expect(stdout.trim()).to.eq('')
        })
        it('AND it vomits a ConfigMissing exception', function () {
          expect(stderr).to.include('ConfigMissingError')
        })
      })
    })
  })

  describe('--max-warnings is used', () => {
    useFixture('09-fixers')
    describe('WHEN running the linter on a file with a warning', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin --config warning-rules.json < throw-error.sol',
          { silent: true }
        ))
      })

      it('THEN it exits with code 0', function () {
        expect(code).to.eq(0)
      })
      it('AND reports one warning', function () {
        expect(stdout).to.include('1 warning')
      })
    })

    describe('WHEN running the linter on a file with a warning AND --max-warnings 0', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin --config warning-rules.json --max-warnings 0 < throw-error.sol',
          { silent: true }
        ))
      })

      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it('AND reports one warning', function () {
        expect(stdout).to.include('1 warning')
        expect(stdout).to.include('found more warnings than the maximum')
      })
    })
  })

  describe('--fix triggers filter mode', () => {
    useFixture('09-fixers')
    describe('WHEN running as a fixer on a stdin stream with only one fixable error', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint stdin --fix < throw-error.sol', { silent: true }))
      })
      it('THEN it exits with code 0', function () {
        expect(code).to.eq(0)
      })
      it('AND outputs the fixed file', function () {
        expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
      })
    })

    describe('WHEN running as a fixer on a stdin stream with one fixable and one non-fixable error', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin --fix -c two-errors.json < throw-error.sol',
          { silent: true }
        ))
      })
      it('THEN it exits with code 1', function () {
        expect(code).to.eq(1)
      })
      it('AND outputs the (partially) fixed file', function () {
        expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
      })
    })

    describe('WHEN running as a fixer on a stdin stream with only one fixable error AND the --filename parameter points to the file on disk', function () {
      let originalFile
      beforeEach(function () {
        originalFile = getFixtureFileContentSync('throw-error.sol')
        ;({ code, stdout } = shell.exec(
          'solhint stdin --fix --filename throw-error.sol < throw-error.sol',
          { silent: true }
        ))
      })
      it('THEN it exits with code 0', function () {
        expect(code).to.eq(0)
      })
      it('AND outputs the fixed file', function () {
        expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
      })
      it('AND the original file is left alone', function () {
        expect(getFixtureFileContentSync('throw-error.sol')).to.eq(originalFile)
      })
    })

    describe('exit code depends on --max-warnings but extra message isnt printed', function () {
      describe('WHEN fixing a file with --max-warnings 0 and one warning', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint stdin --fix -c error-warning.json --max-warnings 0 < throw-error.sol',
            { silent: true }
          ))
        })
        it('THEN it exits with code 1', function () {
          expect(code).to.eq(1)
        })
        it('AND outputs the fixed file', function () {
          expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
        })
        it('AND does NOT print too many warnings message', function () {
          expect(stdout.trim()).to.not.include('more warnings')
        })
      })
    })

    describe('--quiet and --max-warnings behaves in the same way as when linting, but fixes possible warnings', function () {
      describe('WHEN fixing a file with --max-warnings 0 AND one warning AND --quiet', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint stdin --fix --quiet -c error-warning.json --max-warnings 0 < throw-error.sol',
            { silent: true }
          ))
        })
        it('THEN it exits with code 1 since there are too many warnings', function () {
          expect(code).to.eq(1)
        })
        it('AND outputs the fixed file', function () {
          expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
        })
        it('AND does NOT print too many warnings message', function () {
          expect(stdout.trim()).to.not.include('more warnings')
        })
      })

      describe('WHEN fixing a file with one warning AND --quiet', function () {
        beforeEach(function () {
          ;({ code, stdout } = shell.exec(
            'solhint stdin --fix --quiet -c error-warning.json < throw-error.sol',
            { silent: true }
          ))
        })
        it('THEN it exits with code 0 since warnings are ignored', function () {
          expect(code).to.eq(0)
        })
        it('AND outputs the fixed file', function () {
          expect(stdout.trim()).to.eq(getFixtureFileContentSync('throw-fixed.sol').trim())
        })
      })
    })
  })
})
