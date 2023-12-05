const VAR_DECLARATIONS = {
  // these cases try to make sure I catch every *type* that can be made explicit
  // or implicit
  uint256: {
    explicit: 'uint256 public varUint;',
    implicit: 'uint public varUint;',
    implicitTypeName: 'uint',
    explicitTypeName: 'uint256',
  },
  int256: {
    explicit: 'int256 public varInt;',
    implicit: 'int public varInt;',
    implicitTypeName: 'int',
    explicitTypeName: 'int256',
  },
  ufixed128x18: {
    explicit: 'ufixed128x18 public varUfixed;',
    implicit: 'ufixed public varUfixed;',
    implicitTypeName: 'ufixed',
    explicitTypeName: 'ufixed128x18',
  },
  fixed128x18: {
    explicit: 'fixed128x18 public varFixed;',
    implicit: 'fixed public varFixed;',
    implicitTypeName: 'fixed',
    explicitTypeName: 'fixed128x18',
  },

  // Here I try to be sure I don't miss places where a type can be used
  memoryArrayCreation: {
    explicit: 'function foo() public {uint256[] memory arr = new uint256[](5);}',
    implicit: 'function foo() public {uint256[] memory arr = new uint[](5);}',
  },
  functionParameterUint256: {
    explicit: 'function withUint256(uint256 varUint256) public {}',
    implicit: 'function withUint256(uint varUint256) public {}',
  },
  functionReturn: {
    explicit: 'function foo() public returns(int256 returnInt) {}',
    implicit: 'function foo() public returns(int returnInt) {}',
  },
  eventParameter: {
    implicit: 'event EventWithInt256(int varWithInt256);',
    explicit: 'event EventWithInt256(int256 varWithInt256);',
  },
  mappingKey: {
    implicit: 'mapping(uint => fixed128x18) public map;',
    explicit: 'mapping(uint256 => fixed128x18) public map;',
  },
  mappingValue: {
    implicit: 'mapping(uint256 => fixed) public map;',
    explicit: 'mapping(uint256 => fixed128x18) public map;',
  },
  nestedMappingKey: {
    implicit: 'mapping(uint256 => mapping(fixed => int256)) mapOfMap;',
    explicit: 'mapping(uint256 => mapping(fixed128x18 => int256)) mapOfMap;',
  },
  nestedMappingValue: {
    implicit: 'mapping(uint256 => mapping(fixed128x18 => int)) mapOfMap;',
    explicit: 'mapping(uint256 => mapping(fixed128x18 => int256)) mapOfMap;',
  },
  structMember: {
    implicit: 'struct Estructura { uint varUint; }',
    explicit: 'struct Estructura { uint256 varUint; }',
  },
  structWithMappingMember: {
    implicit: 'struct Estructura { mapping(address => uint) structWithMap; } ',
    explicit: 'struct Estructura { mapping(address => uint256) structWithMap; } ',
  },
  array: {
    implicit: 'uint[] public arr;',
    explicit: 'uint256[] public arr;',
  },
  castInArrayDeclaration: {
    implicit: 'uint256[] public arr = [uint(1),2,3];',
    explicit: 'uint256[] public arr = [uint256(1),2,3];',
  },
  castInStateVariableDeclaration: {
    implicit: 'uint256 public varUint = uint(1);',
    explicit: 'uint256 public varUint = uint256(1);',
  },
  castInsideFunctionAtDeclarationUint256: {
    implicit: 'function withUint256() external { uint256 varUint256 = uint(1); }',
    explicit: 'function withUint256() external { uint256 varUint256 = uint256(1); }',
  },
  castInExpressionStatement: {
    implicit: 'function withUint() external { uint256 varUint; varUint = uint(1);}',
    explicit: 'function withUint() external { uint256 varUint; varUint = uint256(1);}',
  },
}

module.exports = VAR_DECLARATIONS
