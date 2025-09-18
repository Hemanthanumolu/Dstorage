require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const MNEMONIC = process.env.MNEMONIC || '';
const INFURA_API_KEY = process.env.INFURA_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      chainId: 5,
      gas: 5500000,
      blockConfirmations: 2,
      timeoutBlocks: 200,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      chainId: 11155111,
      gas: 5500000,
      blockConfirmations: 2,
      timeoutBlocks: 200,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: { mnemonic: MNEMONIC },
      chainId: 1,
      gas: 5500000,
      gasPrice: 20000000000, // 20 gwei
      blockConfirmations: 2,
      timeoutBlocks: 200,
    }
  },
  paths: {
    sources: "./contracts",
    artifacts: "./client/src/artifacts",
  }
};
