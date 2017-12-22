import getIO from '../game/game-io';

export async function testExceptionHandler({ message }) {
  (await getIO()).emit('exception', { message });
}
