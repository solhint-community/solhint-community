const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const { cosmiconfigSync } = require('cosmiconfig')
const { validate } = require('./config-validator')
const { ConfigMissingError, InvalidConfigError } = require('../common/errors')

const getSolhintCoreConfig = (name) => {
  if (name === 'solhint:recommended') {
    return require('../../conf/rulesets/solhint-recommended')
  }

  if (name === 'solhint:all') {
    return require('../../conf/rulesets/solhint-all')
  }

  throw new ConfigMissingError(name)
}

const forceArray = (it) => {
  if (Array.isArray(it)) {
    return it
  } else if (it !== undefined) {
    return [it]
  }
  return []
}
const emptyConfig = () => ({ rules: {}, extends: [], excludedFiles: [] })
const mergeConfigs = (left, right) => ({
  rules: { ...left.rules, ...right.rules },
  extends: _.uniq([...forceArray(left.extends), ...forceArray(right.extends)]),
  plugins: _.uniq([...forceArray(left.plugins), ...forceArray(right.plugins)]),
  excludedFiles: _.uniq([...left.excludedFiles, ...right.excludedFiles]),
})
const normalizeConfig = (config) => {
  validate(config)
  return { rules: {}, excludedFiles: [], extends: [], ...config }
}

// @param filename the relative path from the current working directory to the
// file we're about to lint
// TODO: from the cwd or from the project's root? 🤔
// @returns all of the directories where we should look for a config file
const listConfigsForPath = (filename, cwd = process.cwd()) => {
  // if we're parsing a file outside of the project, only consider the config
  // file in the current directory
  const relative = path.relative(cwd, filename)
  if (relative.includes('..')) {
    return ['.']
  }
  const paths = path
    .dirname(relative)
    .split(path.sep)
    .map((current, index, array) => {
      let result = '.'
      for (let i = 0; i < index; i++) {
        result = path.join(result, array[i])
      }
      return path.join(result, current)
    })
  return paths[0] === '.' ? paths : ['.', ...paths]
}

const loadConfig = (configFile, workingDirectory = process.cwd()) => {
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
  if (configFile) {
    try {
      const config = explorer.load(configFile).config
      return normalizeConfig(config)
    } catch (e) {
      if (e.code === 'ENOENT') {
        throw new ConfigMissingError()
      }
      throw new InvalidConfigError(e)
    }
  }

  // Use cosmiconfig to get the config from different sources
  const appDirectory = fs.realpathSync(workingDirectory)
  try {
    const searchedFor = explorer.search(appDirectory)
    if (searchedFor?.config) {
      return normalizeConfig(searchedFor.config)
    }
  } catch (e) {
    throw new InvalidConfigError(e)
  }
  throw new ConfigMissingError()
}

const configGetter = (name) => {
  if (name.startsWith('solhint:')) {
    return getSolhintCoreConfig(name)
  }
  try {
    if (path.isAbsolute(name)) {
      return require(name)
    }
    return require(`solhint-config-${name}`)
  } catch (e) {
    throw new InvalidConfigError(name)
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

const loadFullConfigurationForPath = (filepath, extraConfig, root = process.cwd()) => {
  let config = listConfigsForPath(filepath, root)
    .map((configDirectory) => {
      try {
        return loadConfig(undefined, path.resolve(root, configDirectory))
      } catch (e) {
        if (e instanceof ConfigMissingError) return emptyConfig()
        else throw e
      }
    })
    .map((it) => applyExtends(it))
    .reduce(mergeConfigs, emptyConfig())
  if (extraConfig) {
    // don't catch any errors, if the user provided a file and it isn't
    // there, we should crash and burn
    config = mergeConfigs(config, loadConfig(extraConfig))
  }
  // this should change with #90
  if (['rules', 'extends'].every((key) => Object.keys(config[key]).length === 0)) {
    throw new ConfigMissingError()
  }
  return { filepath, config }
}

module.exports = {
  applyExtends,
  configGetter,
  listConfigsForPath,
  loadFullConfigurationForPath,
  loadConfig,
  emptyConfig,
  mergeConfigs,
}
