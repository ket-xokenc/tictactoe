export function compose(...fns) {
  return initialArgument => fns.reduceRight((result, fn) => fn(result), initialArgument);
}

export function reverseArgs(fn) {
  return (...args) => fn(...args.reverse());
}

export function not(predicate) {
  return (...args) => !predicate(...args);
}

export function isNextRow(rowSize, previousCell, currentCell) {
  const currentRow = ((currentCell - 1) / rowSize) | 0;
  const previousRow = ((previousCell - 1) / rowSize) | 0;
  return currentRow - previousRow === 1;
}

export function sequenceMatch(combination, matchEtalon) {
  let match = 1;
  let lastMatchIndex = -1;
  for (let i = 1; i < combination.length && match < matchEtalon; i++) {
    const isNext = combination[i] - combination[i - 1] === 1;
    lastMatchIndex = isNext ? i : lastMatchIndex;
    match = isNext ? match + 1 : 1;
  }
  return {
    isMatch: match === matchEtalon,
    lastMatchIndex,
  };
}

export function timeout(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
