/* eslint-disable prefer-destructuring */
import config from '../config.json';

const Web3 = require('web3');
const net = require('net');

const web3 = new Web3(config.gethPwd, net);


module.exports = {
  latestBlock() {
    var fullBlockinfo;
    const blockInfo = web3.eth.getBlock('latest', (error, result) => {
      if (!error) {
        console.log(result);
        fullBlockinfo = result;
      } else {
        console.error(error);
      }
    });

    console.log('number !!!!!');
    console.log(number);


    return JSON.stringify(fullBlockinfo);
  },
  latestBlockNumber() {
    // async OK
    var lBlockNr = web3.eth.getBlockNumber(function (error, result) {
      if (!error) {
        console.log('number2 ***');
        console.log(result);
        return result;
      } else {
        console.error(error);
      }
    });

    // blocking UNDEFINE;
    /*
    console.log("1");
    var number = web3.eth.blockNumber;
    console.log(number);
    */
  }
};
