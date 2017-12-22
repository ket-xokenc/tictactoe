const axios = require('axios');

const { BOT_API_URL = 'http://localhost:4445' } = process.env;

const http = axios.create({
  baseURL: BOT_API_URL,
  timeout: 1000,
});

exports.command = function subscribeOnGame() {
  const client = this;
  const page = client.page.gameList();
  client.perform(async done => {
    await http.get('/newGame');
    done();
  });
  page.getAttribute('@lastGame', 'id', function checkAttribute(gameId) {
    this.assert.equal(typeof gameId, 'object');
    this.assert.equal(gameId.status, 0);
    page.click('@lastGame');
    client.perform(async done => {
      await http.post('/gameReady', { gameId: gameId.value });
      done();
    });
    client.waitForUrl('/game.html', 500);
  });
  return this;
};
