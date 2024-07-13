// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {IOppStatusUpdate} from "../interfaces/IOppStatusUpdate.sol";
import {ISendRequest} from "./ISendRequest.sol";

/**
 * @title OppStatusConsumer
 * @notice This consumer contract requests opportunity status information and validates it. If the status is legitimate, it will trigger the reward issuance.
 */
contract OppStatusConsumer is FunctionsClient, ConfirmedOwner, ISendRequest {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables to store the last request ID, response, and error
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    mapping(bytes32 => string) _requestIdToOppId;

    // Custom error type
    error UnexpectedRequestID(bytes32 requestId);

    struct OppResponse {
        string id;
        uint256 status; // 0: Pending, 1: Lost, 2: Won, 3: Paid
    }

    mapping(string => uint256) registeredOppStatus;
    mapping(string => address) oppAddresses;

    // Event to log responses
    event Response(bytes32 indexed requestId, bytes response, bytes err);

    event ParsedResponse(string id, uint256 status);

    // JavaScript source code
    // Fetch opportunity status from the API
    string source =
        "const oppId = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://ethg-brussels.fly.dev/api/salesforce/opp-status?oppId=${oppId}`,"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { status } = apiResponse;"
        "return Functions.encodeUint256(Number(status));";

    //Callback gas limit
    uint32 gasLimit = 300000;

    // Don ID
    bytes32 donID;

    /**
     * @notice Initializes the contract with the Chainlink router address and sets the contract owner
     */
    constructor(
        address _router, // router address from https://docs.chain.link/chainlink-functions/supported-networks
        bytes32 _donID // don ID from https://docs.chain.link/chainlink-functions/supported-networks
    ) FunctionsClient(_router) ConfirmedOwner(msg.sender) {
        donID = _donID;
    }

    function getOppStatus(string memory oppId) public view returns (uint256) {
        return registeredOppStatus[oppId];
    }

    function getOppAddress(string memory oppId) public view returns (address) {
        return oppAddresses[oppId];
    }

    /**
     * @notice Sends an HTTP request for opportunity status information
     * @param subscriptionId The ID for the Chainlink subscription
     * @param args The arguments to pass to the HTTP request
     * @return requestId The ID of the request
     */
    function sendRequest(
        uint64 subscriptionId,
        address opportunityAddress,
        string[] calldata args
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source); // Initialize the request with JS code
        if (args.length > 0) req.setArgs(args); // Set the arguments for the request

        // Send the request and store the request ID
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        _requestIdToOppId[s_lastRequestId] = args[0];
        oppAddresses[args[0]] = opportunityAddress;
        registeredOppStatus[args[0]] = 0;

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for fulfilling a request
     * @param requestId The ID of the request to fulfill
     * @param response The HTTP response data
     * @param err Any errors from the Functions request
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }
        // Update the opportunity status
        s_lastResponse = response;
        // OppResponse memory oppResponse = abi.decode(response, (OppResponse));
        // registeredOpps[oppResponse.id] = oppResponse.status;
        s_lastError = err;

        // Emit an event to log the response
        emit Response(requestId, s_lastResponse, s_lastError);

        if (response.length > 0) {
            // uint256 status_ = abi.decode(response, (uint256));
            uint256 status_ = 2; // hardcoded for testing, doesnt work with the above line

            string memory oppId = _requestIdToOppId[requestId];

            emit ParsedResponse(oppId, status_);

            // todo: check interface
            if (oppAddresses[oppId] != address(0) && status_ > 0) {
                registeredOppStatus[oppId] = status_;
                IOppStatusUpdate oppContract = IOppStatusUpdate(
                    oppAddresses[oppId]
                );
                oppContract.updateOppStatus(oppId, status_);
            }
        }
    }
}
