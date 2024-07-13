// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface OpportunityConfig {
    struct OppConfig {
        string id;
        string subject;
        uint256 amount;
        uint256 rewardPercentage;
    }
}
