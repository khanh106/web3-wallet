const { ethers } = require("hardhat");
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying contracts with account: ${deployer.address}`);
  console.log(`Account balance: ${(await ethers.provider.getBalance(deployer.address)).toString()}`);

  // Deploy KPAY token first
  console.log("Deploying KPAY token...");
  const Kpay = await ethers.getContractFactory("Kpay");
  const initialSupply = ethers.parseEther("1000000"); // 1 million tokens
  const kpayToken = await Kpay.deploy(initialSupply);
  await kpayToken.waitForDeployment();
  const kpayAddress = await kpayToken.getAddress();
  console.log(`✅ KPAY token deployed to: ${kpayAddress}`);

  // Deploy TokenFactory with KPAY token address
  console.log("Deploying TokenFactory...");
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy(kpayAddress);
  await tokenFactory.waitForDeployment();
  const factoryAddress = await tokenFactory.getAddress();
  console.log(`✅ TokenFactory deployed to: ${factoryAddress}`);

  // Verify contracts on Etherscan if not on local network
  if (process.env.NETWORK !== "localhost") {
    console.log("Waiting for block confirmations...");
    await tokenFactory.deploymentTransaction().wait(6);
    await kpayToken.deploymentTransaction().wait(6);

    console.log("Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: kpayAddress,
        constructorArguments: [initialSupply],
      });
      console.log("✅ KPAY token verified on Etherscan");

      await hre.run("verify:verify", {
        address: factoryAddress,
        constructorArguments: [kpayAddress],
      });
      console.log("✅ TokenFactory verified on Etherscan");
    } catch (error) {
      console.error("Error verifying contracts:", error);
    }
  }

  // Save deployment info
  const deploymentInfo = {
    network: process.env.NETWORK || "localhost",
    kpayToken: kpayAddress,
    tokenFactory: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
