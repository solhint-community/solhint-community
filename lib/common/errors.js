class ConfigMissingError extends Error {
  constructor(configName) {
    let message = `Failed to load a solhint's config file.`
    if (configName) message = `Failed to load config "${configName}" to extend from.`
    super(message)
  }
}

class InvalidConfigError extends Error {
  constructor(e) {
    super(`Solhint configuration is invalid:\n${e}`)
  }
}

module.exports = {
  ConfigMissingError,
  InvalidConfigError,
}
