require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API = process.env.ETHERSCAN_API;
const POLYSCAN_API = process.env.POLYSCAN_API;
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000,
      chainId: 11155111,
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: 35000000000,
      chainId: 80001,
    },
  },
  solidity: "0.8.9",
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API,
      polygon: POLYSCAN_API,
      polygonMumbai: POLYSCAN_API,
    },
  },
};
