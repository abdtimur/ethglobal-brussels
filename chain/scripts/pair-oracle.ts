import { ethers } from "hardhat";

async function readPrice() {
  const pairOracleAddress = "0xD8Db8E86351825Af6C8B69e89aaD2D4E72a441ed";
  const pairOracle = await ethers.getContractAt(
    "PairOracle",
    pairOracleAddress
  );

  const price = await pairOracle.tryRead();
  console.log("hasValue:", price[0]);
  console.log("price:", price[1].toString());
}

async function main() {
  console.log("Deploying contracts...");

  const CHRONICLE = "0xea347db6ef446e03745c441c17018ef3d641bc8f"; // ETH/USD Base Sepolia Oracle
  const SELF_KISSER = "0x70e58b7a1c884fffe7dbce5249337603a28b8422"; // self-kisser Base Sepolia Oracle

  const pairOracleFactory = await ethers.getContractFactory("PairOracle");
  const pairOracle = await (
    await pairOracleFactory.deploy(CHRONICLE, SELF_KISSER)
  ).waitForDeployment();

  console.log("PairOracle deployed to:", pairOracle.target);
}

readPrice().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
