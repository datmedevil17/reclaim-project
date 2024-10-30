require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers")
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
      sepolia: {
          url: process.env.SEPOLIA_URL,
          accounts: [`0x${process.env.PRIVATE_KEY}`],
      },
  },

};
