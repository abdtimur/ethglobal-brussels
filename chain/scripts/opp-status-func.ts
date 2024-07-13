import { ethers } from "hardhat";

async function sendRequest() {
  const oppStatusConsumer = await ethers.getContractAt(
    "OppStatusConsumer",
    "0x2452e61Ce7a53A93720E830be8Be222af7C3D95b"
  );

  const oppAddress = "0x34082B2978b2599a90240Ce14F2096E529E74144";
  const oppId = "opp12345";

  const tx = await oppStatusConsumer.sendRequest(129, oppAddress, [oppId]);

  console.log("Transaction sent:", tx.hash);

  await tx.wait();

  const checkStatus = await oppStatusConsumer.getOppStatus("opp1234");

  console.log("Opp status:", checkStatus);
}

async function main() {
  console.log("Deploying contracts...");

  const ROUTER = "0xf9B8fc078197181C841c296C876945aaa425B278"; // Base Sepolia Router
  const DON_ID =
    "0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000"; // fun-base-sepolia-1

  const oppStatusFactory = await ethers.getContractFactory("OppStatusConsumer");
  const oppStatusConsumer = await (
    await oppStatusFactory.deploy(ROUTER, DON_ID)
  ).waitForDeployment();

  console.log("OppStatus deployed to:", oppStatusConsumer.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
