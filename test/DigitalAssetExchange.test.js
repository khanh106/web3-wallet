const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DigitalAssetExchange", function () {
  let DigitalAssetExchange, digitalAssetExchange;
  let Kpay, kpay;
  let owner, seller, buyer;
  let listingId;

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    Kpay = await ethers.getContractFactory("Kpay");
    kpay = await Kpay.deploy(10000);
    await kpay.waitForDeployment();

    DigitalAssetExchange = await ethers.getContractFactory("DigitalAssetExchange");
    digitalAssetExchange = await DigitalAssetExchange.deploy(kpay.target);
    await digitalAssetExchange.waitForDeployment();

    // Mint some Kpay for testing
    await kpay.transfer(seller.address, 1000);
    await kpay.transfer(buyer.address, 1000);
  });

  it("Should list and buy a digital asset", async function () {
    const assetLink = "https://example.com/asset";
    const price = 100;

    await digitalAssetExchange.connect(seller).listItem(assetLink, price);
    listingId = 1;

    await kpay.connect(buyer).approve(digitalAssetExchange.target, price);
    await digitalAssetExchange.connect(buyer).buyAsset(listingId);

    expect(await digitalAssetExchange.assetListings(listingId).isListed).to.equal(false);
    expect(await kpay.balanceOf(seller.address)).to.equal(1100); // 1000 + 100
    expect(await kpay.balanceOf(buyer.address)).to.equal(900); // 1000 - 100
  });

  it("Should not allow buying an unlisted asset", async function () {
    await kpay.connect(buyer).approve(digitalAssetExchange.target, 100);
    
    await expect(
      digitalAssetExchange.connect(buyer).buyAsset(1)
    ).to.be.revertedWith("Asset is not listed");
  });

  it("Should not allow buying with insufficient balance", async function () {
    const assetLink = "https://example.com/asset";
    const price = 2000; // More than buyer's balance

    await digitalAssetExchange.connect(seller).listItem(assetLink, price);
    
    await kpay.connect(buyer).approve(digitalAssetExchange.target, price);
    
    await expect(
      digitalAssetExchange.connect(buyer).buyAsset(1)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Should allow owner to withdraw Kpay", async function () {
    // First list and buy an asset to get some Kpay in the contract
    const assetLink = "https://example.com/asset";
    const price = 100;

    await digitalAssetExchange.connect(seller).listItem(assetLink, price);
    await kpay.connect(buyer).approve(digitalAssetExchange.target, price);
    await digitalAssetExchange.connect(buyer).buyAsset(1);

    // Now withdraw the Kpay
    await digitalAssetExchange.withdrawKpay(price);
    expect(await kpay.balanceOf(owner.address)).to.equal(10000 + price);
  });

  it("Should not allow non-owner to withdraw Kpay", async function () {
    await expect(
      digitalAssetExchange.connect(buyer).withdrawKpay(100)
    ).to.be.revertedWith("Only owner can withdraw");
  });

  it("Should track listing count correctly", async function () {
    const assetLink = "https://example.com/asset";
    const price = 100;

    await digitalAssetExchange.connect(seller).listItem(assetLink, price);
    expect(await digitalAssetExchange.listingCount()).to.equal(1);

    await digitalAssetExchange.connect(seller).listItem(assetLink, price);
    expect(await digitalAssetExchange.listingCount()).to.equal(2);
  });
});
