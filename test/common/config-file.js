const assert = require('assert')
const path = require('path')
const {
  loadConfig,
  listConfigsForPath,
  loadFullConfigurationForPath,
} = require('../../lib/config/config-file')
const { ConfigMissingError, InvalidConfigError } = require('../../lib/common/errors')

describe('Config file', () => {
  describe('listConfigsForPath', function () {
    it('unqualified files', function () {
      assert.deepStrictEqual(listConfigsForPath('foo.sol'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('dir/foo.sol'), ['.', 'dir'])
      assert.deepStrictEqual(listConfigsForPath('dir/sub/foo.sol'), [
        '.',
        'dir',
        path.join('dir', 'sub'),
      ])
    })
    it('empty string', function () {
      assert.deepStrictEqual(listConfigsForPath(''), ['.'])
    })
    it('relative path', function () {
      assert.deepStrictEqual(listConfigsForPath('.'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('./foo.sol'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('./dir/foo.sol'), ['.', 'dir'])
      assert.deepStrictEqual(listConfigsForPath('./dir/sub/foo.sol'), [
        '.',
        'dir',
        path.join('dir', 'sub'),
      ])
    })
    it('absolute path', function () {
      assert.deepStrictEqual(listConfigsForPath('/', '/home/user/project'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('/foo.sol', '/home/user/project'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('/home/foo.sol', '/home/user/project'), ['.'])
      assert.deepStrictEqual(
        listConfigsForPath('/home/user/project/foo.sol', '/home/user/project'),
        ['.']
      )
      assert.deepStrictEqual(
        listConfigsForPath('/home/user/project/test/foo.sol', '/home/user/project'),
        ['.', 'test']
      )
      assert.deepStrictEqual(
        listConfigsForPath('/home/user/project/test/sub/foo.sol', '/home/user/project'),
        ['.', 'test', path.join('test', 'sub')]
      )
    })
  })
  describe('loadFullConfigurationForPath', function () {
    it('extraConfig overrides all other config files', function () {
      const { config } = loadFullConfigurationForPath(
        './test/fixtures/config-file/06-subdirectory/sub/Foo.sol',
        './test/fixtures/config-file/06-subdirectory/extra.json',
        './test/fixtures/config-file/06-subdirectory'
      )
      assert.deepStrictEqual(config, {
        excludedFiles: [],
        extends: [],
        plugins: [],
        rules: {
          'no-console': 'off',
        },
      })
    })
    it('when config is found at default location, isFallback returns false', function () {
      const { isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/06-subdirectory/sub/Foo.sol',
        undefined,
        './test/fixtures/config-file/06-subdirectory'
      )
      assert(!isFallback)
    })
    it('when config is found at default location AND at extra config path, isFallback returns false', function () {
      const { isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/06-subdirectory/sub/Foo.sol',
        './test/fixtures/config-file/06-subdirectory/extra.json',
        './test/fixtures/config-file/06-subdirectory'
      )
      assert(!isFallback)
    })

    it('when config is found only at extra config path, isFallback returns false', function () {
      const { isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/01-no-config/Foo.sol',
        './test/fixtures/config-file/06-subdirectory/extra.json',
        './test/fixtures/config-file/01-no-config'
      )
      assert(!isFallback)
    })
    it('rule setting in subdirectory overrides root config', function () {
      const { config } = loadFullConfigurationForPath(
        './test/fixtures/config-file/06-subdirectory/sub/Foo.sol',
        undefined,
        './test/fixtures/config-file/06-subdirectory'
      )
      assert.deepStrictEqual(config, {
        excludedFiles: [],
        extends: [],
        plugins: [],
        rules: {
          'no-console': 'warn',
        },
      })
    })
    it('missing extraConfig causes an error', function () {
      assert.throws(
        () =>
          loadFullConfigurationForPath(
            './test/fixtures/config-file/06-subdirectory/sub/Foo.sol',
            './test/fixtures/config-file/06-subdirectory/nothere.json',
            './test/fixtures/config-file/06-subdirectory'
          ),
        ConfigMissingError
      )
    })
    it('empty config and no extraConfig returns solhint:recommended and isFallback: true', function () {
      const { config, isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/07-no-rules-or-extends/Foo.sol',
        undefined,
        './test/fixtures/config-file/07-no-rules-or-extends'
      )
      assert(isFallback)
      assert.deepStrictEqual(config, {
        excludedFiles: [],
        extends: ['solhint:recommended'],
        plugins: [],
        rules: {},
      })
    })
    it('no config returns solhint:recommended and isFallback: true', function () {
      const { config, isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/01-no-config/Foo.sol',
        undefined,
        './test/fixtures/config-file/01-no-config'
      )
      assert(isFallback)
      assert.deepStrictEqual(config, {
        excludedFiles: [],
        extends: ['solhint:recommended'],
        plugins: [],
        rules: {},
      })
    })
    it('config with only excludedFiles returns solhint:recommended and isFallback: true, but also preserves the excludedFiles field', function () {
      const { config, isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/08-only-excludefiles/Foo.sol',
        undefined,
        './test/fixtures/config-file/08-only-excludefiles/'
      )
      assert(isFallback)
      assert.deepStrictEqual(config, {
        excludedFiles: ['Foo.sol'],
        extends: ['solhint:recommended'],
        plugins: [],
        rules: {},
      })
    })
    it('extends: in subdirectory overrides explicit rule setting in root config', function () {
      const { config } = loadFullConfigurationForPath(
        './test/fixtures/config-file/09-extends/sub/Foo.sol',
        undefined,
        './test/fixtures/config-file/09-extends'
      )
      // it's disabled in the root config but sub/.solhintrc extends
      // recommended, where it's set as 'warn'
    })
    it('invalid config in subdirectory causes error', function () {
      assert.throws(
        () =>
          loadFullConfigurationForPath(
            './test/fixtures/config-file/06-subdirectory/invalid/Foo.sol',
            undefined,
            './test/fixtures/config-file/06-subdirectory/'
          ),
        InvalidConfigError
      )
    })
    it('no config && empty extraConfig returns solhint:recommended and isFallback: true', function () {
      const { config, isFallback } = loadFullConfigurationForPath(
        './test/fixtures/config-file/01-no-config/Foo.sol',
        './test/fixtures/config-file/07-no-rules-or-extends/.solhintrc',
        './test/fixtures/config-file/01-no-config'
      )
      assert(isFallback)
      assert.deepStrictEqual(config, {
        excludedFiles: [],
        extends: ['solhint:recommended'],
        plugins: [],
        rules: {},
      })
    })
  })

  describe('loadConfig', function () {
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
          excludedFiles: [],
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
        excludedFiles: [],
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
        excludedFiles: [],
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
        rules: {},
        excludedFiles: [],
      }
      assert.deepStrictEqual(loadedConfig, loadedConfigFileExpected)
    })
  })
})
