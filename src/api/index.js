/* eslint-disable prefer-destructuring */
const Web3 = require('web3');
const net = require('net');

const web3 = new Web3('/Users/bartlomiejsmagacz/Library/Ethereum/testnet/geth.ipc', net);

const latestBlock = web3.eth.getBlock('latest', (error, result) => {
  if (!error) {
    console.log(result);
  } else {
    console.error(error);
  }
});

module.exports = {
  latestBlock() {
    return JSON.stringify(latestBlock);
  },
};
