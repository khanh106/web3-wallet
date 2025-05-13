const { ethers } = require("hardhat");

async function main() {
  // Địa chỉ contract KPAY đã deploy trên Sepolia
  const KPAY_ADDRESS = "0xa53bc774ED9Ddcc2996c63603E56c8EC11FE665B"; // <-- Thay bằng địa chỉ thật

  // Deploy NFTMarketplace
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy(KPAY_ADDRESS);

  await nftMarketplace.waitForDeployment();

  console.log("NFTMarketplace deployed to:", await nftMarketplace.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});