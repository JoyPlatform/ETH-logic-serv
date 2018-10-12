/* eslint-disable */

'use strict';

const assert = require('assert');

const WebSocket = require('ws');

describe('WebSocket', function () {
  it('communicates successfully with echo service (ws)', function (done) {
    const ws = new WebSocket('ws://192.168.1.208:8010', {
      protocolVersion: 13
    });
    const str = Date.now().toString();

    let dataReceived = false;

    ws.on('open', () => ws.send(str));
    ws.on('close', () => {
      assert.ok(dataReceived);
      done();
    });
    ws.on('message', (data) => {
      dataReceived = true;
      assert.strictEqual(data, str);
      ws.close();
    });
  });

  it('communicates successfully with echo service (wss)', function (done) {
    const ws = new WebSocket('ws://192.168.1.208:8010', {
      protocolVersion: 13
    });
    const str = Date.now().toString();

    let dataReceived = false;

    ws.on('open', () => ws.send(str));
    ws.on('close', () => {
      assert.ok(dataReceived);
      done();
    });
    ws.on('message', (data) => {
      dataReceived = true;
      assert.strictEqual(data, str);
      ws.close();
    });
  });
});
