let gameIO = null;
let globalResolve = null;

export function initIO(io) {
  if (!gameIO) {
    gameIO = io.of('/games');
  }
  if (globalResolve) {
    globalResolve(gameIO);
  }
}

export default function getIO() {
  return new Promise((resolve) => {
    if (gameIO) {
      resolve(gameIO);
    } else {
      globalResolve = resolve;
    }
  });
}
