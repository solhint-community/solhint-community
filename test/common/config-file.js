const assert = require('assert')
const { loadConfig, listConfigsForPath } = require('../../lib/config/config-file')
const { ConfigMissingError, InvalidConfigError } = require('../../lib/common/errors')

describe('Config file', () => {
  describe('listConfigsForPath', function () {
    it('unqualified files', function () {
      assert.deepStrictEqual(listConfigsForPath('foo.sol'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('dir/foo.sol'), ['.', 'dir'])
      assert.deepStrictEqual(listConfigsForPath('dir/sub/foo.sol'), ['.', 'dir', 'dir/sub'])
    })
    it('empty string', function () {
      assert.deepStrictEqual(listConfigsForPath(''), ['.'])
    })
    it('relative path', function () {
      assert.deepStrictEqual(listConfigsForPath('.'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('./foo.sol'), ['.'])
      assert.deepStrictEqual(listConfigsForPath('./dir/foo.sol'), ['.', 'dir'])
      assert.deepStrictEqual(listConfigsForPath('./dir/sub/foo.sol'), ['.', 'dir', 'dir/sub'])
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
        ['.', 'test', 'test/sub']
      )
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
