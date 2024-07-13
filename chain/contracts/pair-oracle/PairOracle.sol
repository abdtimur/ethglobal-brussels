// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPairOracle} from "../interfaces/IPairOracle.sol";

// Copied from [chronicle-std](https://github.com/chronicleprotocol/chronicle-std/blob/main/src/IChronicle.sol).
interface IChronicle is IPairOracle {
    /// @notice Returns the oracle's current value.
    /// @return isValid True if value exists, false otherwise.
    /// @return value The oracle's current value if it exists, zero otherwise.
    function tryRead() external view returns (bool isValid, uint value);
}

// Copied from [self-kisser](https://github.com/chronicleprotocol/self-kisser/blob/main/src/ISelfKisser.sol).
interface ISelfKisser {
    /// @notice Kisses caller on oracle `oracle`.
    function selfKiss(address oracle) external;
}

contract PairOracle {
    ///  @notice The Chronicle ETH/USD oracle.
    IChronicle public immutable chronicle;

    /// @notice The SelfKisser granting access to Chronicle oracles.
    ISelfKisser public immutable selfKisser;

    constructor(address chronicle_, address selfKisser_) {
        chronicle = IChronicle(chronicle_);
        selfKisser = ISelfKisser(selfKisser_);

        // Note to add address(this) to chronicle oracle's whitelist.
        // This allows the contract to read from the chronicle oracle.
        selfKisser.selfKiss(address(chronicle));
    }

    /// @notice Function to read the latest data from the Chronicle oracle.
    /// @return isValid True if value exists, false otherwise.
    /// @return value The oracle's current value if it exists, zero otherwise.
    function tryRead() external view returns (bool isValid, uint value) {
        return chronicle.tryRead();
    }
}
