const field = document.querySelector('#game-space');
const surrendBtn = document.querySelector('#surrend-btn');
const newGameBtn = document.querySelector('.restart-btn');
const ROWS_COUNT = 10;
const COLS_COUNT = 10;

function generateCols(row, colsCount, rowId) {
  for (let i = 1; i <= colsCount; i++) {
    const id = rowId * 10 + i;
    const col = document.createElement('div');
    col.id = `c-${id}`;
    col.dataset.index = id;
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

function showGameOverMsg(side) {
  const wonTitle = document.querySelector('#won-title');
  const wonSide = document.querySelector('#won-title .message');
  const gameInfo = document.querySelector('#info-title');
  wonTitle.style.display = 'block';
  if (side === 'x') {
    wonSide.textContent = 'Крест выиграл!';
  } else if (side === 'o') {
    wonSide.textContent = 'Ноль выиграл!';
  } else {
    wonSide.textContent = 'Ничья!';
  }
  gameInfo.style.display = 'none';
  field.removeEventListener('click', cellEventHandler);
}

function showWhoMoves(step) {
  const msg = document.querySelector('#info-title .message');
  // msg.textContent = step === 'x' ? 'Chross step!' : 'Zero step!';
  msg.textContent = step === 'x' ? 'Ваш ход' : 'Ожидайте!';
}

function crossCellsForWin(comb, type) {
  comb.forEach(cell => {
    document.querySelector(`[data-index='${cell}']`).classList.add('win', _.kebabCase(type));
  });
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
        // not my step, waiting for enemy step
        if (!response.ended) {
          // waiting
          showWhoMoves(localStorage.getItem('side') === 'x' ? 'r' : 'x');
          setTimeout(subscribe, 300);
        } else {
          showGameOverMsg(response.win);
        }
      } else {
        // my step
        showWhoMoves(localStorage.getItem('side'));
        const prevMove = document.querySelector(`[data-index='${response.move}']`);
        prevMove.classList.add(localStorage.getItem('side') === 'x' ? 'r' : 'ch');
        if (response.ended === true) {
          if (response.win !== null) {
            showGameOverMsg(response.win);
            if (response.info) {
              crossCellsForWin(response.info.comb, response.info.type);
            }
          } else {
            showGameOverMsg();
          }
        }
      }
    })
    .catch(error => {
      console.log(error);
      subscribe();
    });
}

function restoreMoves(movesObj) {
  Object.keys(movesObj).forEach(key => {
    const cellClass = key === 'x' ? 'ch' : 'r';
    // console.log(movesObj[key]);
    movesObj[key].forEach(element => {
      document.querySelector(`[data-index='${element}']`).classList.add(cellClass);
    });
  });
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
    .then(response => {
      showWhoMoves(response.step);
      if (response.step !== localStorage.getItem('side')) {
        subscribe();
      }
      if (response.ended === true) {
        if (response.win !== null) {
          showGameOverMsg(response.win);
          if (response.info) {
            crossCellsForWin(response.info.comb, response.info.type);
          }
        } else {
          showGameOverMsg();
        }
      }
      restoreMoves(response.reserved);
    });
}

getGameState();
generateRows(ROWS_COUNT, COLS_COUNT);

function cellEventHandler(event) {
  if (event.target.classList.contains('cell')) {
    const moveId = event.target.dataset.index;
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
        let cellClass = null;
        let errorMsg = null;
        switch (res.status) {
          case 200:
            cellClass = localStorage.getItem('side') === 'x' ? 'ch' : 'r';
            event.target.classList.add(cellClass);
            showWhoMoves(cellClass === 'ch' ? 'o' : 'x'); // waiting
            subscribe();
            break;
          case 410:
            getGameState();
            break;
          default:
            errorMsg = document.querySelector('#alert');
            res.message
              ? (errorMsg.textContent = res.message)
              : (errorMsg.textContent = 'Неизвестная ошибка');
            // Прекратить выполнение любой логики, связанной с игрой кроме кнопки новой игры
            break;
        }
        return res;
      })
      .then(response => response.json())
      .then(response => {
        if (response.win) {
          showGameOverMsg(response.win);
          if (response.info) {
            crossCellsForWin(response.info.comb, response.info.type);
          }
        }
      });
  }
}

field.addEventListener('click', cellEventHandler);

function surrendBtnHandler() {
  fetch('/surrender', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Player-ID': localStorage.getItem('Player-ID'),
      'Game-ID': localStorage.getItem('Game-ID'),
    },
  }).then(response => {
    const errorMsg = document.querySelector('#alert');
    switch (String(response.status).charAt(0)) {
      case '2':
        getGameState();
        break;
      default:
        response.message
          ? (errorMsg.textContent = response.message)
          : (errorMsg.textContent = 'Неизвестная ошибка');
        break;
    }
  });
}

function newGameBtnHandler() {
  localStorage.clear();
  document.location = 'game-list.html';
}

surrendBtn.addEventListener('click', surrendBtnHandler);
newGameBtn.addEventListener('click', newGameBtnHandler);
