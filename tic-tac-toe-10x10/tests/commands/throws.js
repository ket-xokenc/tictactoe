const axios = require('axios');

const { API_URL = 'http://localhost:3000' } = process.env;

const http = axios.create({
  baseURL: API_URL,
  timeout: 1000,
});

exports.command = function throws(error) {
  this.perform(async done => {
    await http.put('/error', { error });
    done();
  });
  return this;
};
