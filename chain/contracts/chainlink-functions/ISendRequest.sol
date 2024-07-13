// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ISendRequest {
    function sendRequest(
        uint64 subscriptionId,
        address opportunityAddress,
        string[] calldata args
    ) external returns (bytes32 requestId);
}
