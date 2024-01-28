const BaseChecker = require('../base-checker')
const { severityDescription } = require('../../doc/utils')

const DEFAULT_SEVERITY = 'warn'

const ruleId = 'style-guide-casing'
const meta = {
  type: 'naming',

  docs: {
    description: 'Check identifier and type name casing conforms to the style guide',
    category: 'Style Guide Rules',
    options: [
      {
        description: severityDescription,
        default: DEFAULT_SEVERITY,
      },
    ],
    examples: {
      good: [
        {
          description: 'immutable/constant var name is capitalized snake case',
          code: 'uint private immutable WAD_DECIMALS = 18',
        },
        {
          description: 'constant var name is capitalized snake case',
          code: 'uint private constant WAD_DECIMALS = 18',
        },
        {
          description: 'function/modifier name in mixedCase',
          code: 'function foo_bar() {}',
        },
        {
          description: 'mutable var name in upper mixedCase',
          code: 'uint private FOO_BAR;',
        },
        {
          description: 'contract/enum/struct name in CapWords',
          code: 'contract Foo {}',
        },
      ],
      bad: [
        {
          description: 'immutable/constant var name in lowercase snake case',
          code: 'uint private immutable wad_decimals = 18',
        },
        {
          description: 'function/modifier name in snake case',
          code: 'function foo_bar() {}',
        },
        {
          description: 'function/modifier name in upper snake case',
          code: 'modifier FOO_BAR() {}',
        },
        {
          description: 'mutable var name in upper snake case',
          code: 'uint private FOO_BAR;',
        },
        {
          description: 'contract name in non-capitalized camelCase',
          code: 'contract foo {}',
        },
      ],
    },
  },

  recommended: true,
  defaultSetup: [DEFAULT_SEVERITY],

  schema: null,
}

class StyleGuideCasingChecker extends BaseChecker {
  constructor(reporter) {
    super(reporter, ruleId, meta)
  }
}

module.exports = StyleGuideCasingChecker
