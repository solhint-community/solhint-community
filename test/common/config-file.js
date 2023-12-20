const assert = require('assert')
const { loadConfig } = require('../../lib/config/config-file')
const { ConfigMissingError, InvalidConfigError } = require('../../lib/common/errors')

describe('Config file', () => {
  it(`should throw a ConfigMissingError if the config file doesn't exist in default directory`, () => {
    assert.throws(() => loadConfig('.solhint.json'), ConfigMissingError)
  })

  it('should throw a ConfigMissing error if no config file is present in a custom directory', () => {
    assert.throws(
      () => loadConfig(undefined, './test/fixtures/config-file/01-no-config/'),
      ConfigMissingError
    )
  })

  it('GIVEN a .solhintrc with invalid syntax WHEN loading its directory THEN it throws an InvalidConfigError', () => {
    assert.throws(
      () => loadConfig(undefined, './test/fixtures/config-file/05-invalid-syntax/'),
      InvalidConfigError
    )
  })

  it('GIVEN a custom config path with invalid syntax WHEN loading it THEN it throws an InvalidConfigError', () => {
    assert.throws(
      () => loadConfig('./test/fixtures/config-file/05-invalid-syntax/custom.json'),
      InvalidConfigError
    )
  })
  ;[
    'package.json',
    'solhint.config.js',
    '.solhint.json',
    '.solhintrc',
    '.solhintrc.js',
    '.solhintrc.json',
  ].forEach((name) => {
    it(`should fetch the config from ${name}`, () => {
      const expected = {
        extends: ['solhint:recommended'],
        rules: {
          'no-console': 'off',
        },
      }
      const loadedConfig = loadConfig(
        undefined,
        `./test/fixtures/config-file/02-single-configs/${name}/`
      )
      assert.deepStrictEqual(loadedConfig, expected)
    })

    it(`should throw a ConfigMissing error if ${name} is empty`, () => {
      assert.throws(
        () => loadConfig(undefined, `./test/fixtures/config-file/04-empty-configs/${name}/`),
        ConfigMissingError
      )
    })
  })

  it('.solhintrc should take precedence over solhint.config.js', function () {
    const expected = {
      extends: ['solhint:all'],
      rules: {
        'no-unused-var': 'off',
      },
    }
    const loadedConfig = loadConfig(undefined, `./test/fixtures/config-file/03-precedence`)
    assert.deepStrictEqual(loadedConfig, expected)
  })

  it('the working directory should not be searched when a filename is passed explicitly', function () {
    const expected = {
      extends: ['solhint:recommended'],
      rules: {
        'no-console': 'off',
      },
    }
    const loadedConfig = loadConfig(
      './test/fixtures/config-file/03-precedence/solhint.config.js',
      `./test/fixtures/config-file/03-precedence`
    )
    assert.deepStrictEqual(loadedConfig, expected)
  })

  it('should load the config file if exists', () => {
    const loadedConfig = loadConfig('./test/helpers/solhint_config_test.json')
    const loadedConfigFileExpected = {
      extends: ['solhint:recommended'],
    }
    assert.deepStrictEqual(loadedConfig, loadedConfigFileExpected)
  })
})
