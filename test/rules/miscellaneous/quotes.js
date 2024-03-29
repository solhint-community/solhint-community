const assert = require('assert')
const os = require('os')
const linter = require('../../../lib/index')
const { contractWith, funcWith } = require('../../common/contract-builder')
const { storeAsFile, removeTmpFiles } = require('../../common/utils')
const { assertNoErrors, assertErrorCount } = require('../../common/asserts')

describe('Linter - quotes', () => {
  after(() => {
    removeTmpFiles()
  })

  it('should raise quotes error', () => {
    const code = require('../../fixtures/miscellaneous/string-with-single-quotes')

    const report = linter.processStr(code, {
      rules: { quotes: 'error' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message.includes('double quotes'))
  })

  it('should raise quotes error in import', () => {
    const code = "import * from 'lib.sol';"

    const report = linter.processStr(code, {
      rules: { quotes: 'error' },
    })

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message.includes('double quotes'))
  })

  it('should raise quotes error in import for custom rules', () => {
    const code = 'import * from "lib.sol";'

    const report = linter.processStr(code, { rules: { quotes: ['error', 'single'] } })

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message.includes('single quotes'))
  })

  it('should raise quotes error in import for complex import', () => {
    const code = "import {a as b, c as d} from 'lib.sol';"

    const report = linter.processStr(code, { rules: { quotes: ['error', 'double'] } })

    assert.equal(report.errorCount, 1)
    assert.ok(report.messages[0].message.includes('double quotes'))
  })

  const ERROR_ASSEMBLY_CLAUSES = [
    "assembly { 'abc' }",
    "assembly { dataSize('uint') }",
    "assembly { linkerSymbol('uint') }",
  ]

  ERROR_ASSEMBLY_CLAUSES.forEach((curText) =>
    it(`should raise quotes error in assembly clause ${curText}`, () => {
      const code = funcWith(curText)

      const report = linter.processStr(code, { rules: { quotes: ['error', 'double'] } })

      assert.equal(report.errorCount, 1)
      assert.ok(report.messages[0].message.includes('double quotes'))
    })
  )

  it('should raise no error', () => {
    const filePath = storeAsFile(require('../../fixtures/miscellaneous/string-with-double-quotes'))

    const report = linter.processFile(filePath, {
      rules: { quotes: 'error' },
    })

    assertNoErrors(report)
    assert.equal(report.filePath, filePath)
  })

  it('should raise one error', function test() {
    if (os.type() === 'Windows_NT') {
      this.skip()
    }
    const filePath = storeAsFile(contractWith("string private a = 'test';"))
    const configPath = storeAsFile('{"rules": {"quotes": "error"}}', 'config.json')

    const reports = linter.processPath(filePath, [], configPath)
    assertErrorCount(reports[0], 1)
  })
})
