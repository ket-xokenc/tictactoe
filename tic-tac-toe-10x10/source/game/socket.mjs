import { getById } from './models/store';
import { testExceptionHandler } from '../test/socket';
import getIO from './game-io';

export async function notifyAboutGameRemoving(gameId) {
  (await getIO()).emit('remove', { id: gameId });
}

export async function notifyAboutGameStart(game) {
  const gameIO = await getIO();
  game.ready.forEach((u, i) =>
    gameIO.to(u).emit('startGame', { id: game.id, side: i ? 'o' : 'x' }),
  );
}

export async function registerUser({ gameId, playerId }) {
  const game = getById(gameId);
  const gameIO = await getIO();
  const socket = gameIO.connected[playerId];
  if (gameId && game && !game.isStarted() && !game.isWaiting()) {
    socket.join(gameId);
    game.room = gameIO.adapter.rooms[gameId];
    if (game.isWaiting()) {
      notifyAboutGameRemoving(game.id);
    }
  } else {
    socket.emit('exception', { message: 'Wrong game id!' });
  }
}

export default (async function connect() {
  (await getIO()).on('connection', socket => {
    console.log(`User ${socket.id} connected!`);
    socket.on('testException', testExceptionHandler);
  });
});

export async function createGameRoom(game) {
  (await getIO()).emit('add', { id: game.id });
}
