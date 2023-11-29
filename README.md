A community-maintained solhint fork

[![NPM
version](https://badge.fury.io/js/solhint-community.svg)](https://npmjs.org/package/solhint-community)
![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)

[![Telegram group badge](https://patrolavia.github.io/telegram-badge/chat.png)](https://t.me/+9TPjopBMry02MmQx)

This is an open source project for linting [Solidity](http://solidity.readthedocs.io/en/develop/) code. This project
provides both **Security** and **Style Guide** validations.

## Why use this fork
This fork was started in mid 2023 to provide the community with an up-to-date
linter regardless of protofire's funding allocations, which had proven
inconsistent in the past with a big hiatus in development from 2021-2023 and in
the middle of 2023.

Currently we're working on a major version change that'll hopefully bring many
improvements desired by the community (see [issues tagged with
v4.0.0](https://github.com/solhint-community/solhint-community/issues?q=is%3Aopen+is%3Aissue+label%3Av4.0.0)),
at the cost of some breaking changes.

## How to help out

- If you're a linter user, please consider using the latest release candidate
(currently using `"^3.7.0-rc00"` in your `package.json` will get you that),
where features are first pushed, and report any errors/potential improvements so
they don't get to affect most users.
- If you want to help as a developer, grab [some issue tagged with
good-first-issue](https://github.com/solhint-community/solhint-community/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+)
and see [contributing.md](./docs/contributing.md) for a quick start guide. Feel
free to create new issues or drop by the [telegram
group](https://t.me/+9TPjopBMry02MmQx) to ask for help!

## Installation

You can install solhint-community using **npm**:

```sh
npm install -g solhint-community

# verify that it was installed correctly
solhint --version
```

## Usage

First initialize a configuration file, if you don't have one:

```sh
solhint init-config
```

This will create a `.solhint.json` file with the recommended rules enabled. Then run Solhint with one or more [Globs](https://en.wikipedia.org/wiki/Glob_(programming)) as arguments. For example, to lint all files inside `contracts` directory, you can do:

```sh
solhint 'contracts/**/*.sol'
```

To lint a single file:

```sh
solhint contracts/MyToken.sol
```

Run `solhint` without arguments to get more information:

```text

Usage: solhint [options] <file> [...other_files]

Linter for Solidity programming language

Options:
  -V, --version                           output the version number
  -f, --formatter [name]                  chosen formatter for reports (stylish, table, tap, unix, json, compact)
  -w, --max-warnings [maxWarningsNumber]  number of allowed warnings
  -c, --config [file_name]                file to use as your .solhint.json
  -q, --quiet                             report errors only - default: false
  --ignore-path [file_name]               file to use as your .solhintignore
  --fix                                   automatically fix problems. If used in conjunction with stdin, then fixed file will be printed to stdout and report will be omitted
  --init                                  create configuration file for solhint. This option is deprecated, use init-config subcommand instead
  -h, --help                              display help for command

Commands:
  stdin [options]                         linting of source code data provided to STDIN
  init-config                             create configuration file for solhint
  list-rules                              display enabled rules of current config, including extensions
```

## Configuration

You can use a `.solhint.json` file to configure Solhint for the whole project.

To generate a new  sample `.solhint.json` file in current folder you can do:

```sh
solhint --init 
```

This file has the following format:
### Default 
```json
{
  "extends": "solhint:recommended"
}
```

### Sample
```json
  {
    "extends": "solhint:recommended",
    "plugins": [],
    "rules": {
      "avoid-suicide": "error",
      "avoid-sha3": "warn"
    }
  }
```
A full list of all supported rules can be found [here](docs/rules.md).

To ignore files that do not require validation you can use a `.solhintignore` file. It supports rules in
the `.gitignore` format.

```
node_modules/
additional-tests.sol
```

### Extendable rulesets

The extendable rulesets provided by solhint are the following:

+ ~~solhint:default~~ Deprecated as of 3.7.0
+ solhint:recommended

Use one of these as the value for the "extends" property in your configuration file.

### Configure the linter with comments

You can use comments in the source code to configure solhint in a given line or file.

For example, to disable all validations in the line following a comment:

```solidity
  // solhint-disable-next-line
  uint[] a;
```

You can disable specific rules on a given line. For example:

```solidity
  // solhint-disable-next-line not-rely-on-time, not-rely-on-block-hash
  uint pseudoRand = uint(keccak256(abi.encodePacked(now, blockhash(block.number))));
```

Disable validation on current line:

```solidity
  uint pseudoRand = uint(keccak256(abi.encodePacked(now, blockhash(block.number)))); // solhint-disable-line
```

Disable specific rules on current line:

```solidity
   uint pseudoRand = uint(keccak256(abi.encodePacked(now, blockhash(block.number)))); // solhint-disable-line not-rely-on-time, not-rely-on-block-hash
```

You can disable a rule for a group of lines:

```solidity
  /* solhint-disable avoid-tx-origin */
  function transferTo(address to, uint amount) public {
    require(tx.origin == owner);
    to.call.value(amount)();
  }
  /* solhint-enable avoid-tx-origin */
```

Or disable all validations for a group of lines:

```solidity
  /* solhint-disable */
  function transferTo(address to, uint amount) public {
    require(tx.origin == owner);
    to.call.value(amount)();
  }
  /* solhint-enable */
```

## Rules
### Security Rules
[Full list with all supported Security Rules](docs/rules.md#security-rules)
### Style Guide Rules
[Full list with all supported Style Guide Rules](docs/rules.md#style-guide-rules)
### Best Practices Rules
[Full list with all supported Best Practices Rules](docs/rules.md#best-practise-rules)

## Documentation

Related documentation you may find [here](https://solhint-community.github.io/solhint-community/).

## IDE Integrations

  - **[Sublime Text 3](https://packagecontrol.io/search/solhint)**
  - **[Atom](https://atom.io/packages/atom-solidity-linter)**
  - **[Vim](https://github.com/dense-analysis/ale)**, **[neovim](https://github.com/mfussenegger/nvim-lint)**
  - **[JetBrains IDEA, WebStorm, CLion, etc.](https://plugins.jetbrains.com/plugin/10177-solidity-solhint)**
  - **[VS Code: Solidity by Juan Blanco](
         https://marketplace.visualstudio.com/items?itemName=JuanBlanco.solidity)**
  - **[VS Code: Solidity Language Support by CodeChain.io](
         https://marketplace.visualstudio.com/items?itemName=kodebox.solidity-language-server)**

## Table of Contents

* [Roadmap](ROADMAP.md): The core project's roadmap - what the core team is looking to work on in the near future.
* [Contributing](docs/contributing.md): The core Solhint team :heart: contributions. This describes how you can contribute to the Solhint Project.
* [Shareable configs](docs/shareable-configs.md): How to create and share your own configurations.
* [Writing plugins](docs/writing-plugins.md): How to extend Solhint with your own rules.

## Plugins

- [solhint-plugin-prettier](https://github.com/fvictorio/solhint-plugin-prettier): Integrate Solhint
  with the [Solidity plugin for Prettier](https://github.com/prettier-solidity/prettier-plugin-solidity) to report & automatically fix formatting issues.
- [DeFi Wonderland](https://www.npmjs.com/package/@defi-wonderland/solhint-plugin): extra rules defined by Wonderland's team. Some of them now re-implemented here.

## Who uses Solhint-community?
[<img src="https://github.com/sablier-labs.png" width="75px" height="75px" alt="Sablier Labs" title="Sablier Labs" style="margin: 20px 20px 0 0" />](https://github.com/sablier-labs)
[<img src="https://github.com/PaulRBerg.png" width="75px" height="75px" alt="PRB-proxy" title="PRB-proxy" style="margin: 20px 20px 0 0" />](https://github.com/PaulRBerg/prb-proxy) [<img src="https://github.com/Mean-Finance.png" width="75px" height="75px" alt="Mean Finance" title="Mean Finance" style="margin: 20px 20px 0 0" />](https://github.com/Mean-Finance/call-simulation) [<img src="https://github.com/hoprnet.png" width="75px" height="75px" alt="HOPR network" title="HOPR network" style="margin: 20px 20px 0 0" />](https://github.com/hoprnet/hoprnet) 


## Acknowledgements

The Solidity parser used is [`@solidity-parser/parser`](https://github.com/solidity-parser/parser).

## Licence

MIT
