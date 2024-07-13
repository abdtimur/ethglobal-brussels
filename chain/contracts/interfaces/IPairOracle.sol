// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IPairOracle {
    function tryRead() external view returns (bool isValid, uint value);
}
