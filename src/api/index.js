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
        gas: 1000000  // gas limit - The maximum gas provided for a transaction
    });
  },
  getDepositContract() {
    return new web3.eth.Contract(
      contractsImpl.PlatformDeposit.abi,
      config.depositContractAddress, {
        from: config.contractsOwnerAddress, // default 'from' address
        gasPrice: config.gasPrice,
        gas: 1000000  // gas limit - The maximum gas provided for a transaction
    });
  },
  getGameContract() {
    return new web3.eth.Contract(
      contractsImpl.JoyGameDemo.abi,
      config.demoGameContractAddress, {
        from: config.contractsOwnerAddress, // default 'from' address
        gasPrice: config.gasPrice,
        gas: 1000000  // gas limit - The maximum gas provided for a transaction
    });
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
    Token.methods.name().call()
      .then( (result) => {
          console.log(`Asset full name: ${ result }`);
      });
    Token.methods.symbol().call()
      .then( (result) => {
          console.log(`Asset symbol: ${ result }`);
      });
    Token.methods.totalSupply().call()
      .then( (result) => {
          console.log(`Total supply: ${ result }`);
      });
    Token.methods.decimals().call()
      .then( (result) => {
          console.log(`Decimal places: ${ result }`);
      });
  },

  /* -------------------------------Joy Platform Functions--------------------------------------- */

  getBalanceJoyCoin(address) {
    let Token = this.getTokenContract();
    return Token.methods.balanceOf(address).call();
  },

  // player funds inside deposit contract
  getPlayerDeposit(address) {
    let Deposit = this.getDepositContract();
    return Deposit.methods.balanceOfPlayer(address).call();
  },

  // player funds that are locked inside deposit contract for the time of the game session
  getPlayerLockedFunds(address) {
    let Deposit = this.getDepositContract();
    return Deposit.methods.playerLockedFunds(address).call();
  },

  /* ---------------------------------ETH Functions---------------------------------------------- */

  latestBlock(ws) {
    web3.eth.getBlock('latest', (error, result) => {
      let response = new Object({});
      response.command = 'latestBlock_RES';
      if (!error) {
        response.data = JSON.stringify(result);
        response.status = 0;
        ws.send(JSON.stringify(response));
      } else {
        console.error(error);
        response.status = 1;
        response.status_err = `callback error: ${ error } `;
        ws.send(JSON.stringify(response));
      }
    });
  },
  latestBlockNumber(ws) {
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
  getBalanceWei(address) {
    return web3.eth.getBalance(address);
  },
  getBalanceEth(address) {
    return web3.eth.getBalance(address)
      .then(balance => {
        //ws.send(web3.utils.fromWei(balance, 'ether'));
        //console.log(`typeof ${ typeof(web3.utils.fromWei(balance, 'ether')) }`);
        return web3.utils.fromWei(balance, 'ether');
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
