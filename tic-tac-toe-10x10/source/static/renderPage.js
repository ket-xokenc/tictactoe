const field = document.querySelector('#game-space');
const ROWS_COUNT = 10;
const COLS_COUNT = 10;

function generateCols(row, colsCount, rowId) {
  for (let i = 1; i <= colsCount; i++) {
    const id = rowId * 10 + i;
    const col = document.createElement('div');
    col.id = `c-${id}`;
    col.dataset.id = id;
    col.className = 'cell';
    row.appendChild(col);
  }
}

function generateRows(rowsCount, colsCount) {
  for (let i = 0; i < rowsCount; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    generateCols(row, colsCount, i);
    field.appendChild(row);
  }
}

function getGameState() {
  fetch('/game', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Player-ID': localStorage.getItem('Player-ID'),
      'Game-ID': localStorage.getItem('Game-ID'),
    },
  })
    .then(response => response.json())
    .then((response) => {
      if (response.ended === true) {
        console.log('game over');
      }
      console.log(response);
      return response;
    })
    .then(response => {
      showWhoMoves(response.step);
      if (response.step !== localStorage.getItem('side')) {
        subscribe();
      }
    });
  // если в ответе содержится поле ended: true, показать выигравшую сторону и условие выигрыша, или, если поле win: null - показать 'Ничью'.
}

document.addEventListener('DOMContentLoaded', () => {
  getGameState();
  generateRows(ROWS_COUNT, COLS_COUNT);
});

function showWhoMoves(step) {
  const msg = document.querySelector('#info-title .message');
  msg.textContent = step === 'x' ? 'Chross step!' : 'Zero step!';
}

field.addEventListener('click', cellEventHandler);

function cellEventHandler(event) {
  if (event.target.classList.contains('cell')) {
    const moveId = event.target.dataset.id;
    // console.log(localStorage.getItem('Player-ID'));
    // console.log(localStorage.getItem('Game-ID'));
    // console.log(moveId);
    // getGameState();
    fetch('/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Player-ID': localStorage.getItem('Player-ID'),
        'Game-ID': localStorage.getItem('Game-ID'),
      },
      body: JSON.stringify({ move: moveId }),
    })
      .then(res => {
        // console.log(res.status);
        if (res.status === 200) {
          const cellClass = localStorage.getItem('side') === 'x' ? 'ch' : 'r';
          event.target.classList.add(cellClass);

          // if (response.win) {
          //   response.win === 'x' ? alert('chrosses won') : 'zero won';
          // }
          showWhoMoves(cellClass === 'ch' ? 'o' : 'x');
          subscribe();
        } else if (res.status === 410) {
          getGameState();
        } else if (res.status >= 400 && res.status !== 410) {
          const errorMsg = document.querySelector('#alert');
          (res.message) ? errorMsg.textContent = res.message : errorMsg.textContent = 'Неизвестная ошибка';

          // Прекратить выполнение любой логики, связанной с игрой кроме кнопки новой игры
        }
        return res;
      })
      .then(response => response.json())
      .then(response => {
        if (response.win) {
          response.win === 'x' ? console.log('crosses won') : console.log('zero won');
          console.log(response);
        }
      });
  }
}

function subscribe() {
  fetch('/move', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Player-ID': localStorage.getItem('Player-ID'),
      'Game-ID': localStorage.getItem('Game-ID'),
    },
  })
    .then(response => response.json())
    .then(response => {
      if (!response.move) {
        subscribe();
      } else {
        // console.log(response);
        const prevMove = document.querySelector(`[data-id='${response.move}']`);
        prevMove.classList.add(localStorage.getItem('side') === 'x' ? 'r' : 'ch');
      }
    })
    .catch((error) => {
      console.log(error);
      subscribe();

    });
}
// subscribe();
