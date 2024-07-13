import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",

  networks: {
    hardhat: {},
    localhost: {
      url: "http://localhost:8545",
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL,
      accounts: [process.env.KEY_TESTIK!],
    },
  },
  etherscan: {
    apiKey: {
      // Is not required by blockscout. Can be any non-empty string
      baseSepolia: "abc",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com/",
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};

export default config;
