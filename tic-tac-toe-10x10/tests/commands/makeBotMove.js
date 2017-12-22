const axios = require('axios');

const { BOT_API_URL = 'http://localhost:4445' } = process.env;

const http = axios.create({
  baseURL: BOT_API_URL,
  timeout: 1000,
});

exports.command = function makeBotMove(move) {
  this.perform(async done => {
    await http.post('/move', { gameId: this.gameId, move });
    done();
  });
  return this;
};
