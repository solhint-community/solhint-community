const _ = require('lodash')
const fs = require('fs')
const parser = require('@solidity-parser/parser')
const glob = require('glob')
const ignore = require('ignore')
const astParents = require('ast-parents')
const { applyExtends, loadFullConfigurationForPath } = require('./config/config-file')
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

// extraConfig is optional, an extra path to source for configs
// rootIgnore currently is the contents of .solhintignore, but in the future
// we'll probably have it behave the same as the configs, where an extra path
// is passed and .solhintignore files in every subdirectory are read.
function processPath(pathOrGlob, rootIgnore, extraConfigPath) {
  return glob
    .sync(pathOrGlob, { nodir: true })
    .map((filepath) => loadFullConfigurationForPath(filepath, extraConfigPath))
    .filter(({ filepath, config }) => {
      const ignoreFilter = ignore({ allowRelativePaths: true })
        .add(config.excludedFiles)
        .add(rootIgnore)
      return !ignoreFilter.ignores(filepath)
    })
    .map(({ filepath, config }) => processFile(filepath, config))
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
