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
      showWhoMoves(response.step);
    });
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
    console.log(localStorage.getItem('Player-ID'));
    console.log(localStorage.getItem('Game-ID'));
    console.log(moveId);
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
        console.log(res.status);
        if (res.status === 200) {
          const cellClass = localStorage.getItem('side') === 'x' ? 'ch' : 'r';
          event.target.classList.add(cellClass);
        } else if (res.status === 410) {
          getGameState();
        } else if (res.status >= 400 && res.status !== 410) {
          const errorMsg = document.querySelector('#alert');
          (res.message) ? errorMsg.textContent = res.message : errorMsg.textContent = 'Неизвестная ошибка';

          // Прекратить выполнение любой логики, связанной с игрой кроме кнопки новой игры
        }
      });
  }
}

function subscribe() {
  fetch('/move', {
    method: 'GET',
  })
  .then(response => response.json())
    .then(response => {

      console.log(response);
      if (response.win) {
        // вывести сообщение о победе
        if (response.info) { // и, если в ответе есть поле info
          // отобразить комбинацию перечеркиванием ячеек(комбинация и ее тип содержатся в поле info: { comb: [], type: 'COMB-TYP' }). Игра выиграна кем-то.
        }
      }
    })
    .catch(() => {
      subscribe();
    });
}
subscribe();
