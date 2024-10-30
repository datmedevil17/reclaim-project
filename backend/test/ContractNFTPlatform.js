const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractNFTPlatform", function () {
  let ContractNFTPlatform;
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy contract before each test
    ContractNFTPlatform = await ethers.getContractFactory("ContractNFTPlatform");
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await ContractNFTPlatform.deploy();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize nextTokenId to 0", async function () {
      expect(await contract.nextTokenId()).to.equal(0);
    });
  });

  describe("Minting NFTs", function () {
    it("Should mint a new NFT and update contract details", async function () {
      const name = "Test Contract";
      const description = "This is a test contract";
      const ipfsUrl = "ipfs://test-ipfs-url";

      // Mint a new contract NFT
      await contract.connect(addr1).mintContractNFT(name, description, ipfsUrl);

      // Check token details
      const nftDetails = await contract.getContractNFT(0);
      expect(nftDetails.tokenId).to.equal(0);
      expect(nftDetails.name).to.equal(name);
      expect(nftDetails.description).to.equal(description);
      expect(nftDetails.ipfsUrl).to.equal(ipfsUrl);
      expect(nftDetails.owner).to.equal(addr1.address);

      // Check that nextTokenId has incremented
      expect(await contract.nextTokenId()).to.equal(1);
    });

    it("Should emit ContractMinted event on minting", async function () {
      const name = "Test Contract";
      const description = "This is a test contract";
      const ipfsUrl = "ipfs://test-ipfs-url";

      await expect(contract.connect(addr1).mintContractNFT(name, description, ipfsUrl))
        .to.emit(contract, "ContractMinted")
        .withArgs(0, addr1.address, ipfsUrl);
    });
  });

  describe("Donating and Downloading", function () {
    beforeEach(async function () {
      // Mint an NFT before donation tests
      await contract.connect(addr1).mintContractNFT("Test Contract", "This is a test contract", "ipfs://test-ipfs-url");
    });

    it("Should allow donation and increase total donations", async function () {
      const donationAmount = ethers.parseEther("1.0"); // 1 ETH donation

      // Donate and check if donation increases
      await contract.connect(addr2).donateAndDownload(0, { value: donationAmount });
      const nftDetails = await contract.getContractNFT(0);
      expect(nftDetails.totalDonations).to.equal(donationAmount);
    });

    it("Should emit DonationReceived event on donation", async function () {
      const donationAmount = ethers.parseEther("1.0"); // 1 ETH donation

      await expect(contract.connect(addr2).donateAndDownload(0, { value: donationAmount }))
        .to.emit(contract, "DonationReceived")
        .withArgs(0, addr2.address, donationAmount);
    });

    it("Should revert if donation is zero", async function () {
      await expect(contract.connect(addr2).donateAndDownload(0, { value: 0 }))
        .to.be.revertedWith("Donation must be greater than zero");
    });

    it("Should revert if tokenId does not exist", async function () {
      await expect(contract.connect(addr2).donateAndDownload(1, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("NFT does not exist");
    });
  });

  describe("Getting Contract NFT Details", function () {
    beforeEach(async function () {
      // Mint an NFT before checking details
      await contract.connect(addr1).mintContractNFT("Test Contract", "This is a test contract", "ipfs://test-ipfs-url");
    });

    it("Should return the correct NFT details", async function () {
      const nftDetails = await contract.getContractNFT(0);
      expect(nftDetails.tokenId).to.equal(0);
      expect(nftDetails.name).to.equal("Test Contract");
      expect(nftDetails.description).to.equal("This is a test contract");
      expect(nftDetails.ipfsUrl).to.equal("ipfs://test-ipfs-url");
      expect(nftDetails.totalDonations).to.equal(0);
      expect(nftDetails.owner).to.equal(addr1.address);
    });

    it("Should revert if NFT does not exist", async function () {
      await expect(contract.getContractNFT(1)).to.be.revertedWith("NFT does not exist");
    });
  });
});
