const _ = require('lodash')
const fs = require('fs')
const parser = require('@solidity-parser/parser')
const glob = require('glob')
const ignore = require('ignore')
const astParents = require('ast-parents')
const { applyExtends } = require('./config/config-file')
const applyFixes = require('./apply-fixes')
const ruleFixer = require('./rule-fixer')
const Reporter = require('./reporter')
const TreeListener = require('./tree-listener')
const checkers = require('./rules/index')

function parseInput(inputStr) {
  try {
    // first we try to parse the string as we normally do
    return parser.parse(inputStr, { loc: true, range: true })
  } catch (e) {
    // using 'loc' may throw when inputStr is empty or only has comments
    return parser.parse(inputStr, {})
  }
}

function processStr(inputStr, config = {}, fileName = '') {
  config = applyExtends(config)

  let ast
  try {
    ast = parseInput(inputStr)
  } catch (e) {
    if (e instanceof parser.ParserError) {
      const reporter = new Reporter([], config)
      for (const error of e.errors) {
        reporter.addReport(
          error.line,
          error.column,
          Reporter.SEVERITY.ERROR,
          `Parse error: ${error.message}`
        )
      }
      return reporter
    } else {
      throw e
    }
  }

  const tokens = parser.tokenize(inputStr, { loc: true })
  const reporter = new Reporter(tokens, config)
  const listener = new TreeListener(checkers(reporter, config, inputStr, tokens, fileName))

  astParents(ast)
  parser.visit(ast, listener)

  return reporter
}

function processFile(file, config) {
  const report = processStr(fs.readFileSync(file).toString(), config, file)
  report.file = file

  return report
}

function processPath(path, config) {
  const ignoreFilter = ignore({ allowRelativePaths: true }).add(config.excludedFiles)

  const allFiles = glob.sync(path, { nodir: true })
  const files = ignoreFilter.filter(allFiles)

  return files.map((curFile) => processFile(curFile, config))
}

function fixStr(str, report) {
  const fixes = _(report.reports)
    .filter((x) => x.fix)
    .map((x) => x.fix(ruleFixer))
    .sort((a, b) => a.range[0] - b.range[0])
    .value()
  return applyFixes(fixes, str)
}

module.exports = { processPath, processFile, processStr, fixStr }
