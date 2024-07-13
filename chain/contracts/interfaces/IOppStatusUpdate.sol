// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IOppStatusUpdate {
    function verified() external view returns (bool);

    function status() external view returns (uint256);

    function updateOppStatus(string memory _id, uint256 _status) external;
}
