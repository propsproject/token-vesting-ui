// Allows us to use ES6 in our migrations and tests.
require('babel-register')
var Web3 = require('web3')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "august unaware rally spider flight nuclear web estate muscle zone profit box";

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/bc1b11176a1e4aa98b607fea38eb4d43")
      },
      network_id: '4'
    }
  },
  solc: {
    version: '0.4.24',
    optimizer: {
      enabled: true,
      runs: 500,
    },
  },
}
