const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AutomatedTokenPurchase", function () {
  let AutomatedTokenPurchase, automatedTokenPurchase;
  let Kpay, kpay;
  let owner, buyer;
  let tokenAddress;

  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();

    Kpay = await ethers.getContractFactory("Kpay");
    kpay = await Kpay.deploy(10000);
    await kpay.waitForDeployment();

    AutomatedTokenPurchase = await ethers.getContractFactory("AutomatedTokenPurchase");
    automatedTokenPurchase = await AutomatedTokenPurchase.deploy(kpay.target);
    await automatedTokenPurchase.waitForDeployment();

    // Deploy a test token
    const TestToken = await ethers.getContractFactory("Kpay");
    const testToken = await TestToken.deploy(10000);
    await testToken.waitForDeployment();
    tokenAddress = testToken.target;
  });

  it("Should create and cancel a purchase order", async function () {
    const purchaseInterval = 3600; // 1 hour
    const kpayAmount = 100;

    await automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount);

    const order = await automatedTokenPurchase.purchaseOrders(owner.address);
    expect(order.tokenAddress).to.equal(tokenAddress);
    expect(order.purchaseInterval).to.equal(purchaseInterval);
    expect(order.kpayAmount).to.equal(kpayAmount);

    await automatedTokenPurchase.cancelPurchaseOrder();

    const cancelledOrder = await automatedTokenPurchase.purchaseOrders(owner.address);
    expect(cancelledOrder.tokenAddress).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should not allow non-owner to create purchase order", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 100;

    await expect(
      automatedTokenPurchase.connect(buyer).createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should not allow creating purchase order with zero amount", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 0;

    await expect(
      automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount)
    ).to.be.revertedWith("Kpay amount must be greater than 0");
  });

  it("Should not allow creating purchase order with zero interval", async function () {
    const purchaseInterval = 0;
    const kpayAmount = 100;

    await expect(
      automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount)
    ).to.be.revertedWith("Purchase interval must be greater than 0");
  });

  it("Should emit events correctly", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 100;

    await expect(automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount))
      .to.emit(automatedTokenPurchase, "OrderCreated")
      .withArgs(owner.address, tokenAddress, purchaseInterval, kpayAmount);

    await expect(automatedTokenPurchase.cancelPurchaseOrder())
      .to.emit(automatedTokenPurchase, "OrderCancelled")
      .withArgs(owner.address);
  });

  it("Should execute purchase when conditions are met", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 100;

    // Create purchase order
    await automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount);

    // Approve Kpay spending
    await kpay.approve(automatedTokenPurchase.target, kpayAmount);

    // Execute purchase
    await expect(automatedTokenPurchase.executePurchase())
      .to.emit(automatedTokenPurchase, "PurchaseExecuted")
      .withArgs(owner.address, kpayAmount);
  });

  it("Should not allow executing purchase without sufficient balance", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 1000000; // More than owner's balance

    await automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount);
    await kpay.approve(automatedTokenPurchase.target, kpayAmount);

    await expect(
      automatedTokenPurchase.executePurchase()
    ).to.be.revertedWith("Insufficient KPAY balance");
  });

  it("Should allow owner to withdraw tokens", async function () {
    const purchaseInterval = 3600;
    const kpayAmount = 100;

    // Create and execute a purchase to get some tokens in the contract
    await automatedTokenPurchase.createPurchaseOrder(tokenAddress, purchaseInterval, kpayAmount);
    await kpay.approve(automatedTokenPurchase.target, kpayAmount);
    await automatedTokenPurchase.executePurchase();

    // Withdraw tokens
    await automatedTokenPurchase.withdrawTokens(kpay, kpayAmount);
    expect(await kpay.balanceOf(owner.address)).to.equal(10000); // Back to initial balance
  });

  it("Should not allow non-owner to withdraw tokens", async function () {
    await expect(
      automatedTokenPurchase.connect(buyer).withdrawTokens(kpay, 100)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
