## [4.0.1] - XXXX-XX-XX
### Fixed
- `custom-errors`: Made the rule more fine-grained by allowing custom errors as
  the second argument of `require` statements (e.g., `require(cond, CustomError())`)
  https://github.com/solhint-community/solhint-community/pull/163
- updated parser version to `0.19.0` to support transient variables
  https://github.com/solhint-community/solhint-community/pull/168
- false positive in `no-unused-var` when function parameters are only used only as
  modifier arguments
  https://github.com/solhint-community/solhint-community/pull/159

## [4.0.0] - 2024-04-10
Stable release.
Current `latest` version.

Includes lots of breaking changes such as removing rules or changing their
semantics, while also adding some long-awaited features, such as:
- parsing multiple config files from subdirectories
- better handling of exit codes
- saner defaults, such as using solhint:recommended ruleset when run without a
  config file present instead of erroring out
- clumped all style guide casing constranints into a single rule
- re-defined the recommended ruleset

For a comprehensive list of changes, see the changelog for `4.0.0-rc0{0-4}`, listed below:

## [4.0.0-rc04] - 2024-04-10

### Breaking
- changed payable-fallback to not revert when fallback function is not payable
  but there's a receive function:
  https://github.com/solhint-community/solhint-community/pull/145

## [4.0.0-rc03] - 2024-03-27

### Breaking
- removed `foundry-test-functions` to be re-added in `4.1.0`
  https://github.com/solhint-community/solhint-community/pull/139
- disabled `custom-errors` on files whose pragma directive doesn't allow
  versions equal or greater than 0.8.4, where they were introduced
  https://github.com/solhint-community/solhint-community/pull/142
- made `--quiet` not take precedence over `--max-warnings`
  https://github.com/solhint-community/solhint-community/pull/143

## [4.0.0-rc02] - 2024-02-20

### Breaking
- use solhint:recommended when no config is available, instead of exiting with
  an error https://github.com/solhint-community/solhint-community/pull/135
- exit with a different code when linter is configured incorrectly (255) vs
  when errors are found in linted files (1) https://github.com/solhint-community/solhint-community/pull/134
    - also exit eagerly when a misconfiguration is detected, to help the programmer
    realize of their mistake sooner
- created `style-guide-casing` rule to enforce all `mixedCase`, `CapWords` and
`SNAKE_CASE` requirements from the style guide in one place, removing the
following rules:
    - `const-name-snakecase￼`
    - `definition-name-capwords￼`
    - `func-name-mixedcase￼`
    - `modifier-name-mixedcase￼`
    - `var-name-mixedcase￼`
    - `immutable-name-snakecase`

### Added
- configuration for `style-guide-casing` allowing to ignore specific nodes,
which will come in handy for `foundry-test-functions`:
https://github.com/solhint-community/solhint-community/pull/137

## [4.0.0-rc01] - 2024-01-28

### Breaking
- removed `no-unused-import`, is now a special case of `no-unused-vars` https://github.com/solhint-community/solhint-community/pull/22
- removed `contract-name-camelcase`, which checked event, struct, enum and
  contract names were in CapWords. moved that functionality into new rule
  `definition-name-capwords`: https://github.com/solhint-community/solhint-community/pull/108
- removed `event-name-camelcase`, moved functionality to `definition-name-capwords` 
  https://github.com/solhint-community/solhint-community/pull/108
- removed `func-param-name-mixedcase` since functionality was already covered by
`var-name-mixedcase` https://github.com/solhint-community/solhint-community/pull/110
- promoted to recommended https://github.com/solhint-community/solhint-community/pull/106
    -  `named-return-values`
    -  `explicit-types`
    -  `custom-errors`
- demoted `not-rely-on-time` out of recommended https://github.com/solhint-community/solhint-community/pull/106
- `ordering`: enums have to go before structs (previously, all type definitions
  were equivalent) https://github.com/solhint-community/solhint-community/pull/126
- `ordering`: order of state variable declarations has to be constant ->
  immutable -> mutable (previously all state variable definitions were equivalent)
  https://github.com/solhint-community/solhint-community/pull/126
- promoted `one-contract-per-file` to recommended ruleset
  https://github.com/solhint-community/solhint-community/pull/115
- promoted `modifier-name-mixedcase` to recommended ruleset
  https://github.com/solhint-community/solhint-community/pull/115

### Added
- ported non-state-vars-leading-underscore from wonderland's plugin, alongside
  some improvements making it more opinionated & useful for hunting for storage
  operations https://github.com/solhint-community/solhint-community/pull/114

### Updated
- fully removed code for solhint:default ruleset https://github.com/solhint-community/solhint-community/pull/105

### Added
- added a config parameter to `named-return-values` to ignore functions with
  less than N return values, and set the default to 1, to make it a less
  disruptive addition to the recommended ruleset
  https://github.com/solhint-community/solhint-community/pull/128

### Fixed
- recognize shadowing of imports and stack variables https://github.com/solhint-community/solhint-community/pull/22
- `plugins` field was being silently dropped from configs in last release
  candidate. Fixed that. https://github.com/solhint-community/solhint-community/pull/121
- ensure rules `named-parameters-mapping` and `foundry-test-functions` don't have a
  default severity of 'off', which would've disabled them in `solhint:all`
  https://github.com/solhint-community/solhint-community/pull/118/files
- run doc genereation under windows in CI and ensure they don't differ from the
  commited ones https://github.com/solhint-community/solhint-community/pull/127

## [4.0.0-rc00] - 2023-12-29

### Added
- support for config files in subdirectories https://github.com/solhint-community/solhint-community/pull/93
- include interface-starts-with-i from wonderland's plugin: https://github.com/solhint-community/solhint-community/pull/107

### Breaking
- remove `solhint:default` ruleset https://github.com/solhint-community/solhint-community/pull/103
- remove `mark-callable-contract` rule https://github.com/solhint-community/solhint-community/pull/103
- remove `func-order` rule https://github.com/solhint-community/solhint-community/pull/103
- remove `--init` flag https://github.com/solhint-community/solhint-community/pull/103
- `-c` flag adds a config file to the list of config files to source instead of
replacing the default
https://github.com/solhint-community/solhint-community/pull/103
- remove unused config fields https://github.com/solhint-community/solhint-community/pull/100

### Updated
- cache npm dependencies for faster CI https://github.com/solhint-community/solhint-community/pull/95
- increase mocha timeout https://github.com/solhint-community/solhint-community/pull/99

## [3.7.0] - 2023-12-05
Includes all changes for `3.7.0-rc0{0-4}`, listed below.

## [3.7.0-rc04] - 2023-12-04

### Added
- explicit types fixer, alongside unit & e2e tests not present in
protofire/solhint https://github.com/solhint-community/solhint-community/pull/86
- (backport) ignore interfaces in one contract per file
https://github.com/solhint-community/solhint-community/pull/82

### Added 
- documentation updates for 3.7.0 release
https://github.com/solhint-community/solhint-community/pull/83

### Improved
- e2e tests for root command options https://github.com/solhint-community/solhint-community/pull/81
- modularize plumbing for applyFixes: https://github.com/solhint-community/solhint-community/pull/87

## [3.7.0-rc03] - 2023-11-27
### Added
- backport enabling require-ing of a shareable config by full path, usually by
using require.resolve in .solhintrc.js
https://github.com/solhint-community/solhint-community/pull/78
Also fixed a bug in list-rules where it skipped rules enabled by the extended
configs
- (backport) list-rules subcommand
https://github.com/solhint-community/solhint-community/pull/62

### Fixed
- e2e tests for stdin subcommand, and enabled the subcommand to use root
command's flags https://github.com/solhint-community/solhint-community/pull/75
- (backport) make sure json formatter outputs valid JSON and not a js object
https://github.com/solhint-community/solhint-community/pull/64
- (backport) removed false positives in check-send-result
https://github.com/solhint-community/solhint-community/pull/61
- (backport) documentation improvements
https://github.com/solhint-community/solhint-community/pull/60
- (backport + improvements) disabled no-emtpy-blocks on receive function
https://github.com/solhint-community/solhint-community/pull/59
- named-parameters-function remove unavoidable  report on native variadic
functions  https://github.com/solhint-community/solhint-community/pull/58


## [3.7.0-rc02] - 2023-10-16
### Added
- backport named-return-variables with small improvements:
https://github.com/solhint-community/solhint-community/pull/56
- backport immutable-vars-naming (with a different name:
immutable-name-snakecase)
https://github.com/solhint-community/solhint-community/pull/54/
- backport one-contract-per-file
https://github.com/solhint-community/solhint-community/pull/52
- backport custom-errors rule, with improvements
https://github.com/solhint-community/solhint-community/pull/42
https://github.com/solhint-community/solhint-community/pull/44
- backport explicit-types rule, with improvements
https://github.com/solhint-community/solhint-community/pull/41
- backport foundry-test-names
https://github.com/solhint-community/solhint-community/pull/47

### Fixed
- Improved doc generation
https://github.com/solhint-community/solhint-community/pull/43
https://github.com/solhint-community/solhint-community/pull/53
- Improved CI
https://github.com/solhint-community/solhint-community/pull/48
- Updated compiler-version to current solc version (a backport, with some
improvements): 
https://github.com/solhint-community/solhint-community/pull/50
- backport: remove runtime dependency on load-rules
https://github.com/solhint-community/solhint-community/pull/46
- backport: solcjs to handle --max-warnings in a manner more consistent with
eslint: https://github.com/solhint-community/solhint-community/pull/51 (plus
added tests)

## [3.7.0-rc01] - 2023-07-23

### Updated
- depreacted solhit:default ruleset:
https://github.com/solhint-community/solhint-community/pull/36

## [3.6.1] - 2023-07-31

### Fixed
false positives in no-unused-imports with nested mappings: 
https://github.com/solhint-community/solhint-community/pull/37

## [3.6.0] - 2023-07-13

### Updated
- lint missing files and remove nested npm project:
https://github.com/solhint-community/solhint-community/pull/15

### Fixed
- false positives in no-unused-imports:
https://github.com/solhint-community/solhint-community/pull/33
https://github.com/solhint-community/solhint-community/pull/32

### Added
- named-parameters-function rule
https://github.com/solhint-community/solhint-community/pull/25

## [3.5.2] - 2023-07-4

### Fixed
- Fix false positives in no-unused-imports https://github.com/solhint-community/solhint-community/pull/21

## [3.5.1] - 2023-06-14

### Updated
- Linked telegram group in readme & docs https://github.com/solhint-community/solhint-community/pull/11

### Fixed
- Restore compact formatter and test existing formatters so we don't remove them again:
https://github.com/solhint-community/solhint-community/pull/14

## [3.5.0] - 2023-05-30

### Updated
- Renamed stuff for this fork: https://github.com/solhint-community/solhint-community/pull/1

### Added
- no-unused-imports rule: https://github.com/solhint-community/solhint-community/pull/3 

### Fixed
- Ignore empty blocks in constructors with non-empty initialization lists https://github.com/solhint-community/solhint-community/pull/8 


<br><br>

## [3.4.1] - 2023-03-06
### Updated
- Updated solidity parser to 0.16.0 [#420](https://github.com/protofire/solhint/pull/420)

### Added
- Added github workflow to execute unit tests on each PR [#412](https://github.com/protofire/solhint/pull/412)
- Added macOS and windows into E2E github workflow [#422](https://github.com/protofire/solhint/pull/422)

### Fixed
- False positive on for-loop Yul [#400](https://github.com/protofire/solhint/pull/400)
- Ordering-rule support for Top Level statements [#393](https://github.com/protofire/solhint/pull/393)
- Fix no-global-import to accept named global imports [#416](https://github.com/protofire/solhint/pull/416)
- Fix named-parameters-mapping to not enforce on nested mappings [#421](https://github.com/protofire/solhint/pull/421)





<br><br>
## [3.4.0] - 2023-02-17
### Updated
- Solhint dependencies to support newer versions [#380](https://github.com/protofire/solhint/pull/380)
- Linter fixed to get clearer source code [#381](https://github.com/protofire/solhint/pull/381)
- E2E, added formatters into repo, updated CI [#385](https://github.com/protofire/solhint/pull/385)
- Solhint dependencies to support newer versions [#403](https://github.com/protofire/solhint/pull/403)
  
### Added
- New Rule: For banning "console.sol" and "import hardhat or foundry console.sol" [#372](https://github.com/protofire/solhint/pull/372)
- New Rule: No global imports [#390](https://github.com/protofire/solhint/pull/390)
- New Rule: Named parameters in v0.8.18 solidity version [#403](https://github.com/protofire/solhint/pull/403)

### Fixed
- TypeError: cannot read property 'errorCount' of undefined [#351](https://github.com/protofire/solhint/pull/351)
- Directories with .sol in the name path treated as files [#352](https://github.com/protofire/solhint/pull/388)
- Doc generator and added a CI step to avoid crashing [#389](https://github.com/protofire/solhint/pull/389)
- Rule for banning "console.sol" and "import hardhat or foundry console.sol [#391](https://github.com/protofire/solhint/pull/391)
- Option –quiet works now with all files [#392](https://github.com/protofire/solhint/pull/392)
- Transfers with .call excluded from warning as low level code [#394](https://github.com/protofire/solhint/pull/394)
- Made func-visibility skip free functions [#396](https://github.com/protofire/solhint/pull/396)
- False positive on no-unused-vars for payable arguments without name [#399](https://github.com/protofire/solhint/pull/399)





<br><br>
## [3.3.8] - 2023-01-17
### Fixed Docs and Typos
- [#292](https://github.com/protofire/solhint/pull/292)
- [#343](https://github.com/protofire/solhint/pull/343)
- [#355](https://github.com/protofire/solhint/pull/355)
- [#285](https://github.com/protofire/solhint/pull/285)
  

### Updated
- Solidity Parser to 0.14.5 [#330](https://github.com/protofire/solhint/pull/330) - [#378](https://github.com/protofire/solhint/pull/378)


<br><br>
## TIME GAP
## [2.1.0] - 2019-05-30

### Added

- New `compiler-version` rule (see PR #112)

### Fixed

- Several fixes for the `mark-callable-contracts` rule (PRs #115, #117 and #119)

## [2.0.0] - 2019-02-15

Stable release

## [2.0.0-beta.1] - 2019-01-31
### Fixed
- Fix linter errors

## [2.0.0-alpha.3] - 2019-01-23
### Changed
- Update config initializer [#103](https://github.com/protofire/solhint/pull/103) 

## [2.0.0-alpha.2] - 2019-01-08
### Changed
- Remove prettier from rule

## [2.0.0-alpha.1] - 2019-01-08
### Fixed
- Package version

## [2.0.0-alpha.0] - 2019-01-08
### Added
- Add rulesets [#73](https://github.com/protofire/solhint/issues/73)
- Add plugins support [#99](https://github.com/protofire/solhint/pull/99)
- Update docs

## [1.5.0] - 2018-12-26
### Added
- Add not-rely-on-time to rules documentation [#88](https://github.com/protofire/solhint/pull/88)
- Have --max-warnings better reflect its name [#89](https://github.com/protofire/solhint/pull/89)
- Added disable-previous-line [#91](https://github.com/protofire/solhint/pull/91)
- Snake case now allows for a (single) leading underscore [#93](https://github.com/protofire/solhint/pull/93)

### Fixed
- Fixed some comment directive tests [#92](https://github.com/protofire/solhint/pull/92)

## [1.4.1] - 2018-12-10
### Added
- Allow to specify the path to the config file [#78](https://github.com/protofire/solhint/issues/78)
- Roadmap and changelog [#81](https://github.com/protofire/solhint/issues/81)

### Changed
- Upgrade grammar [#79](https://github.com/protofire/solhint/pull/79)

## [1.4.0] - 2018-10-10
### Added
- Support prettier-solidity [#72](https://github.com/protofire/solhint/pull/72)

## [1.3.0] - 2018-09-25
### Added
- Add "Projects that use solhint" to README.md file [#64](https://github.com/protofire/solhint/issues/63)
- Add prettier and airbnb [#59](https://github.com/protofire/solhint/issues/59)
- Add new feature --ignore-path option [#58](https://github.com/protofire/solhint/issues/58)
- Add contribution formatter parameter validation [#54](https://github.com/protofire/solhint/pull/54)
- Add --max-warnings [int] option [#56](https://github.com/protofire/solhint/issues/56)
- Add --quiet option [#55](https://github.com/protofire/solhint/pull/55)

### Changed
- Move rules sections out from README.md [#65](https://github.com/protofire/solhint/issues/65)
- Complete docs and readme [#61](https://github.com/protofire/solhint/issues/61)

### Fixed
- Unable to satisfy indentation rules for functions with multiple return values [#49](https://github.com/protofire/solhint/issues/49)
