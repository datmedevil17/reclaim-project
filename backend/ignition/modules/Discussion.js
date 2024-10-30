const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("Discussion", (m) => {


  const Discussion = m.contract("Discussion", []);

  return { Discussion };
});
