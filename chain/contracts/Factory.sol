// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Opportunity.sol";
import {OpportunityConfig} from "./interfaces/IOppConfig.sol";

contract Factory is OpportunityConfig {
    address public chainlinkNode;
    address public pairOracle;
    mapping(address => mapping(string => address)) managerToOpportunity; // manager => opp id => opportunity
    mapping(address => bool) public verifiedManagers;
    mapping(address => address) public managerPersonalWallet;

    address private _owner;

    event OpportunityCreated(
        address indexed opportunity,
        address indexed manager
    );
    event OpportunityVerified(
        address indexed opportunity,
        address indexed manager,
        uint256 reward
    );

    event OppRewardPaid(uint256 reward, address manager, address paidTo);

    event Deposited(address indexed from, uint256 value);

    constructor(address _chainlinkNode, address _pairOracle) {
        // TODO: ownable from oz

        chainlinkNode = _chainlinkNode;
        pairOracle = _pairOracle;

        _owner = msg.sender;
    }

    function withdrawToOwner() public {
        require(msg.sender == _owner, "Only owner can withdraw");
        (bool success, ) = _owner.call{value: address(this).balance}("");
        require(success, "Transfer to owner failed.");
    }

    function addFunds() public payable {
        emit Deposited(msg.sender, msg.value);
    }

    function setConsumer(address _chainlinkNode) public {
        chainlinkNode = _chainlinkNode;
    }

    function setOracle(address _pairOracle) public {
        pairOracle = _pairOracle;
    }

    function registerManager(address manager) public {
        // TODO: only owner
        verifiedManagers[manager] = true;
    }

    function registerPersonalWallet(address wallet) public {
        require(
            verifiedManagers[msg.sender],
            "Only verified managers can register personal wallets"
        );
        managerPersonalWallet[msg.sender] = wallet;
    }

    function isManagerVerified(address manager) public view returns (bool) {
        return verifiedManagers[manager];
    }

    function getManagerMainWallet(
        address manager
    ) public view returns (address) {
        return _getManagerMainWallet(manager);
    }

    function _getManagerMainWallet(
        address manager
    ) internal view returns (address) {
        if (managerPersonalWallet[manager] == address(0)) {
            return manager;
        }
        return managerPersonalWallet[manager];
    }

    function createOpportunity(
        address manager,
        OppConfig memory details
    ) public {
        // TODO: check for only owner or only verified providers
        require(
            verifiedManagers[manager],
            "Only verified managers can create opportunities"
        );

        // TODO: check for unique id, left for testing

        Opportunity newOpportunity = new Opportunity(
            manager,
            address(this),
            details,
            chainlinkNode,
            pairOracle
        );
        managerToOpportunity[manager][details.id] = address(newOpportunity);
        emit OpportunityCreated(address(newOpportunity), manager);
    }

    function verifyStatus(address manager, string memory oppId) public {
        require(
            managerToOpportunity[manager][oppId] != address(0),
            "Opportunity does not exist"
        );
        Opportunity opportunity = Opportunity(
            managerToOpportunity[manager][oppId]
        );
        opportunity.verifyStatus();
    }

    function issueReward(
        address manager,
        string memory oppId,
        uint256 reward
    ) public returns (bool) {
        require(
            verifiedManagers[manager],
            "Only verified managers can issue rewards"
        );
        require(
            managerToOpportunity[manager][oppId] == msg.sender,
            "Opportunity does not belong to manager"
        );

        Opportunity opportunity = Opportunity(msg.sender);
        require(
            opportunity.verified(),
            "Opportunity must be verified before issuing reward"
        );
        require(
            opportunity.status() == 2, // Status.Won
            "Opportunity must be won before issuing reward"
        );

        require(
            address(this).balance >= reward,
            "Contract does not have enough balance to pay reward"
        );

        address mainWallet = _getManagerMainWallet(manager);
        // TODO: ccip with chain + currency config
        // safe transfer to manager address
        (bool success, ) = mainWallet.call{value: reward}("");
        require(success, "Transfer to mentor failed.");

        // emit event
        emit OppRewardPaid(reward, manager, mainWallet);

        return true;
    }
}
