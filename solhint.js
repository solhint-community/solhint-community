#!/usr/bin/env node

const { Command } = require('commander')
const _ = require('lodash')
const fs = require('fs')
const process = require('process')

const linter = require('./lib/index')
const { loadConfig, applyExtends } = require('./lib/config/config-file')
const { validate } = require('./lib/config/config-validator')
const packageJson = require('./package.json')

const rootCommand = new Command()

function init() {
  const version = packageJson.version
  rootCommand.version(version)

  rootCommand
    .name('solhint')
    .usage('[options] <file> [...other_files]')
    .option(
      '-f, --formatter [name]',
      'chosen formatter for reports (stylish, table, tap, unix, json, compact)'
    )
    .option('-w, --max-warnings [maxWarningsNumber]', 'number of allowed warnings')
    .option('-c, --config [file_name]', 'file to use as your .solhint.json')
    .option(
      '-q, --quiet',
      'report errors only. Takes precedence over --max-warnings - default: false'
    )
    .option('--ignore-path [file_name]', 'file to use as your .solhintignore')
    .option(
      '--fix',
      'automatically fix problems. If used in conjunction with stdin, then fixed file will be printed to stdout and report will be omitted'
    )
    .option(
      '--init',
      'create configuration file for solhint. This option is deprecated, use init-config subcommand instead'
    )
    .description('Linter for Solidity programming language')
    .action(execMainAction)

  rootCommand
    .command('stdin')
    .description('linting of source code data provided to STDIN')
    .option('--filename <file_name>', 'name of file received using STDIN')
    .action(processStdin)

  rootCommand
    .command('init-config', null)
    .description('create configuration file for solhint')
    .action(writeSampleConfigFile)

  rootCommand
    .command('list-rules', null)
    .description('display enabled rules of current config, including extensions')
    .action(listRules)

  if (process.argv.length <= 2) {
    rootCommand.help()
  }

  rootCommand.parse(process.argv)
}

function execMainAction() {
  if (rootCommand.opts().init) {
    writeSampleConfigFile()
  }

  let formatterFn

  try {
    // to check if is a valid formatter before execute linter
    formatterFn = getFormatter(rootCommand.opts().formatter)
  } catch (ex) {
    console.error(ex.message)
    process.exit(1)
  }

  const reportLists = rootCommand.args.filter(_.isString).map(processPath)
  const reports = _.flatten(reportLists)

  if (rootCommand.opts().fix) {
    for (const report of reports) {
      const inputSrc = fs.readFileSync(report.filePath).toString()

      const { fixed, output } = linter.fixStr(inputSrc, report)
      if (fixed) {
        report.reports = report.reports.filter((x) => !x.fix)
        fs.writeFileSync(report.filePath, output)
      }
    }
  }
  process.exit(consumeReport(reports, formatterFn))
}

function processStdin(subcommandOptions) {
  const allOptions = { ...rootCommand.opts(), ...subcommandOptions }
  const STDIN_FILE = 0
  const inputSrc = fs.readFileSync(STDIN_FILE).toString()

  const report = processStr(inputSrc)
  report.file = allOptions.filename || 'stdin'
  if (allOptions.fix) {
    const { output } = linter.fixStr(inputSrc, report)
    if (allOptions.quiet) {
      report.reports = report.reports.filter((i) => i.severity === 2)
    }
    report.reports = report.reports.filter((x) => !x.fix)
    // unconditionally log the output, to prevent usage as a filter from
    // writing an empty file
    console.log(output)
    if (
      report.errorCount > 0 ||
      (allOptions.maxWarnings >= 0 && report.warningCount > allOptions.maxWarnings)
    )
      process.exit(1)

    process.exit(0)
  }

  const formatterFn = getFormatter(allOptions.formatter)
  process.exit(consumeReport([report], formatterFn))
}

function writeSampleConfigFile() {
  const configPath = '.solhint.json'
  const sampleConfig = `{
  "extends": "solhint:recommended"
}
`

  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, sampleConfig)

    console.log('Configuration file created!')
  } else {
    console.log('Configuration file already exists')
  }

  process.exit(0)
}

const readIgnore = _.memoize(() => {
  let ignoreFile = '.solhintignore'
  try {
    if (rootCommand.opts().ignorePath) {
      ignoreFile = rootCommand.opts().ignorePath
    }

    return fs
      .readFileSync(ignoreFile)
      .toString()
      .split('\n')
      .map((i) => i.trim())
  } catch (e) {
    if (rootCommand.opts().ignorePath && e.code === 'ENOENT') {
      console.error(`\nERROR: ${ignoreFile} is not a valid path.`)
    }
    return []
  }
})

const readConfig = _.memoize(() => {
  let config = {}

  try {
    config = loadConfig(rootCommand.opts().config)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }

  const configExcludeFiles = _.flatten(config.excludedFiles)
  config.excludedFiles = _.concat(configExcludeFiles, readIgnore())

  // validate the configuration before continuing
  validate(config)

  return config
})

function processStr(input) {
  return linter.processStr(input, readConfig())
}

function processPath(path) {
  return linter.processPath(path, readConfig())
}

function getFormatter(formatter) {
  const formatterName = formatter || 'stylish'
  try {
    return require(`./lib/formatters/${formatterName}`)
  } catch (ex) {
    ex.message = `\nThere was a problem loading formatter option: ${
      rootCommand.opts().formatter
    } \nError: ${ex.message}`
    throw ex
  }
}

// @returns the program's exit value
function consumeReport(reports, formatterFn) {
  if (rootCommand.opts().quiet) {
    // filter the list of reports, to set errors only.
    reports.forEach((reporter) => {
      reporter.reports = reporter.reports.filter((i) => i.severity === 2)
    })
  }
  const errorsCount = reports.reduce((acc, i) => acc + i.errorCount, 0)
  const warningCount = reports.reduce((acc, i) => acc + i.warningCount, 0)
  const tooManyWarnings =
    rootCommand.opts().maxWarnings >= 0 && warningCount > rootCommand.opts().maxWarnings
  console.log(formatterFn(reports))
  if (tooManyWarnings && errorsCount === 0) {
    console.log(
      'Solhint found more warnings than the maximum specified (maximum: %s, found %s). This is an error.',
      rootCommand.opts().maxWarnings,
      warningCount
    )
  }

  if (errorsCount > 0 || tooManyWarnings) {
    return 1
  }
  return 0
}

function listRules() {
  const config = applyExtends(readConfig())
  const rulesObject = config.rules

  console.log('\nRules: \n')
  const orderedRules = Object.keys(rulesObject)
    .filter((key) => rulesObject[key] !== 'off' && rulesObject[key][0] !== 'off')
    .sort()
    .reduce((obj, key) => {
      obj[key] = rulesObject[key]
      return obj
    }, {})

  Object.keys(orderedRules).forEach(function (key) {
    console.log('- ', key, ': ', orderedRules[key])
  })
}

init()
