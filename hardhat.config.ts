import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_MAINNET_KEY}`,
      }
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_MAINNET_KEY}`,
      accounts: [`${process.env.SEPOLIA_KEY}`],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};

export default config;
