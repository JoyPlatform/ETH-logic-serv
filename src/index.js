/* eslint-disable import/no-extraneous-dependencies */
import url from 'url';
import WebSocket from 'ws';
import api from './api';
import config from './config.json';

// create WebSocket server / PORT get from console or (default) from config.json file
const wss = new WebSocket.Server({ port: process.env.PORT || config.port });

let messageJSON;

// main function
wss.on('connection', (ws, req) => {
  const location = url.parse(req.url, true);
  console.log('connection');
  console.log(location);
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
      case 'latestBlock':
        api.latestBlock(ws);
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
                    let response = new Object({});
                    response.command = messageJSON.command + '_RES';
                    response.user = address;
                    response.location = 'world';
                    response.unit = messageJSON.unit;
                    response.balance = ethBalance;
                    response.status = 0;
                    ws.send(JSON.stringify(response));
                  });
                break;

              case 'Wei':
                api.getBalanceWei(address)
                  .then(weiBalance => {
                    let response = new Object({});
                    response.command = messageJSON.command + '_RES';
                    response.user = address;
                    response.location = 'world';
                    response.unit = messageJSON.unit;
                    response.balance = weiBalance;
                    response.status = 0;
                    ws.send(JSON.stringify(response));
                  });
                break;

              case 'JoyAsset':
                api.getBalanceJoyCoin(address)
                  .then(joyBalance => {
                    let response = new Object({});
                    response.command = messageJSON.command + '_RES';
                    response.user = address;
                    response.location = 'world';
                    response.unit = messageJSON.unit;
                    response.balance = joyBalance;
                    response.status = 0;
                    ws.send(JSON.stringify(response));
                  });
                break;
            }
          } else if (location === 'platform') {
            if (messageJSON.unit != 'JoyAsset') {
              let response = new Object({});
              response.status = 1;
              response.status_err = `Only JoyAsset is supported as platform balance`;
              ws.send(JSON.stringify(response));
              break;
            }
            api.getPlayerDeposit(address)
              .then(playerFunds => {
                let response = new Object({});
                response.command = messageJSON.command + '_RES';
                response.user = address;
                response.location = 'platform';
                response.unit = messageJSON.unit;
                response.balance = playerFunds;
                response.status = 0;
                ws.send(JSON.stringify(response));
              });
          } else if (location === 'gameSession' ) {
            if (messageJSON.unit != 'JoyAsset') {
              let response = new Object({});
              response.status = 1;
              response.status_err = `Only JoyAsset is used in gameSession`;
              ws.send(JSON.stringify(response));
              break;
            }
            api.getPlayerDepositLocked(address)
              .then(playerLockedFunds => {
                let response = new Object({});
                response.command = messageJSON.command + '_RES';
                response.user = address;
                response.location = 'gameSession';
                response.unit = messageJSON.unit;
                response.balance = playerLockedFunds;
                response.status = 0;
                ws.send(JSON.stringify(response));
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
