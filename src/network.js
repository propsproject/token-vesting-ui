import Web3 from 'web3'
import { sleep } from './utils'
const artifcats = require('./abi/PropsToken.json');
const Contract = require('truffle-contract');
// let web3;
const Network = {
  async web3() {
    const provider = await Network.provider()
    return new Web3(provider)
  },

  async eth() {
    const web3 = await Network.web3()
    return web3.eth
  },

  async provider() {
    
    let { web3 } = window

    if (window.ethereum) {
      web3 = new window.Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
      }
    }

    let counter = 0;
    while (web3 === undefined) {
      counter += 1;
      if (counter === 1) {
        window.usingInfura = true;
        web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/5dc6c261be734a60b0475ef178d0cb6b"));
        let contract = Contract(artifcats);
        contract.setProvider(web3.currentProvider);
        //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
        if (typeof contract.currentProvider.sendAsync !== "function") {
          contract.currentProvider.sendAsync = function() {
            return contract.currentProvider.send.apply(
              contract.currentProvider, arguments
            );
          };
        }
      }
      Network.log("Waiting for web3")
      await sleep(500)
    }

    return web3.currentProvider;
  },

  getAccounts() {
    return new Promise((resolve, reject) => {
      Network.eth().then(eth => eth.getAccounts(Network._web3Callback(resolve, reject)))
    })
  },

  _web3Callback(resolve, reject) {
    return (error, value) => {
      if (error) reject(error)
      else resolve(value)
    }
  },

  log(msg) {
    console.log(`[Network] ${msg}`)
  }
}

export default Network