import express from 'express';
import * as service from './service';

const router = new express.Router();

async function setUserReady(req, res) {
  const { gameId } = req.body;
  await service.setUserReady(gameId);
  res.sendStatus(200);
}

async function newGame(req, res) {
  await service.newGame();
  res.sendStatus(200);
}

async function makeMove(req, res) {
  const { gameId, move } = req.body;
  await service.makeMove(gameId, move);
  res.sendStatus(200);
}

async function surrend(req, res) {
  const { gameId } = req.body;
  await service.surrend(gameId);
  res.sendStatus(200);
}

async function removeGame(req, res) {
  const { id } = req.params;
  await service.removeGame(id);
  res.sendStatus(200);
}

export default router
  .post('/gameReady', setUserReady)
  .post('/move', makeMove)
  .put('/surrender', surrend)
  .delete('/games/:id', removeGame)
  .get('/newGame', newGame);
