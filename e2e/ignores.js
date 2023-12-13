const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture } = require('./utils')

describe('excludedFiles in config file is used', function () {
  useFixture('12-solhintignore')
  let code
  let stdout
  describe('GIVEN a .solhintignore ignoring a file AND a custom config ignoring another', function () {
    describe('WHEN linting with a glob that matches both', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(`solhint -c ignoreInConfig.json '*.sol'`, {
          silent: true,
        }))
      })
      it('THEN no errors are reported on stdout', function () {
        expect(stdout.trim()).to.eq('')
      })
      it('AND the program exits with error code 0', function () {
        expect(code).to.eq(0)
      })
    })
  })
})

describe('.solhintignore in subdirectory is not read', function () {
  useFixture('12-solhintignore')
  let code
  let stdout
  describe('GIVEN a subdirectory with a .solhintignore file', function () {
    describe('WHEN linting with a glob that matches a file ignored by it', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(`solhint sub/*.sol`, {
          silent: true,
        }))
      })
      it('THEN the file is NOT ignored', function () {
        expect(code).to.eq(1)
        expect(stdout).to.include('1 error')
        expect(stdout).to.include('IgnoredSubdirectory')
      })
    })
  })
})

describe('excludeFiles in config is relative to cwd and not config file location', function () {
  useFixture('12-solhintignore')
  let code
  let stdout
  describe('GIVEN a subdirectory with its own config file ignoring said subdirectory', function () {
    describe('WHEN linting there with a root-level cwd', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(`solhint -c sub/subconfig.json 'sub/*.sol'`, {
          silent: true,
        }))
      })
      it('THEN the file is ignored', function () {
        expect(code).to.eq(0)
        expect(stdout.trim()).to.eq('')
      })
    })
  })
})

describe('--ignore-path is used', function () {
  describe('GIVEN IgnoredDefault.sol (1 error) and IgnoredOther.sol (1 error)', function () {
    useFixture('12-solhintignore')
    let code
    let stdout
    let stderr
    describe('WHEN linting with --ignore-path pointing to a non-existent file', function () {
      describe('AND that file has errors', function () {
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

      describe('AND that file does NOT have errors', function () {
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
    })

    describe('WHEN linting with the default .solhintignore', function () {
      // TODO: research what does eslint does with this and wether it's making
      // it needlessly hard for editor integrations
      describe('AND passing an ignored file as a parameter', function () {
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

      describe('AND passing a glob for both files as a parameter', function () {
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
    })

    describe('WHEN linting with a different ignore file', function () {
      describe('AND passing a non-ignored file as a parameter', function () {
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

      describe('AND passing an ignored file as a parameter', function () {
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

      describe('AND passing a glob for both files as a parameter', function () {
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
})
