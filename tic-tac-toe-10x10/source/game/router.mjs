import express from 'express';
import * as gameRepository from './models/store';
import * as gameSocket from './socket';
import auth from '../middleware/auth';
import test from '../middleware/test';

const router = new express.Router();

function getAll(req, res) {
  res.send(gameRepository.getAllGames());
}

function createGame(req, res) {
  const newGame = gameRepository.createGame(req.body);
  gameSocket.createGameRoom(newGame);
  res.send({ yourId: newGame.id });
}

async function userReady({ body: { gameId, playerId } }, res) {
  const game = await gameRepository.setUserReady(gameId, playerId);
  if (game.isStarted()) {
    gameSocket.notifyAboutGameStart(game);
  } else {
    const timerId = setTimeout(() => {
      gameSocket.notifyAboutGameRemoving(game.id);
      res.status(410).send();
    }, 15000);
    await game.waitStart();
    clearTimeout(timerId);
  }
  res.sendStatus(204);
}

function gameStep(req, res, next) {
  const { playerId, game, body: { move } } = req;
  try {
    const gameResult = game.reserveField(move, playerId);
    if (game.isEnded()) {
      gameSocket.notifyAboutGameRemoving(game.id);
    }
    res.send(gameResult || {});
  } catch (e) {
    next(e);
  }
}

function getMoveStatus(req, res, next) {
  const { playerId, game } = req;
  try {
    const isMyStep = game.step === playerId;
    const enemyId = game.getEnemyId(playerId);
    const enemyMoves = game.reserved[enemyId];
    const lastEnemyMove = enemyMoves[enemyMoves.length - 1];
    const moveInfo = isMyStep ? { move: lastEnemyMove } : {};
    const endedStatus = { ended: game.isEnded() };
    const responseData = { ...moveInfo, ...endedStatus, ...game.winState };
    res.send(responseData);
  } catch (e) {
    next(e);
  }
}

function getCurrentGameState(req, res, next) {
  const { game } = req;
  try {
    const { reserved, step, winState } = game;
    res.send({
      reserved: { x: reserved[game.ready[0]], o: reserved[game.ready[1]] },
      step: step === game.ready[0] ? 'x' : 'o',
      ended: game.isEnded(),
      ...winState,
    });
  } catch (e) {
    next(e);
  }
}

function surrend(req, res, next) {
  const { playerId, game } = req;
  try {
    const enemyId = game.getEnemyId(playerId);
    game.setWinner(enemyId);
    gameSocket.notifyAboutGameRemoving(game.id);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}

export default router
  .post('/newGame', test, createGame)
  .post('/gameReady', test, userReady)
  .post('/move', test, auth, gameStep)
  .put('/surrender', test, auth, surrend)
  .get('/games', test, getAll)
  .get('/move', test, auth, getMoveStatus)
  .get('/game', test, auth, getCurrentGameState);
