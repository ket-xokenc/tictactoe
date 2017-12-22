import uuid from 'uuid';
import intersection from 'lodash/intersection';
import sortedUniq from 'lodash/sortedUniq';
import toPairs from 'lodash/toPairs';
import { sequenceMatch } from '../../utils';
import { getWinCombs } from '../service';
import { BadArgumentsError, GoneError } from '../../errors';

const status = {
  Pending: 'Pending',
  Waiting: 'Waiting',
  Started: 'Started',
  Ended: 'Ended',
};

export default class Game {
  constructor(name, room, winLength = 3, size = 10) {
    this.id = uuid();
    this.name = name;
    this.socketRoom = room || [];
    this.status = status.Pending;
    this.players = [];
    this.winState = { win: null };
    this.winLength = winLength;
    this.size = size;
  }

  set room(room) {
    if (room.length === 2) {
      this.status = status.Waiting;
    }
    this.socketRoom = room;
  }

  set ready(userId) {
    if (this.room.sockets[userId] && this.players.indexOf(userId) === -1) {
      this.players.push(userId);
      if (this.players.length === 2) {
        this.start();
      }
    }
  }

  get ready() {
    return this.players;
  }

  get room() {
    return this.socketRoom;
  }

  isPending() {
    return this.status === status.Pending;
  }

  isStarted() {
    return this.status === status.Started;
  }

  isWaiting() {
    return this.status === status.Waiting;
  }

  isEnded() {
    return this.status === status.Ended;
  }

  isMyStep(playerId) {
    return this.step === playerId;
  }

  waitStart() {
    return new Promise(resolve => {
      if (this.isStarted()) {
        resolve();
      } else {
        this.endWait = resolve;
      }
    });
  }

  start() {
    this.status = status.Started;
    this.reserved = {};
    this.reserved[this.players[0]] = [];
    this.reserved[this.players[1]] = [];
    [this.step] = this.players;
    if (this.endWait) {
      this.endWait();
    }
    return this;
  }

  getEnemyId(playerId) {
    return this.players[0] === playerId ? this.players[1] : this.players[0];
  }

  setWinner(playerId) {
    this.winState.win = this.players[0] === playerId ? 'x' : 'o';
    this.endGame();
  }

  endGame() {
    this.status = status.Ended;
  }

  getWinResult(cell, playerId) {
    const combs = getWinCombs(this.size, this.winLength, +cell);
    return toPairs(combs)
      .filter(([, seq]) => seq.length >= this.winLength)
      .map(([combName, seq]) => [
        combName,
        intersection(seq, this.reserved[playerId]),
      ])
      .reduce((result, [combName, playerStatus]) => {
        const combIndexes = sortedUniq(
          playerStatus.map(c => combs[combName].indexOf(c)),
        );
        const { isMatch, lastMatchIndex } = sequenceMatch(
          combIndexes,
          this.winLength,
        );
        if (isMatch) {
          return {
            comb: combs[combName].slice(
              combIndexes[lastMatchIndex - this.winLength + 1],
              combIndexes[lastMatchIndex] + 1,
            ),
            type: combName,
          };
        }
        return result;
      }, null);
  }

  reserveField(cell, playerId) {
    if (!this.isMyStep(playerId)) {
      throw new BadArgumentsError('Wait you enemy!');
    }
    if (this.isEnded()) {
      throw new GoneError('Game has ended!');
    }
    const spaceSide = this.size * this.size;
    if (cell < 1 || cell > spaceSide) {
      throw new BadArgumentsError('Bad cell index!');
    }
    const enemyId = this.getEnemyId(playerId);
    const isUnique =
      this.reserved[enemyId].indexOf(cell) === -1 &&
      this.reserved[playerId].indexOf(cell) === -1;
    if (!isUnique) {
      throw new BadArgumentsError('Bad cell index!');
    }
    this.reserved[playerId].push(+cell);
    this.step = enemyId;
    const reservedCellCount =
      this.reserved[playerId].length + this.reserved[enemyId].length;
    const winComb = this.getWinResult(cell, playerId);
    if (winComb) {
      this.setWinner(playerId);
      this.winState.info = winComb;
      return this.winState;
    }
    if (reservedCellCount === spaceSide) {
      this.endGame();
    }
  }
}
