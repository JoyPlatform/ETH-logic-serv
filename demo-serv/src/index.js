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
          let address = messageJSON.address;
          switch (messageJSON.unit) {
            case 'Eth':
              api.getBalanceEth(address)
                .then(ethBalance => {
                  let response = new Object({});
                  response.command = messageJSON.command + '_RES';
                  response.user = address;
                  response.unit = messageJSON.unit;
                  response.balance = ethBalance;
                  ws.send(JSON.stringify(response));
                });
              break;
            case 'Wei':
              api.getBalanceWei(address)
                .then(weiBalance => {
                  let response = new Object({});
                  response.command = messageJSON.command + '_RES';
                  response.user = address;
                  response.unit = messageJSON.unit;
                  response.balance = weiBalance;
                  ws.send(JSON.stringify(response));
                });
              break;
            case 'JoyAsset':
              api.getBalanceJoyCoin(address)
                .then(joyBalance => {
                  let response = new Object({});
                  response.command = messageJSON.command + '_RES';
                  response.user = address;
                  response.unit = messageJSON.unit;
                  response.balance = joyBalance;
                  ws.send(JSON.stringify(response));
                });
              break;
            }
        } catch (e) {
          console.log(`> error - parse JSON: ${e}`);
          ws.send(`"JSON error ${ e }"`);
        }
        break;


      case 'getBalanceJoy':
        let address = messageJSON.address;
        break;

      case 'accountsInfo':
        api.accountsInfo(ws);
        break;

      case 'debugContractsInfo':
        api.debugContractsInfo();
        break;

      // only debug information to console
      case 'getToken':
        api.testTokenContract();
        break;
      default:
        console.log(`> pong: ${message}`);
        ws.send(`pong: ${message}`);
    }
  });
});

module.exports = {
  config,
};
