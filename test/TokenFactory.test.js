const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactory", function () {
  let TokenFactory;
  let KpayToken;
  let tokenFactory;
  let kpayToken;
  let owner;
  let user1;
  let user2;
  let user3;

  const CREATION_FEE = ethers.parseEther("100"); // 100 KPAY tokens
  const INITIAL_KPAY_SUPPLY = ethers.parseEther("1000000"); // 1 million KPAY tokens
  const USER_KPAY_AMOUNT = ethers.parseEther("1000"); // 1000 KPAY tokens per user

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy KPAY token
    KpayToken = await ethers.getContractFactory("Kpay");
    kpayToken = await KpayToken.deploy(INITIAL_KPAY_SUPPLY);
    await kpayToken.waitForDeployment();

    // Deploy TokenFactory with KPAY token address
    TokenFactory = await ethers.getContractFactory("TokenFactory");
    tokenFactory = await TokenFactory.deploy(await kpayToken.getAddress());
    await tokenFactory.waitForDeployment();

    // Mint KPAY tokens to users for testing
    await kpayToken.mint(user1.address, USER_KPAY_AMOUNT);
    await kpayToken.mint(user2.address, USER_KPAY_AMOUNT);
    await kpayToken.mint(user3.address, USER_KPAY_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tokenFactory.owner()).to.equal(owner.address);
    });

    it("Should set the correct KPAY token address", async function () {
      expect(await tokenFactory.kpayToken()).to.equal(await kpayToken.getAddress());
    });

    it("Should have the correct creation fee", async function () {
      expect(await tokenFactory.CREATION_FEE()).to.equal(CREATION_FEE);
    });

    it("Should start with empty token lists", async function () {
      expect(await tokenFactory.getAllTokens()).to.deep.equal([]);
      expect(await tokenFactory.getUserTokenCount(user1.address)).to.equal(0);
      expect(await tokenFactory.getUserTokens(user1.address)).to.deep.equal([]);
    });
  });

  describe("Token Creation", function () {
    const tokenName = "Test Token";
    const tokenSymbol = "TEST";
    const initialSupply = ethers.parseEther("1000000");

    beforeEach(async function () {
      // Approve TokenFactory to spend KPAY tokens for user1
      await kpayToken.connect(user1).approve(await tokenFactory.getAddress(), CREATION_FEE);
    });

    it("Should create a new token when fee is paid", async function () {
      // Create token
      const tx = await tokenFactory.connect(user1).createToken(tokenName, tokenSymbol, initialSupply);
      const receipt = await tx.wait();
      
      // Get the token address from the event
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'TokenCreated');
      const tokenAddress = event.args.tokenAddress;

      // Verify event data
      expect(event.args.name).to.equal(tokenName);
      expect(event.args.symbol).to.equal(tokenSymbol);
      expect(event.args.initialSupply).to.equal(initialSupply);
      expect(event.args.creator).to.equal(user1.address);

      // Check KPAY balance of TokenFactory
      expect(await kpayToken.balanceOf(await tokenFactory.getAddress())).to.equal(CREATION_FEE);

      // Verify the created token
      const ERC20Token = await ethers.getContractFactory("ERC20Token");
      const token = await ERC20Token.attach(tokenAddress);
      expect(await token.name()).to.equal(tokenName);
      expect(await token.symbol()).to.equal(tokenSymbol);
      expect(await token.balanceOf(user1.address)).to.equal(initialSupply);

      // Verify token tracking
      expect(await tokenFactory.getUserTokenCount(user1.address)).to.equal(1);
      expect(await tokenFactory.getAllTokens()).to.deep.equal([tokenAddress]);
      expect(await tokenFactory.getUserTokens(user1.address)).to.deep.equal([tokenAddress]);
    });

    it("Should fail if user doesn't have enough KPAY tokens", async function () {
      // Try to create token without approving KPAY tokens
      await expect(tokenFactory.connect(user2).createToken(tokenName, tokenSymbol, initialSupply))
        .to.be.revertedWithCustomError(kpayToken, "ERC20InsufficientAllowance");
    });

    it("Should fail if user doesn't approve enough KPAY tokens", async function () {
      // Approve less than required amount
      await kpayToken.connect(user2).approve(await tokenFactory.getAddress(), ethers.parseEther("50"));
      
      await expect(tokenFactory.connect(user2).createToken(tokenName, tokenSymbol, initialSupply))
        .to.be.revertedWithCustomError(kpayToken, "ERC20InsufficientAllowance");
    });

    it("Should track multiple tokens created by different users", async function () {
      // Approve for user2
      await kpayToken.connect(user2).approve(await tokenFactory.getAddress(), CREATION_FEE);

      // Create token with user1
      const tx1 = await tokenFactory.connect(user1).createToken("Token1", "TK1", initialSupply);
      const receipt1 = await tx1.wait();
      const token1Address = receipt1.logs.find(log => log.fragment && log.fragment.name === 'TokenCreated').args.tokenAddress;

      // Create token with user2
      const tx2 = await tokenFactory.connect(user2).createToken("Token2", "TK2", initialSupply);
      const receipt2 = await tx2.wait();
      const token2Address = receipt2.logs.find(log => log.fragment && log.fragment.name === 'TokenCreated').args.tokenAddress;

      // Verify token tracking
      expect(await tokenFactory.getUserTokenCount(user1.address)).to.equal(1);
      expect(await tokenFactory.getUserTokenCount(user2.address)).to.equal(1);
      expect(await tokenFactory.getAllTokens()).to.deep.equal([token1Address, token2Address]);
      expect(await tokenFactory.getUserTokens(user1.address)).to.deep.equal([token1Address]);
      expect(await tokenFactory.getUserTokens(user2.address)).to.deep.equal([token2Address]);
    });

    it("Should track multiple tokens created by same user", async function () {
      // Approve for multiple tokens
      await kpayToken.connect(user1).approve(await tokenFactory.getAddress(), CREATION_FEE * 2n);

      // Create first token
      const tx1 = await tokenFactory.connect(user1).createToken("Token1", "TK1", initialSupply);
      const receipt1 = await tx1.wait();
      const token1Address = receipt1.logs.find(log => log.fragment && log.fragment.name === 'TokenCreated').args.tokenAddress;

      // Create second token
      const tx2 = await tokenFactory.connect(user1).createToken("Token2", "TK2", initialSupply);
      const receipt2 = await tx2.wait();
      const token2Address = receipt2.logs.find(log => log.fragment && log.fragment.name === 'TokenCreated').args.tokenAddress;

      // Verify token tracking
      expect(await tokenFactory.getUserTokenCount(user1.address)).to.equal(2);
      expect(await tokenFactory.getAllTokens()).to.deep.equal([token1Address, token2Address]);
      expect(await tokenFactory.getUserTokens(user1.address)).to.deep.equal([token1Address, token2Address]);
    });
  });

  describe("Fee Management", function () {
    beforeEach(async function () {
      // Create a token to generate some fees
      await kpayToken.connect(user1).approve(await tokenFactory.getAddress(), CREATION_FEE);
      await tokenFactory.connect(user1).createToken("Test", "TEST", ethers.parseEther("1000000"));
    });

    it("Should allow owner to withdraw fees", async function () {
      // Get initial balances
      const initialOwnerBalance = await kpayToken.balanceOf(owner.address);
      const initialContractBalance = await kpayToken.balanceOf(await tokenFactory.getAddress());

      // Withdraw fees
      await tokenFactory.withdrawFees();

      // Check balances after withdrawal
      expect(await kpayToken.balanceOf(await tokenFactory.getAddress())).to.equal(0);
      expect(await kpayToken.balanceOf(owner.address)).to.equal(initialOwnerBalance + initialContractBalance);
    });

    it("Should not allow non-owner to withdraw fees", async function () {
      await expect(tokenFactory.connect(user1).withdrawFees())
        .to.be.revertedWithCustomError(tokenFactory, "OwnableUnauthorizedAccount");
    });

    it("Should fail to withdraw when no fees available", async function () {
      // First withdraw all fees
      await tokenFactory.withdrawFees();
      
      // Try to withdraw again
      await expect(tokenFactory.withdrawFees())
        .to.be.revertedWith("No fees to withdraw");
    });
  });

  describe("KPAY Token Management", function () {
    it("Should allow owner to update KPAY token address", async function () {
      // Deploy new KPAY token
      const newKpayToken = await KpayToken.deploy(INITIAL_KPAY_SUPPLY);
      await newKpayToken.waitForDeployment();

      // Update KPAY token address
      await tokenFactory.setKpayToken(await newKpayToken.getAddress());

      // Verify new address
      expect(await tokenFactory.kpayToken()).to.equal(await newKpayToken.getAddress());
    });

    it("Should not allow non-owner to update KPAY token address", async function () {
      const newKpayToken = await KpayToken.deploy(INITIAL_KPAY_SUPPLY);
      await newKpayToken.waitForDeployment();

      await expect(tokenFactory.connect(user1).setKpayToken(await newKpayToken.getAddress()))
        .to.be.revertedWithCustomError(tokenFactory, "OwnableUnauthorizedAccount");
    });
  });
});
