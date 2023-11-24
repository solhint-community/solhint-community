const { expect } = require('chai')
const shell = require('shelljs')
const { useFixture } = require('./utils')

describe('formatters', function () {
  useFixture('03-no-empty-blocks')
  it('unix', async function () {
    const { stdout } = shell.exec('solhint Foo.sol --formatter unix', { silent: true })
    const lines = stdout.split('\n')
    expect(lines[0]).to.eq('Foo.sol:3:1: Code contains empty blocks [Error/no-empty-blocks]')
    expect(lines[2].trim()).to.eq('1 problem')
  })

  describe('json', function () {
    let stdout
    beforeEach(function () {
      ;({ stdout } = shell.exec('solhint Foo.sol --formatter json', { silent: true }))
    })
    it('is proper json and not a JS object', async function () {
      expect(stdout).to.contain('"message"')
      expect(stdout).to.contain('"severity"')
    })
    it('has a conclusion object as last element', function () {
      const json = JSON.parse(stdout)
      expect(json.length).to.eq(2)
      expect(json[1]).to.deep.eq({ conclusion: '1 problem/s (1 error/s)' })
    })
    it('reports line, column, severity, ruleId and filepath', function () {
      const json = JSON.parse(stdout)
      expect(json[0]).to.deep.eq({
        line: 3,
        column: 1,
        severity: 'Error',
        message: 'Code contains empty blocks',
        ruleId: 'no-empty-blocks',
        fix: null,
        filePath: 'Foo.sol',
      })
    })
  })

  it('tap', async function () {
    const { stdout } = shell.exec('solhint Foo.sol --formatter tap', { silent: true })
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
    const { stdout } = shell.exec('solhint Foo.sol --formatter stylish', { silent: true })
    const lines = stdout.split('\n')

    expect(lines[1]).to.eq('Foo.sol')
    expect(lines[2]).to.eq('  3:1  error  Code contains empty blocks  no-empty-blocks')
    expect(lines[4]).to.eq('✖ 1 problem (1 error, 0 warnings)')
  })

  it('compact', async function () {
    const { stdout } = shell.exec('solhint Foo.sol --formatter compact', { silent: true })
    const lines = stdout.split('\n')
    expect(lines[0]).to.eq(
      'Foo.sol: line 3, col 1, Error - Code contains empty blocks (no-empty-blocks)'
    )
    expect(lines[2].trim()).to.eq('1 problem')
  })

  it('table', async function () {
    const { stdout } = shell.exec('solhint Foo.sol --formatter table', { silent: true })
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
