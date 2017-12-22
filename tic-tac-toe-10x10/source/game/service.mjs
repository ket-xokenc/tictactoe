import { not, isNextRow } from '../utils';

function getWinCombBy(combPattern, combPredicate = () => true, rowSize, combLength, initialCell) {
  const combination = [initialCell];
  for (let i = 1; i < combLength; i++) {
    const [mbFirstCell, mbLastCell] = combPattern(i, rowSize, initialCell);
    const [firstIsValid, lastIsValid] = [
      combPredicate(rowSize, mbFirstCell, combination[0]),
      combPredicate(rowSize, combination[combination.length - 1], mbLastCell),
    ];
    if (firstIsValid) {
      combination.unshift(mbFirstCell);
    }
    if (lastIsValid) {
      combination.push(mbLastCell);
    }
  }
  return combination;
}

const horizontalComb = getWinCombBy.bind(
  null,
  (step, _, cell) => [cell - step, cell + step],
  not(isNextRow),
);
const verticalComb = getWinCombBy.bind(
  null,
  (step, rowSize, cell) => [cell - step * rowSize, cell + step * rowSize],
  undefined,
);
const diagonalLeftComb = getWinCombBy.bind(
  null,
  (step, rowSize, cell) => [cell + (step - step * rowSize), cell - (step - step * rowSize)],
  isNextRow,
);
const diagonalRightComb = getWinCombBy.bind(
  null,
  (step, rowSize, cell) => [cell - (step + step * rowSize), cell + (step + step * rowSize)],
  isNextRow,
);

export function getWinCombs(rowSize, winLength, cell) {
  return {
    horizontal: horizontalComb(rowSize, winLength, cell),
    vertical: verticalComb(rowSize, winLength, cell),
    diagonalRight: diagonalRightComb(rowSize, winLength, cell),
    diagonalLeft: diagonalLeftComb(rowSize, winLength, cell),
  };
}
