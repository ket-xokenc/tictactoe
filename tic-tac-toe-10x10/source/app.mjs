import express from 'express';
import path from 'path';
import http from 'http';
import socket from 'socket.io';
import bodyParser from 'body-parser';
import { initIO as initGameIO } from './game/game-io';
import connectGameIO from './game/socket';
import gameRouter from './game/router';
import testRouter from './test/router';

const app = express();
const serverWrapper = http.createServer(app);
const io = socket(serverWrapper);

initGameIO(io);

// const { url } = import.meta;
const dirname = process.env.PWD;
console.log(path.join(dirname, '/static'));

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(dirname, '/static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(gameRouter);
app.use(testRouter);
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ message: err.message });
  next();
});

serverWrapper.listen(PORT, () => {
  console.log(`Server listen ${PORT} port`);
  connectGameIO();
});
