import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  const CONSUMER = "0x8A83928b176F3a0c1BE79b3215906F05b47dcE47";
  const PAIR_ORACLE = "0xD8Db8E86351825Af6C8B69e89aaD2D4E72a441ed";

  const factory = await ethers.getContractFactory("Factory");
  const factoryContract = await (
    await factory.deploy(CONSUMER, PAIR_ORACLE)
  ).waitForDeployment();

  console.log("Factory deployed to:", factoryContract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
