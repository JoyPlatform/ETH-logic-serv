/* eslint-disable prefer-destructuring */
import config from '../config.json';
import contractsImpl from '../contracts.json';

const Web3 = require('web3');
const net = require('net');

const web3 = new Web3(config.gethPwd, net);

console.log(`---------------------------------------------------------------------------------`);
//console.log(web3); # print all available functions from web3 // only for debug
console.log(`---------------------------------------------------------------------------------`);

console.log(`web3 version: ${ web3.version }`);

module.exports = {
  /* ----------------------------------Create Contracts Objects---------------------------------- */
  getTokenContract() {
    return new web3.eth.Contract(
      contractsImpl.MultiContractAsset.abi,
      config.tokenContractAddress, {
        from: config.contractsOwnerAddress, // default 'from' address
        gasPrice: config.gasPrice,
        gas: config.gasLimit,  // gas limit - The maximum gas provided for a transaction
    });
  },
  getDepositContract() {
    const TokenContract = web3.eth.contract(contractsImpl.PlatformDeposit.abi);
    return TokenContract.at(config.depositContractAddress);
  },
  getGameContract() {
    const TokenContract = web3.eth.contract(contractsImpl.JoyGameDemo.abi);
    return TokenContract.at(config.demoGameContractAddress);
  },

  debugContractsInfo() {
    console.log(`Debug contracts addresses:`);
    console.log(`Token: ${ config.tokenContractAddress }`);
    console.log(`Deposits: ${ config.depositContractAddress }`);
    console.log(`Demo Game: ${ config.demoGameContractAddress} `);

    console.log(`Debug contracts Application Binary Interface (ABI):`);
    console.log(`Token ABI: ${ JSON.stringify(contractsImpl.MultiContractAsset.abi, null, 2) }`);
    console.log(`Deposit ABI: ${ JSON.stringify(contractsImpl.PlatformDeposit.abi, null, 2) }`);
    console.log(`Demo Game ABI: ${ JSON.stringify(contractsImpl.JoyGameDemo.abi, null, 2) }`);
  },

  testTokenContract() {
    let Token = this.getTokenContract();
    Token.methods.totalSupply().call()
      .then( (result) => {
          console.log(`Total supply: ${ result }`);
      });
  },

  /* ---------------------------------ETH Functions---------------------------------------------- */

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
  // “wei” are the smallest ether unit,
  // calculations should be done always in wei and convert only for display reasons.
  getBalanceWei(ws, address) {
    web3.eth.getBalance(address)
      .then(balance => {
         ws.send(balance);
      });
  },
  getBalanceEth(ws, address) {
    web3.eth.getBalance(address)
      .then(balance => {
        //ws.send(web3.utils.fromWei(balance, 'ether'));
        //console.log(`typeof ${ typeof(web3.utils.fromWei(balance, 'ether')) }`);
        return web3.utils.fromWei(balance, 'ether');
      })
      .then(ethBalance => {
        ws.send(ethBalance);
      });
  },
  // function only for debug printing info
  // not secure enough to use as reference
  accountsInfo(ws) {
    web3.eth.getAccounts()
      .then(function (accArr) {
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
            console.log(`balances: ${ JSON.stringify(accMap, null, 2) }`);
            ws.send(JSON.stringify(accMap, null, 2));
          });

      }, function(err) {
        console.log(err); // error
      });
  }
};
