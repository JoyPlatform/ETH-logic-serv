/* eslint-disable prefer-destructuring */
import config from '../config.json';

const Web3 = require('web3');
const net = require('net');

const web3 = new Web3(config.gethPwd, net);

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
