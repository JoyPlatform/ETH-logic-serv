/* eslint-disable import/no-extraneous-dependencies */
import url from 'url';
import WebSocket from 'ws';
import api from './api';
import config from './config.json';

// web socket message prototypes for respose, request, notifications.
import { getBalance_response, empty_response, data_response, error_response } from './utils/msg_types';

// create WebSocket server / PORT get from console or (default) from config.json file
const wss = new WebSocket.Server({ port: process.env.PORT || config.port });
// const ws_WS = new WebSocket( config.wallet_url );
let messageJSON;

// main function
wss.on('connection', (ws, req) => {
  const location = url.parse(req.url, true);
  console.log('connection');
  console.log(location);

  if (ws.subscribeBlocks === true) {
    api.subscribe_newBlockHeaders()
      .on("data", function(blockHeader){
        console.log(`blockHeader : ${ JSON.stringify(blockHeader) }`);
      });
  }
  // Example : Message send to wallet server
  /*
    ws_WS.send(JSON.stringify({ "command": "GetMoney_REQ", "user":"ala", "unit":"coin"}));
    ws_WS.on('message', (message) => {
      console.log(`response from MICHAL  ${ message } `);
    });
  */

  ws.on('message', (message) => {
    // console.log('received: %s', api.debug(message));
    // ws.send(api.debug(message));
    try {
      messageJSON = JSON.parse(message);
    } catch (e) {
      messageJSON = '';
      console.log(`> error - parse JSON: ${e}`);
      ws.send(`error - parse JSON: ${e}`);
    }
    console.log(`= message: ${message}`);
    console.log(`= message (string): ${JSON.stringify(messageJSON)}`);


    switch (messageJSON.command) {
      case 'setUserID':
        ws.UserID = UserID;
        // TODO check if user if is correct eth address
        const res = empty_response(messageJSON.command);
        ws.send(res);
        break;
      case 'latestBlock':
        api.latestBlock(ws);
        break;

      case 'getBlock':
        api.getBlockHeader(messageJSON.blockID) // block ID could be block number or block hash
          .then(blockHeader => {
            const res = data_response(messageJSON.command, blockHeader);
            ws.send(res);
          }).catch(error => {
            const err_res = error_response(messageJSON.command, error);
            ws.send(err_res);
          });
        break;
      case 'latestBlockNumber':
        api.latestBlockNumber(ws);
        break;

      case 'getAccounts':
        api.getAccounts(ws);
        break;

      case 'getBalance':
        try {
          let address = messageJSON.user;
          let location = messageJSON.location;
          if (location === 'world') {
            switch (messageJSON.unit) {
              case 'Eth':
                api.getBalanceEth(address)
                  .then(ethBalance => {
                    const res = getBalance_response(address, 'world', messageJSON.unit, ethBalance);
                    ws.send(res);
                  });
                break;

              case 'Wei':
                api.getBalanceWei(address)
                  .then(weiBalance => {
                    const res = getBalance_response(address, 'world', messageJSON.unit, weiBalance);
                    ws.send(res);
                  });
                break;

              case 'JoyAsset':
                api.getBalanceJoyCoin(address)
                  .then(joyBalance => {
                    const res = getBalance_response(address, 'world', messageJSON.unit, joyBalance);
                    ws.send(res);
                  });
                break;
            }
          } else if (location === 'platform') {
            if (messageJSON.unit != 'JoyAsset') {
              const err_res = error_response(messageJSON.command, 'Only JoyAsset is supported as platform balance');
              ws.send(err_res);
              break;
            }
            api.getPlayerDeposit(address)
              .then(playerFunds => {
                const res = getBalance_response(address, 'platform', messageJSON.unit, playerFunds);
                ws.send(res);
              });
          } else if (location === 'gameSession' ) {
            if (messageJSON.unit != 'JoyAsset') {
              const err_res = error_response(messageJSON.command, 'Only JoyAsset is used in gameSession');
              ws.send(err_res);
              break;
            }
            api.getPlayerDepositLocked(address)
              .then(playerLockedFunds => {
                const res = getBalance_response(address, 'gameSession', messageJSON.unit, playerLockedFunds);
                ws.send(res);
              });
          } else {
            ws.send(`Missing Json parameter: "location" : [ "world", "platform", "gameSession" ]`);
          }
        } catch (e) {
          console.log(`> error - parse JSON: ${e}`);
          ws.send(`"JSON error ${ e }"`);
        }
        break;

      //------------------------------------------ debug informations
      case 'accountsInfo':
        api.accountsInfo(ws);
        break;

      case 'debugContractsInfo':
        api.debugContractsInfo();
        break;

      case 'getToken':
        api.testTokenContract();
        break;
      //------------------------------------------
      default:
        console.log(`> pong: ${message}`);
        ws.send(`pong: ${message}`);
    }
  });
});

module.exports = {
  config,
};
