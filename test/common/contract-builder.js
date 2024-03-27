const { times } = require('lodash')

function contractWith(code, version) {
  return `
      pragma solidity ${version || '0.4.4'};
        
        
      contract A {
        ${code}
      }
    `
}

function libraryWith(code) {
  return `
      pragma solidity 0.4.4;
        
        
      library A {
        ${code}
      }
    `
}

function funcWith(statements, version) {
  return contractWith(
    `
        function b() public {
          ${statements}
        }
    `,
    version
  )
}

function modifierWith(statements) {
  return contractWith(`
        modifier b() {
          ${statements}
        }
    `)
}

function multiLine(...args) {
  return args.join('\n')
}

function contractWithPrettier(code) {
  return `pragma solidity 0.4.4;

contract A {
  ${code}
}
`
}

function stateDef(count) {
  return repeatLines('        uint private a;', count)
}

function constantDef(count) {
  return repeatLines('        uint private constant TEST = 1;', count)
}

function repeatLines(line, count) {
  return times(count)
    .map(() => line)
    .join('\n')
}

module.exports = {
  contractWith,
  libraryWith,
  funcWith,
  modifierWith,
  multiLine,
  contractWithPrettier,
  stateDef,
  constantDef,
  repeatLines,
}
