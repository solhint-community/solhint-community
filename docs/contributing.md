Contributing to Solhint
=======================

_Thanks for considering contributing to Solhint!_

The following is a set of guidelines for contributions. Feel free to suggest
improvements to this document in a pull request.

If you want to chat with fellow solhint devs, feel free to drop by the [telegram group](https://t.me/+9TPjopBMry02MmQx)

Issues and feature requests
---------------------------

If you have any issues to report or features to request, please use the
[issue tracker](https://github.com/solhint-community/solhint-community/issues).

Development
-----------

### Requirements

In order to develop Solhint, you'll need:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)

### Getting Started

Clone this repository and install npm dependencies:

    $ git clone git@github.com:solhint-community/solhint-community.git
    $ cd solhint-community
    $ npm install

### Testing changes without re-installing

Since `solhint` is a CLI tool, the best way to test new changes immediately
after they are done is to globally link the module. Go to the repository and
run:

    $ npm link

This will create a symbolic link to `solhint`'s directory. Any changes you make
will be available when you use `solhint` in any terminal.

### Running tests

If you make changes to the existing code, please make sure that all tests are
passing. If you contribute with a new feature, please add tests for it. To run the tests:

    $ npm test

Git workflow
------------
Development for the next major version, `4.0.0` should take place on `master`
branch.

When working towards a release candidate, currently `3.7.0-rc*`, we usually have a
branch for that where we move a bit faster and have a slightly higher tolerance
for bugs.

All releases pushed to npm get their own tag in this repo with a `v` preppended
to it.

Currently, the repo looks like so:

```
*----*----* master (no rc yet, v4.0.0)
      \    \
       \    \---*---*---* release-3.7.0 (v3.7.0, 3.7.0-rc)
        \
         \---* release-3.6.1 (v3.6.1, stable version)
```

With the upcoming changes for v4, our history will end up being similar to this:

```
*---*---* ---------------*master (v4.0.0-rc)
    \    \             /
     \    \---*---*---* release-3.7.0 (v3.7.0, stable)
      \                \
       \                \---*(v3.7.1)---*(v3.7.2) release-3-7-x
        \
         \---* release-3.6.1 (v3.6.1, stable version)
```

Pull Requests
-------------

All code changes happen through pull requests. To create one:

1. Fork the repo and create your branch from `master`.
2. Make the changes you want to do.
3. Ensure the tests are still passing. Please remember to add tests for new features.
4. Create the pull request.


License
-------

By contributing, you agree that your contributions will be licensed under its MIT License.
