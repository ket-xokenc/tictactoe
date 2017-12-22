const axios = require('axios');

const { BOT_API_URL = 'http://localhost:4445' } = process.env;

const http = axios.create({
  baseURL: BOT_API_URL,
  timeout: 1000,
});

exports.command = function surrend() {
  this.perform(async done => {
    await http.put('/surrender', { gameId: this.gameId });
    done();
  });
  return this;
};
