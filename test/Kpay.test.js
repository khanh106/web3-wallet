const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Kpay", function () {
  let Kpay, kpay;
  let owner, addr1, addr2;
  const initialSupply = 1000000;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    Kpay = await ethers.getContractFactory("Kpay");
    kpay = await Kpay.deploy(initialSupply);
    await kpay.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await kpay.owner()).to.equal(owner.address);
  });

  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await kpay.balanceOf(owner.address);
    expect(await kpay.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    await kpay.transfer(addr1.address, 50);
    const addr1Balance = await kpay.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(50);

    await kpay.connect(addr1).transfer(addr2.address, 50);
    const addr2Balance = await kpay.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const initialOwnerBalance = await kpay.balanceOf(owner.address);

    await expect(
      kpay.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWithCustomError(kpay, "ERC20InsufficientBalance");

    expect(await kpay.balanceOf(owner.address)).to.equal(initialOwnerBalance);
  });

  it("Should update balances after transfers", async function () {
    const initialOwnerBalance = await kpay.balanceOf(owner.address);

    await kpay.transfer(addr1.address, 100);
    await kpay.transfer(addr2.address, 50);

    const finalOwnerBalance = await kpay.balanceOf(owner.address);
    expect(Number(finalOwnerBalance)).to.equal(Number(initialOwnerBalance) - 150);

    const addr1Balance = await kpay.balanceOf(addr1.address);
    expect(Number(addr1Balance)).to.equal(100);

    const addr2Balance = await kpay.balanceOf(addr2.address);
    expect(Number(addr2Balance)).to.equal(50);
  });

  it("Should allow owner to mint new tokens", async function () {
    await kpay.mint(addr1.address, 1000);
    expect(await kpay.balanceOf(addr1.address)).to.equal(1000);
  });

  it("Should not allow non-owner to mint tokens", async function () {
    await expect(
      kpay.connect(addr1).mint(addr1.address, 1000)
    ).to.be.revertedWithCustomError(kpay, "OwnableUnauthorizedAccount");
  });

  it("Should allow owner to burn tokens", async function () {
    await kpay.transfer(addr1.address, 1000);
    await kpay.connect(addr1).burn(500);
    expect(await kpay.balanceOf(addr1.address)).to.equal(500);
  });

  it("Should not allow burning more tokens than balance", async function () {
    await kpay.transfer(addr1.address, 1000);
    await expect(
      kpay.connect(addr1).burn(1500)
    ).to.be.revertedWithCustomError(kpay, "ERC20InsufficientBalance");
  });

  it("Should approve other address to spend tokens", async function () {
    await kpay.approve(addr1.address, 100);
    const allowance = await kpay.allowance(owner.address, addr1.address);
    expect(allowance).to.equal(100);
  });

  it("Should transfer tokens from one account to another using transferFrom", async function () {
    await kpay.approve(addr1.address, 100);
    await kpay.connect(addr1).transferFrom(owner.address, addr2.address, 50);
    const addr2Balance = await kpay.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
    const allowance = await kpay.allowance(owner.address, addr1.address);
    expect(allowance).to.equal(50);
  });

  it("Should not allow transferFrom if not enough allowance", async function () {
    await kpay.approve(addr1.address, 50);
    await expect(
      kpay.connect(addr1).transferFrom(owner.address, addr2.address, 100)
    ).to.be.revertedWithCustomError(kpay, "ERC20InsufficientAllowance");
  });

  it("Should emit Transfer event on transfer", async function () {
    await expect(kpay.transfer(addr1.address, 50))
      .to.emit(kpay, "Transfer")
      .withArgs(owner.address, addr1.address, 50);
  });

  it("Should emit Approval event on approve", async function () {
    await expect(kpay.approve(addr1.address, 100))
      .to.emit(kpay, "Approval")
      .withArgs(owner.address, addr1.address, 100);
  });

  it("Should emit Transfer event on mint", async function () {
    await expect(kpay.mint(addr1.address, 1000))
      .to.emit(kpay, "Transfer")
      .withArgs(ethers.ZeroAddress, addr1.address, 1000);
  });

  it("Should emit Transfer event on burn", async function () {
    await kpay.transfer(addr1.address, 1000);
    await expect(kpay.connect(addr1).burn(500))
      .to.emit(kpay, "Transfer")
      .withArgs(addr1.address, ethers.ZeroAddress, 500);
  });
});
