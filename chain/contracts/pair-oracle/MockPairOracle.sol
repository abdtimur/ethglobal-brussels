// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPairOracle} from "../interfaces/IPairOracle.sol";

contract MockPairOracle is IPairOracle {
    constructor(address chronicle_, address selfKisser_) {}

    function tryRead() external view returns (bool isValid, uint value) {
        return (true, 3138445000000000000000);
    }
}
