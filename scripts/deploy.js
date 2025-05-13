const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );

  const Kpay = await hre.ethers.getContractFactory("Kpay");
  const kpay = await Kpay.deploy(10000);
  await kpay.waitForDeployment();

  console.log("Kpay deployed to:", kpay.target);

  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  //const tokenFactory = await TokenFactory.deploy();
  //await tokenFactory.waitForDeployment();

  //console.log("TokenFactory deployed to:", tokenFactory.target);

  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  //const nftMarketplace = await NFTMarketplace.deploy(kpay.target);
  //await nftMarketplace.waitForDeployment();

  //console.log("NFTMarketplace deployed to:", nftMarketplace.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
