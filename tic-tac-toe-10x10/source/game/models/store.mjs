import Game from './game';
import { registerUser } from '../socket';

const cleaningPeriod = 300000;

let store = [];

setInterval(() => {
  store = store.filter(game => !game.isEnded());
}, cleaningPeriod);

export function getById(gameId) {
  return store.find(game => game.id === gameId);
}

export function createGame(gameDTO, room) {
  const game = new Game(
    gameDTO.name || `Tic tac toe ${store.length + 1}`,
    room,
  );
  store = [...store, game];
  return game;
}

export function getAllGames() {
  return store.filter(game => game.isPending()).map(game => ({ id: game.id }));
}

export async function setUserReady(gameId, playerId) {
  const game = getById(gameId);
  await registerUser({ gameId, playerId });
  game.ready = playerId;
  return game;
}
