const linter = require('../../../lib/index')
const { assertNoWarnings, assertWarnsCount, assertErrorMessage } = require('../../common/asserts')
const { contractWith, multiLine, funcWith } = require('../../common/contract-builder')

describe('Linter - named-parameters-function', () => {
  describe('GIVEN default rule settings', function () {
    const config = {
      rules: { 'named-parameters-function': 'warn' },
    }

    it('WHEN calling with two positional arguments THEN it does NOT report', () => {
      const code = contractWith(
        multiLine('function foo(uint a, uint b) {}', `function bar (){foo(1,2);}`)
      )
      assertNoWarnings(linter.processStr(code, config))
    })
    it('WHEN calling with four positional arguments THEN it reports', () => {
      const code = contractWith(
        multiLine(
          'function foo(uint a, uint b, uint c, uint d) {}',
          `function bar (){foo(1,2,3,4);}`
        )
      )
      const report = linter.processStr(code, config)
      assertWarnsCount(report, 1)
      assertErrorMessage(
        report,
        'Call to function with arity > 3 is using positional arguments. Use named arguments instead.'
      )
    })
    it('WHEN calling with four named arguments THEN it does NOT report', () => {
      const code = contractWith(
        multiLine(
          'function foo(uint a, uint b, uint c, uint d) {}',
          `function bar (){foo({a: 1, b: 2, c:3, d:4});}`
        )
      )
      assertNoWarnings(linter.processStr(code, config))
    })
  })

  describe('GIVEN a setting of one maximum positional argument', function () {
    const config = {
      rules: { 'named-parameters-function': ['warn', 1] },
    }
    describe('builitin functions with named parameters', function () {
      it('WHEN calling require with a positional error message THEN it reports', function () {
        const code = funcWith('require(false, "this is an error");')
        assertWarnsCount(linter.processStr(code, config), 1)
      })
      it('WHEN calling require with a named error message THEN it does NOT report', function () {
        const code = funcWith('require({condition: false, message: "this is an error"});')
        assertNoWarnings(linter.processStr(code, config))
      })
      it('WHEN calling require without an error message THEN it does NOT report', function () {
        const code = funcWith('require(false);')
        assertNoWarnings(linter.processStr(code, config))
      })

      it('WHEN calling builtin function mulmod with named parameters THEN it does NOT report', function () {
        const code = funcWith('uint r = mulmod({x: 100, y: 7, k: 4});')
        assertNoWarnings(linter.processStr(code, config))
      })
      it('WHEN calling builtin function ecrecover with named parameters THEN it does NOT report', function () {
        const code = funcWith('uint r = ecrecover({hash: foo, v: bar, r: baz, s: moo});')
        assertNoWarnings(linter.processStr(code, config))
      })
      it('WHEN calling builtin function ecrecover with positional parameters THEN it reports', function () {
        const code = funcWith('uint r = ecrecover(foo, bar, baz, moo);')
        assertWarnsCount(linter.processStr(code, config), 1)
      })
    })

    describe('builtin variadic functions', function () {
      it('WHEN calling abi.decode with positional arguments, THEN it does NOT report', function () {
        const code = funcWith('(uint a, uint b, uint c) = abi.decode(data, (uint, uint, uint));')
        assertNoWarnings(linter.processStr(code, config))
      })
      ;['encode', 'encodePacked', 'encodeWithSelector', 'encodeWithSignature'].forEach((method) => {
        it(`WHEN calling abi.${method} with positional arguments, THEN it does NOT report`, function () {
          const code = funcWith(`bytes foo = abi.${method}(foo, bar, baz);`)
          assertNoWarnings(linter.processStr(code, config))
        })
      })
    })
  })

  describe('GIVEN an invalid setting of zero', function () {
    const config = {
      rules: { 'named-parameters-function': ['warn', 0] },
    }
    it('WHEN calling no arguments THEN it does NOT report', () => {
      const code = contractWith(multiLine('function foo() {}', `function bar (){foo();}`))
      assertNoWarnings(linter.processStr(code, config))
    })
    it('WHEN calling with one positional argument THEN it does NOT report', () => {
      const code = contractWith(multiLine('function foo(uint a) {}', `function bar (){foo(3);}`))
      assertNoWarnings(linter.processStr(code, config))
    })

    it('WHEN doing a cast to a user defined type, THEN it should NOT report an error', function () {
      const code = `
          contract A {}
          contract B {
            address public a;
            function setA(address addr) external {
              a = A(addr);
            }
          }
          `
      assertNoWarnings(linter.processStr(code, config))
    })
    ;[
      ['uint', 'uint256', 'int', 'int256', 'uint8', 'int128'],
      ['ufixed', 'ufixed128x18', 'fixed', 'fixed128x18'],
      ['bytes1', 'bytes32', 'bytes', 'bytes12'],
      ['address', 'payable', 'address payable'],
    ]
      .flat()
      .forEach((i) => {
        it(`WHEN doing a cast to native type ${i} THEN it does NOT report an error`, function () {
          const code = contractWith(`function bar (){${i}(3);}`)
          assertNoWarnings(linter.processStr(code, config))
        })
      })
  })

  it('GIVEN a setting of 4, THEN it does NOT warn on calls with four positional arguments', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c, uint d) {}', `function bar (){foo(1,2,3,4);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 4] },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a recommended solhint config, THEN the rule is disabled and no errors are reported', () => {
    const code = contractWith(
      multiLine(
        'function foo(uint a, uint b, uint c, uint d) public {}',
        `function bar () public {foo(1,2,3,4);}`
      )
    )

    const report = linter.processStr(code, {
      extends: 'solhint:recommended',
      rules: { 'compiler-version': 'off', 'no-empty-blocks': 'off' },
    })

    assertNoWarnings(report)
  })

  it('GIVEN a setting of 2, THEN it warns on calls with 3 positional argument', () => {
    const code = contractWith(
      multiLine('function foo(uint a, uint b, uint c) {}', `function bar (){foo(1,2,3);}`)
    )

    const report = linter.processStr(code, {
      rules: { 'named-parameters-function': ['warn', 2] },
    })

    assertWarnsCount(report, 1)
    assertErrorMessage(
      report,
      'Call to function with arity > 2 is using positional arguments. Use named arguments instead.'
    )
  })
})
