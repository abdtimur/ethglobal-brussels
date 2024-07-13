import { ethers, run } from "hardhat";

async function verify() {
  const contract = await ethers.getContractAt(
    "Opportunity",
    "0xA4893f000BB339610253D4948D65EED04087F783"
  );

  await run("verify:verify", {
    address: contract.target,
    constructorArguments: [
      "0x3C9Fd1778463066a8614B2B2F7CfBdf5491F4875",
      "0x63473e8eBDBe04fFa481D57663Bcf837E96d06eC",
      {
        id: "test-2",
        subject: "test-subj",
        amount: 1000000000000000000000n,
        rewardPercentage: 1n,
      },
      "0x83d8a1e16651e19BDA8F49CDac3893B58124fa22",
      "0xD8Db8E86351825Af6C8B69e89aaD2D4E72a441ed",
    ],
  });
  console.log("Verified!");
}

verify().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
