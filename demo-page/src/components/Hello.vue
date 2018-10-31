<template>
  <div class="hello">
    <b-container class="main-container">
      <b-row>
        <b-col cols="4">
          <h4>GetBalace</h4>
          <b-form-input v-model="getBalanceId" type="text" placeholder="ID"></b-form-input>
          <b-form-select v-model="getBalanceCurrency" :options="currencies" class="mb-3" :value="null"></b-form-select>
          <p>User: {{ getBalanceId }}</p>
          <p>Unit: {{ getBalanceCurrency }}</p>
          <b-button variant="primary" v-on:click="sendRequestCommand('getBalance', { getBalanceId, getBalanceCurrency} )" >GetBalace</b-button>
          <b-form-input v-model="getBalanceReturn" type="text" placeholder="Return" disabled></b-form-input>
        </b-col>
        <b-col cols="4">
          <button v-on:click="sendRequest('latestBlock')">latestBlock</button>
        </b-col>
        <b-col cols="4">3 of 3</b-col>
      </b-row>
      <b-row class="returnRow">
        <b-col md="12">
          <h3>Return Console: </h3>
          <textarea :value.prop="returnConsole" rows="7"></textarea>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  /* eslint-disable object-shorthand */
  export default {
    name: 'hello',
    data() {
      return {
        getBalanceId: '',
        getBalanceCurrency: '',
        returnConsole: '',
        getBalanceReturn: '',
        currencies: [
          {
            value: null,
            text: 'Choose unit',
            disabled: true,
            slot: 'first',
          },
          { value: 'Eth', text: 'Eth' },
          { value: 'Wei', text: 'Wei' },
          { value: 'JoyAsset', text: 'JoyAsset' }],
      };
    },
    created: function () {
      this.messageListener();
    },
    methods: {
      sendRequest(command) {
        this.$root.websocket.send(`{ "command": "${command}" }`);
      },
      sendRequestCommand(command, requested) {
        let sendString;
        switch (command) {
          case 'getBalance':
            sendString = `{ "command": "${command}", "address": "${requested.getBalanceId}", "unit" : "${requested.getBalanceCurrency}" }`;
            break;
          default:
            break;
        }
        console.log(sendString);
        this.$root.websocket.send(sendString);
      },
      messageListener() {
        const ourThis = this;
        this.$root.websocket.onmessage = function (event) {
          try {
            const parsedEvent = JSON.parse(event.data);
            switch (parsedEvent.command) {
              case 'getBalance_RES':
                ourThis.getBalanceReturn = parsedEvent.balance;
                break;
              default:
                console.log('Not such command');
            }
            ourThis.returnConsole += JSON.stringify(event.data, null, '\t');
          } catch (e) {
            console.log(e);
            ourThis.returnConsole += e;
          }
        };
      },
    },
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="sass">
  h1, h2
    font-weight: normal

  ul
    list-style-type: none
    padding: 0

  li
    display: inline-block
    margin: 0 10px

  a
    color: #42b983

  .main-container
    .row
      display: flex
      justify-content: space-around

  .returnRow
    textarea
      width: 100%

</style>
