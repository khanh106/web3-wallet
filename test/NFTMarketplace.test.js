const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  let NFTMarketplace, nftMarketplace;
  let Kpay, kpay;
  let owner, seller, buyer, user;
  let tokenId;
  const TOKEN_URI = "https://example.com/nft";
  const LISTING_PRICE = ethers.parseEther("1"); // 1 KPAY
  const INITIAL_SUPPLY = ethers.parseEther("10000"); // 10000 KPAY

  beforeEach(async function () {
    [owner, seller, buyer, user] = await ethers.getSigners();

    // Deploy KPAY token
    Kpay = await ethers.getContractFactory("Kpay");
    kpay = await Kpay.deploy(INITIAL_SUPPLY);
    await kpay.waitForDeployment();

    // Deploy NFTMarketplace
    NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy(await kpay.getAddress());
    await nftMarketplace.waitForDeployment();

    // Transfer some KPAY to buyer for testing
    await kpay.transfer(buyer.address, ethers.parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMarketplace.owner()).to.equal(owner.address);
    });

    it("Should set the right KPAY token address", async function () {
      expect(await nftMarketplace.kpayToken()).to.equal(await kpay.getAddress());
    });
  });

  describe("NFT Creation", function () {
    it("Should create NFT with correct URI", async function () {
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      tokenId = event.args[2];

      expect(await nftMarketplace.ownerOf(tokenId)).to.equal(owner.address);
      expect(await nftMarketplace.tokenURI(tokenId)).to.equal(TOKEN_URI);
    });

    it("Should not create NFT with empty URI", async function () {
      await expect(nftMarketplace.createNFT(""))
        .to.be.revertedWith("Empty token URI");
    });

    it("Should increment tokenId correctly", async function () {
      const tx1 = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      const tokenId1 = event1.args[2];

      const tx2 = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      const tokenId2 = event2.args[2];

      expect(tokenId2).to.equal(tokenId1 + 1n);
    });
  });

  describe("NFT Listing", function () {
    beforeEach(async function () {
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      tokenId = event.args[2];
    });

    it("Should list NFT with correct price", async function () {
      await nftMarketplace.listItem(tokenId, LISTING_PRICE);

      const listing = await nftMarketplace.nftListings(tokenId);
      expect(listing.seller).to.equal(owner.address);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.isListed).to.equal(true);
    });

    it("Should emit NFTListed event", async function () {
      await expect(nftMarketplace.listItem(tokenId, LISTING_PRICE))
        .to.emit(nftMarketplace, "NFTListed")
        .withArgs(tokenId, owner.address, LISTING_PRICE);
    });

    it("Should not allow non-owner to list NFT", async function () {
      await expect(nftMarketplace.connect(seller).listItem(tokenId, LISTING_PRICE))
        .to.be.revertedWith("Not owner");
    });

    it("Should not allow listing with zero price", async function () {
      await expect(nftMarketplace.listItem(tokenId, 0))
        .to.be.revertedWith("Price must be > 0");
    });

    it("Should not allow listing already listed NFT", async function () {
      await nftMarketplace.listItem(tokenId, LISTING_PRICE);
      await expect(nftMarketplace.listItem(tokenId, LISTING_PRICE))
        .to.be.revertedWith("Already listed");
    });
  });

  describe("NFT Buying", function () {
    beforeEach(async function () {
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      tokenId = event.args[2];
      await nftMarketplace.listItem(tokenId, LISTING_PRICE);
    });

    it("Should allow buying a listed NFT", async function () {
      await kpay.connect(buyer).approve(await nftMarketplace.getAddress(), LISTING_PRICE);
      await nftMarketplace.connect(buyer).buyNFT(tokenId);

      expect(await nftMarketplace.ownerOf(tokenId)).to.equal(buyer.address);
      const listing = await nftMarketplace.nftListings(tokenId);
      expect(listing.isListed).to.equal(false);
    });

    it("Should emit NFTSold event", async function () {
      await kpay.connect(buyer).approve(await nftMarketplace.getAddress(), LISTING_PRICE);
      await expect(nftMarketplace.connect(buyer).buyNFT(tokenId))
        .to.emit(nftMarketplace, "NFTSold")
        .withArgs(tokenId, owner.address, buyer.address, LISTING_PRICE);
    });

    it("Should not allow buying with insufficient allowance", async function () {
      await expect(nftMarketplace.connect(buyer).buyNFT(tokenId))
        .to.be.revertedWith("Insufficient allowance");
    });

    it("Should not allow buying unlisted NFT", async function () {
      await nftMarketplace.cancelListing(tokenId);
      await kpay.connect(buyer).approve(await nftMarketplace.getAddress(), LISTING_PRICE);
      await expect(nftMarketplace.connect(buyer).buyNFT(tokenId))
        .to.be.revertedWith("Not listed");
    });
  });

  describe("Listing Management", function () {
    beforeEach(async function () {
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      tokenId = event.args[2];
      await nftMarketplace.listItem(tokenId, LISTING_PRICE);
    });

    it("Should allow seller to cancel listing", async function () {
      await nftMarketplace.cancelListing(tokenId);
      const listing = await nftMarketplace.nftListings(tokenId);
      expect(listing.isListed).to.equal(false);
    });

    it("Should emit NFTListingCancelled event", async function () {
      await expect(nftMarketplace.cancelListing(tokenId))
        .to.emit(nftMarketplace, "NFTListingCancelled")
        .withArgs(tokenId, owner.address);
    });

    it("Should not allow non-seller to cancel listing", async function () {
      await expect(nftMarketplace.connect(buyer).cancelListing(tokenId))
        .to.be.revertedWith("Not owner");
    });

    it("Should allow seller to update price", async function () {
      const newPrice = ethers.parseEther("2");
      await nftMarketplace.updateListingPrice(tokenId, newPrice);
      const listing = await nftMarketplace.nftListings(tokenId);
      expect(listing.price).to.equal(newPrice);
    });

    it("Should emit NFTPriceUpdated event", async function () {
      const newPrice = ethers.parseEther("2");
      await expect(nftMarketplace.updateListingPrice(tokenId, newPrice))
        .to.emit(nftMarketplace, "NFTPriceUpdated")
        .withArgs(tokenId, owner.address, newPrice);
    });

    it("Should not allow non-seller to update price", async function () {
      const newPrice = ethers.parseEther("2");
      await expect(nftMarketplace.connect(buyer).updateListingPrice(tokenId, newPrice))
        .to.be.revertedWith("Not owner");
    });
  });

  describe("Pausable", function () {
    beforeEach(async function () {
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      tokenId = event.args[2];
    });

    it("Should allow owner to pause and unpause", async function () {
      await nftMarketplace.pause();
      await expect(nftMarketplace.createNFT(TOKEN_URI))
        .to.be.revertedWithCustomError(nftMarketplace, "EnforcedPause");

      await nftMarketplace.unpause();
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      expect(event).to.not.be.undefined;
    });

    it("Should not allow non-owner to pause", async function () {
      await expect(nftMarketplace.connect(buyer).pause())
        .to.be.revertedWithCustomError(nftMarketplace, "OwnableUnauthorizedAccount");
    });
  });

  describe("KPAY Withdrawal", function () {
    it("Should allow owner to withdraw KPAY", async function () {
      // First create and sell an NFT to get some KPAY in the contract
      const tx = await nftMarketplace.createNFT(TOKEN_URI);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'Transfer');
      const newTokenId = event.args[2];
      
      await nftMarketplace.listItem(newTokenId, LISTING_PRICE);
      await kpay.connect(buyer).approve(await nftMarketplace.getAddress(), LISTING_PRICE);
      await nftMarketplace.connect(buyer).buyNFT(newTokenId);

      const balance = await kpay.balanceOf(await nftMarketplace.getAddress());
      await nftMarketplace.withdrawKpay(balance);
      expect(await kpay.balanceOf(await nftMarketplace.getAddress())).to.equal(0);
    });

    it("Should not allow non-owner to withdraw KPAY", async function () {
      await expect(nftMarketplace.connect(buyer).withdrawKpay(100))
        .to.be.revertedWithCustomError(nftMarketplace, "OwnableUnauthorizedAccount");
    });
  });
});
