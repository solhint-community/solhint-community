/* eslint-disable no-unused-expressions */
const os = require('os')
const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture } = require('./utils')

describe('configs in subdirectories', function () {
  describe('enabling/disabling a single rule', function () {
    useFixture('14-configs-in-subdirectories')
    let code
    let stdout
    describe('GIVEN a config with no-empty-blocks, WHEN linting an empty contract', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint EnabledDefault.sol', { silent: true }))
      })
      it('THEN an error is reported', function () {
        expect(code).to.eq(1)
        expect(stdout).to.include('no-empty-blocks')
        expect(stdout).to.include('1 error')
      })
    })

    describe('GIVEN a subdirectory with a .solhintrc disabling the rule, WHEN linting a file there', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint disable-rule/Disabled.sol', { silent: true }))
      })
      it('THEN no error is reported', function () {
        expect(code).to.eq(0)
        expect(stdout.trim()).to.eq('')
      })
    })

    describe('GIVEN a --filename flag pointing to a file in asubdirectory with a .solhintrc disabling the rule, WHEN linting stdin', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec(
          'solhint stdin --filename disable-rule/Disabled.sol < disable-rule/Disabled.sol',
          { silent: true }
        ))
      })
      it('THEN no error is reported', function () {
        expect(code).to.eq(0)
        expect(stdout.trim()).to.eq('')
      })
    })

    describe('GIVEN no --filename flag, WHEN linting the same stdin', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint stdin < disable-rule/Disabled.sol', {
          silent: true,
        }))
      })
      it('THEN an error is reported', function () {
        expect(code).to.eq(1)
        expect(stdout).to.include('no-empty-blocks')
        expect(stdout).to.include('1 error')
      })
    })

    describe('GIVEN a sub-sub-directory with a .solhintrc enabling the rule again, WHEN linting a file there', function () {
      beforeEach(function () {
        ;({ code, stdout } = shell.exec('solhint disable-rule/enable-again/EnabledAgain.sol', {
          silent: true,
        }))
      })
      it('THEN an error is reported', function () {
        expect(code).to.eq(1)
        expect(stdout).to.include('no-empty-blocks')
        expect(stdout).to.include('1 error')
      })
    })

    describe('GIVEN a subdirectory disabling the rule AND sub-sub-directory with a .solhintrc enabling the rule again, WHEN linting everyting', function () {
      beforeEach(function () {
        if (os.type() === 'Windows_NT') {
          ;({ code, stdout } = shell.exec(
            `solhint EnabledDefault.sol disable-rule\\\\Disabled.sol disable-rule\\\\enable-again\\\\EnabledAgain.sol`,
            {
              silent: true,
            }
          ))
        } else {
          ;({ code, stdout } = shell.exec(`solhint '**/*.sol'`, {
            silent: true,
          }))
        }
      })
      it('THEN an error is reported on the root file', function () {
        expect(stdout).to.include('EnabledDefault.sol')
      })
      it('AND no error is reported in the subdirectory', function () {
        expect(stdout).not.to.include('disable-rule/Disabled.sol')
      })
      it('AND an error is reported in the sub-sub-directory', function () {
        expect(stdout).to.include('EnabledAgain.sol')
      })
      it('AND the correct amount of errors is reported', function () {
        expect(code).to.eq(1)
        expect(stdout).to.include('2 errors')
      })
    })
  })
})
