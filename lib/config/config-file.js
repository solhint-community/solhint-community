const fs = require('fs')
const { isAbsolute } = require('path')
const _ = require('lodash')
const { cosmiconfigSync } = require('cosmiconfig')
const { ConfigMissingError, InvalidConfigError } = require('../common/errors')

const getSolhintCoreConfig = (name) => {
  if (name === 'solhint:recommended') {
    return require('../../conf/rulesets/solhint-recommended')
  }

  if (name === 'solhint:all') {
    return require('../../conf/rulesets/solhint-all')
  }

  if (name === 'solhint:default') {
    return require('../../conf/rulesets/solhint-default')
  }

  throw new ConfigMissingError(name)
}

const createEmptyConfig = () => ({
  excludedFiles: {},
  extends: {},
  rules: {},
})

const loadConfig = (configFile) => {
  if (configFile && !fs.existsSync(configFile)) {
    throw new Error(`The config file passed as a parameter does not exist`)
  }

  // Use cosmiconfig to get the config from different sources
  const appDirectory = fs.realpathSync(process.cwd())
  const moduleName = 'solhint'
  const cosmiconfigOptions = {
    searchPlaces: [
      'package.json',
      `.${moduleName}.json`,
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.js`,
      `${moduleName}.config.js`,
    ],
  }

  const explorer = cosmiconfigSync(moduleName, cosmiconfigOptions)

  let searchedFor
  try {
    // if a specific path was specified, just load it and ignore default paths
    if (configFile) {
      return explorer.load(configFile).config
    }
    searchedFor = explorer.search(appDirectory)
    if (searchedFor) {
      return searchedFor.config || createEmptyConfig()
    }
  } catch (e) {
    throw new InvalidConfigError(e)
  }
  throw new ConfigMissingError()
}

const configGetter = (path) => {
  if (path.startsWith('solhint:')) {
    return getSolhintCoreConfig(path)
  }
  try {
    if (isAbsolute(path)) {
      return require(path)
    }
    return require(`solhint-config-${path}`)
  } catch (e) {
    throw new InvalidConfigError(path)
  }
}

const applyExtends = (config, getter = configGetter) => {
  if (!config.extends) {
    return config
  }

  if (!Array.isArray(config.extends)) {
    config.extends = [config.extends]
  }

  return config.extends.reduceRight((previousValue, parentPath) => {
    const extensionConfig = getter(parentPath)
    return _.merge({}, extensionConfig, previousValue)
  }, config)
}

module.exports = {
  applyExtends,
  configGetter,
  loadConfig,
}
