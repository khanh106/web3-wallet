const { ethers } = require("hardhat");

async function main() {
  // 1. Cấu hình thông số
  const TOKEN_NAME = "Kpay Token";
  const TOKEN_SYMBOL = "KPAY";
  const FULL_SUPPLY = ethers.parseUnits("100000000", 18); // 100 triệu token

  console.log(
    `🚀 Deploying ${TOKEN_NAME} (${TOKEN_SYMBOL}) with supply: ${ethers.formatUnits(
      FULL_SUPPLY
    )} tokens`
  );

  // 2. Kiểm tra balance trước khi deploy
  const [deployer] = await ethers.getSigners();
  console.log(`👷 Deployer address: ${deployer.address}`);
  console.log(
    `💼 Deployer balance: ${ethers.formatEther(
      await ethers.provider.getBalance(deployer.address)
    )} ETH`
  );

  // 3. Triển khai contract
  const Kpay = await ethers.getContractFactory("Kpay");
  console.log("⏳ Deploying contract...");

  const kpay = await Kpay.deploy(FULL_SUPPLY);
  await kpay.waitForDeployment();

  // 4. Xác minh thông tin sau deploy
  const contractAddress = await kpay.getAddress();
  console.log("✅ Contract deployed!");
  console.log("📌 Contract address:", contractAddress);
  console.log("📜 Transaction hash:", kpay.deploymentTransaction().hash);

  // 5. Kiểm tra thông số contract
  console.log(`🔢 Token name: ${await kpay.name()}`);
  console.log(`🔣 Token symbol: ${await kpay.symbol()}`);
  console.log(
    `💰 Total supply: ${ethers.formatUnits(
      await kpay.totalSupply()
    )} ${TOKEN_SYMBOL}`
  );
  console.log(
    `🏦 Deployer balance: ${ethers.formatUnits(
      await kpay.balanceOf(deployer.address)
    )} ${TOKEN_SYMBOL}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
