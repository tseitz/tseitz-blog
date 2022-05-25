import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";

module.exports = {
  solidity: "0.8.0",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    gasReporter: {
      url: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
      currency: 'USD',
      gasPrice: 21
    }
    // mumbai: {
    //   url: "https://rpc-mumbai.matic.today",
    //   accounts: [process.env.pk]
    // },
    // polygon: {
    //   url: "https://polygon-rpc.com/",
    //   accounts: [process.env.pk]
    // }
  },
};
