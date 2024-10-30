const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("ContractNFTPlatform", (m) => {


  const ContractNFTPlatform = m.contract("ContractNFTPlatform", []);

  return { ContractNFTPlatform };
});
