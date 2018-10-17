/* eslint-disable prefer-destructuring */
import config from '../config.json';

const Web3 = require('web3');
const net = require('net');

const web3 = new Web3(config.gethPwd, net);

const number = web3.eth.blockNumber;

module.exports = {
  latestBlock(ws) {
    const blockInfo = web3.eth.getBlock('latest', (error, result) => {
      if (!error) {
        console.log(result);
        ws.send(JSON.stringify(result));
      } else {
        console.error(error);
      }
    });
  },
  latestBlockNumber(ws) {
    // NOT WORK
    var bNum = web3.eth.getBlockNumber( (error, block_number) => {
      if (!error) {
        console.log(block_number);
        ws.send(block_number);
      } else {
        console.error(error);
      }
    });
        /*
      .then(function (result) {
       ws.send(JSON.stringify(result));
    }, function(err) {
      console.log(err); // error
    });
    */
  },
  getAccounts(ws) {
    web3.eth.getAccounts()
      .then(function (result) {
       ws.send(JSON.stringify(result));
    }, function(err) {
      console.log(err); // error
    });
  },
  getBalance(ws, address) {
    web3.eth.getBalance(address)
      .then(balance => {
         ws.send(balance);
      });
  },
  accountsInfo(ws) {
    web3.eth.getAccounts()
      .then(function (accArr) {
        //console.log(`level1 ${ JSON.stringify(accArr, null, 2) }`);

        var balancesPromise = Promise.all(accArr.map( (item) => {
          return web3.eth.getBalance(item);
        }))
          .then( (result) => {
            //console.log(`balances: ${ JSON.stringify(result, null, 2) }`);
            var i = 0;
            var accMap = accArr.reduce( (map, value) => {
              map[value] = [];
              map[value].push( { "balance" : result[i] } );
              i = i + 1;
              return map;
            }, {});
            ws.send(JSON.stringify(accMap, null, 2));
            console.log(`balances: ${ JSON.stringify(accMap, null, 2) }`);
          });

      }, function(err) {
        console.log(err); // error
      });
  }
};
