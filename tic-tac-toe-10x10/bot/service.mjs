import socketClient from 'socket.io-client';
import axios from 'axios';

const { API_URL = 'http://localhost:3000' } = process.env;

const io = socketClient(`${API_URL}/games`);

const client = axios.create({
  baseURL: API_URL,
});

export const testException = io.emit.bind(io, 'testException');

export function setUserReady(gameId, socket = io) {
  return client.post('/gameReady', {
    playerId: socket.id,
    gameId,
  });
}

export function newGame() {
  return client.post('/newGame');
}

export function makeMove(gameId, move, socket = io) {
  return client.post(
    '/move',
    { move },
    {
      headers: {
        'Game-ID': gameId,
        'Player-ID': socket.id,
      },
    },
  );
}

export function surrend(gameId, socket = io) {
  return client.put(
    '/surrender',
    {},
    {
      headers: {
        'Game-ID': gameId,
        'Player-ID': socket.id,
      },
    },
  );
}

export async function removeGame(gameId) {
  const otherPlayer = socketClient(`${API_URL}/games`);
  return new Promise(resolve => {
    otherPlayer.on('connect', async () => {
      await Promise.all([
        setUserReady(gameId),
        setUserReady(gameId, otherPlayer),
      ]);
      resolve();
    });
  });
}
