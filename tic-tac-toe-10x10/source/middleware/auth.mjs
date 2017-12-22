import { getById } from '../game/models/store';
import { UnauthorizedError, ForbiddenError } from '../errors';

export default function auth(req, res, next) {
  const [gameId, playerId] = [req.get('Game-ID'), req.get('Player-ID')];
  const game = getById(gameId);
  if (!game) {
    next(new UnauthorizedError(`Game with game id ${gameId} isn't exist`));
    return;
  }
  if (game.ready.indexOf(playerId) === -1) {
    next(new ForbiddenError(`You hadn't subscribe on game with id ${gameId}`));
    return;
  }
  req.game = game;
  req.playerId = playerId;
  next();
}
