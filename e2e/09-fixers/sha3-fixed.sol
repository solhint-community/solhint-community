contract Sha3Error {
    function doThing() public pure returns(bytes32) {
        return keccak256("foobar");
    }
}
