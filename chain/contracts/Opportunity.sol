import {OpportunityConfig} from "./interfaces/IOppConfig.sol";
import {IPairOracle} from "./interfaces/IPairOracle.sol";
import {ISendRequest} from "./chainlink-functions/ISendRequest.sol";
import {IOppStatusUpdate} from "./interfaces/IOppStatusUpdate.sol";
import {Factory} from "./Factory.sol";

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Opportunity is OpportunityConfig, IOppStatusUpdate {
    uint256 _status; // 0: Pending, 1: Lost, 2: Won, 3: Paid

    address public manager;

    OppConfig public config;

    ISendRequest private statusConsumer;
    IPairOracle private oracle;

    uint256 public reward = 0;
    bool public verified = false;
    Factory _factory;

    event OppStatusChanged(uint256 status);
    event OppStatusCheckTriggered(
        uint256 subscriptionId,
        address oppAddress,
        string[] ids
    );
    event OppStatusChangeReceived(string id, uint256 newStatus);

    constructor(
        address _manager,
        address factory_,
        OppConfig memory _config,
        address _statusConsumer,
        address _oracle
    ) {
        _status = 0;
        manager = _manager;
        config = _config;
        _factory = Factory(factory_);

        statusConsumer = ISendRequest(_statusConsumer);
        oracle = IPairOracle(_oracle);
    }

    function verifyStatus() external {
        string[] memory ids = new string[](1);
        ids[0] = config.id; // Assign config.id to the first element of the array
        statusConsumer.sendRequest(129, address(this), ids);
        emit OppStatusCheckTriggered(129, address(this), ids);
    }

    function updateOppStatus(
        string memory _id,
        uint256 newStatus
    ) external override {
        require(
            msg.sender == address(statusConsumer),
            "Caller is not the status consumer"
        );

        emit OppStatusChangeReceived(_id, newStatus);

        verified = true;

        if (newStatus == 2) {
            _status = 2;
            _issueReward();
        } else {
            _status = 1;
        }

        emit OppStatusChanged(_status);
    }

    function status() external view returns (uint256) {
        return _status;
    }

    function isVerified() external view returns (bool) {
        return verified;
    }

    function triggerReward() external {
        _issueReward();
    }

    function _issueReward() internal {
        // everyone can trigger since will be paid only when verified & reward calculated
        require(verified, "Not verified yet");
        require(_status == 2, "Opportunity is not won");

        if (reward == 0) {
            reward = _calculateReward();
        }

        require(reward > 0, "Reward is 0");

        bool success = Factory(_factory).issueReward(
            manager,
            config.id,
            reward
        );

        require(success, "Reward transfer failed");
        _status = 3;
    }

    function _calculateReward() internal view returns (uint256) {
        uint256 price = _getPairPrice();

        uint256 BASE = 10 ** 18;

        // e.g. 10% from 10000$ = (10000 * 10**18 * 10 / 100) = 1000 * 10**18
        // 1000 * 10**18 * 10**18 / 3138 * 10**18 ~= 318674314850223072 wei
        return
            (((config.amount * config.rewardPercentage) / 100) * BASE) / price;
    }

    // Calculates ETH/USD price for reward calculation
    function _getPairPrice() internal view returns (uint256) {
        (bool isValid, uint256 price) = oracle.tryRead();
        require(isValid, "Oracle price is not valid");

        return price;
    }
}
