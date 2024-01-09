const assert = require('assert')

const {
  isMixedCase,
  isCapWords,
  isUpperSnakeCase,
  hasLeadingUnderscore,
} = require('../../lib/common/identifier-naming')

describe('identifier-naming', () => {
  describe('isMixedCase', function () {
    ;[
      'f',
      '_f',
      'foo',
      'fooBar',
      'collisionFoo_',
      '_privateFoo',
      '__privateBar',
      '$',
      '$foo',
      '$Foo',
      '_$Foo',
      'my$tuff',
      'foo$',
    ].forEach((name) => {
      it(`${name} is mixedCase`, function () {
        assert(isMixedCase(name))
      })
    })
    ;['F', 'Foo', 'foo_bar', 'FooBar', '_private_foo', '__private_bar', '_', '_F'].forEach(
      (name) => {
        it(`${name} is NOT mixedCase`, function () {
          assert(!isMixedCase(name))
        })
      }
    )
  })

  describe('isCapWords', function () {
    ;['F', 'Foo', 'FooBar', '$', '$foo', '$Foo', 'My$tuff'].forEach((name) => {
      it(`${name} is CapWords`, function () {
        assert(isCapWords(name))
      })
    })
    ;[
      '_PrivateFoo', // most things defined as CapWords cannot really be private
      '__PrivateBar', // since they are definitions, so leading underscores are
      '_private_foo', // not supported
      'CollisionFoo_', // we shouldn't have name collisions either, right?
      '_F',
      '_',
      'foo_bar',
      'Foo_bar',
      'fooBar',
      '_$Foo',
      'my$tuff',
      '__private_bar',
      'foo$',
    ].forEach((name) => {
      it(`${name} is NOT CapWords`, function () {
        assert(!isCapWords(name))
      })
    })
  })

  describe('isUpperSnakeCase', function () {
    ;['_F', 'F', 'FOO', 'FOO_BAR', '_FOO', '__FOO', '_FOO_BAR_', 'FOO_', '$'].forEach((name) => {
      it(`${name} is UPPER_SNAKE_CASE`, function () {
        assert(isUpperSnakeCase(name))
      })
    })
    ;[
      '_',
      '___FOO',
      'Foo',
      'FooBar',
      '$foo',
      '$Foo',
      'My$tuff',
      'foo_bar',
      'Foo_bar',
      'fooBar',
      '_$Foo',
      'my$tuff',
      '_PrivateFoo',
      '__PrivateBar',
      '_private_foo',
      'CollisionFoo_',
      '__private_bar',
      'foo$',
    ].forEach((name) => {
      it(`${name} is NOT UPPER_SNAKE_CASE`, function () {
        assert(!isUpperSnakeCase(name))
      })
    })
  })

  describe('hasLeadingUnderscore', function () {
    it('_ alone has leading underscores', function () {
      assert(hasLeadingUnderscore('_'))
    })
    it('empty string doesnt have leading underscores', function () {
      assert(!hasLeadingUnderscore(''))
    })
    it('foo doesnt have leading underscores', function () {
      assert(!hasLeadingUnderscore('foo'))
    })
    it('_foo has leading underscores', function () {
      assert(hasLeadingUnderscore('_foo'))
    })
  })
})
