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
      console.log(`error - parse JSON: ${e}`);
    }
    console.log(`message: ${JSON.stringify(messageJSON)}`);
    console.log(`message (string): ${message}`);

    switch (messageJSON.command) {
      case 'latestBlock':
        ws.send(api.latestBlock());
        break;
      default:
        ws.send(message);
    }
  });
});

module.exports = {
  config,
};
