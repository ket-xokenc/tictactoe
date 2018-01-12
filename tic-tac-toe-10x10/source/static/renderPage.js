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

function showErrorMsg(response) {
  const errorMsg = document.querySelector('#alert');
  errorMsg.classList.add('error');
  response.message
    ? (errorMsg.textContent = response.message)
    : (errorMsg.textContent = 'Неизвестная ошибка');
  errorMsg.style.display = 'block';
}

function showGameOverMsg(side) {
  const wonTitle = document.querySelector('#won-title');
  const wonSide = document.querySelector('#won-title .message');
  const gameInfo = document.querySelector('#info-title');

  field.setAttribute('disabled', true);
  wonTitle.style.display = 'block';
  if (side === 'x') {
    wonSide.textContent = 'Крест выиграл!';
  } else if (side === 'o') {
    wonSide.textContent = 'Ноль выиграл!';
  } else {
    wonSide.textContent = 'Ничья';
  }
  gameInfo.style.display = 'none';
  field.removeEventListener('click', cellEventHandler);
}

function crossCellsForWin(comb, type) {
  comb.forEach(cell => {
    document.querySelector(`[data-index='${cell}']`).classList.add('win', _.kebabCase(type));
  });
}

function checkWinState(response) {
  if (response.ended) {
    if (response.win !== null) {
      showGameOverMsg(response.win);
      if (response.info) {
        crossCellsForWin(response.info.comb, response.info.type);
      }
    } else {
      // it's a draw
      showGameOverMsg();
    }
  }
}

function showWhoMoves(step) {
  const msg = document.querySelector('#info-title .message');
  msg.textContent = step === true ? 'Ваш ход' : 'Ожидайте';
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
          showWhoMoves(false);
          setTimeout(subscribe, 300);
        } else {
          showGameOverMsg(response.win);
        }
      } else {
        // my step
        showWhoMoves(true);
        field.addEventListener('click', cellEventHandler);
        const prevMove = document.querySelector(`[data-index='${response.move}']`);
        const side = getSideFromUrl();
        prevMove.classList.add(side === 'x' ? 'r' : 'ch');
        checkWinState(response);
      }
    })
    .catch(() => {
      subscribe();
    });
}

function restoreMoves(movesObj) {
  Object.keys(movesObj).forEach(key => {
    const cellClass = key === 'x' ? 'ch' : 'r';
    movesObj[key].forEach(element => {
      document.querySelector(`[data-index='${element}']`).classList.add(cellClass);
    });
  });
}

function getSideFromUrl() {
  const url = new URL(document.location);
  if (url.search.indexOf('side=') !== -1) {
    const side = url.search[url.search.length - 1];
    return side;
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
    .then(response => {
      const side = getSideFromUrl();
      if (response.step !== side) {
        // not my step, waiting
        showWhoMoves(false);
        subscribe();
      } else {
        showWhoMoves(true);
      }
      // the game is over
      if (response.ended === true) {
        // it's not a draw
        if (response.win !== null) {
          showGameOverMsg(response.win);
          if (response.info) {
            crossCellsForWin(response.info.comb, response.info.type);
          }
        } else {
          // it's a draw
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
      .then(response => {
        let cellClass = null;
        const errorMsg = document.querySelector('#alert');
        const side = getSideFromUrl();
        switch (response.status) {
          case 200:
            cellClass = side === 'x' ? 'ch' : 'r';
            event.target.classList.add(cellClass);
            showWhoMoves(false); // waiting
            errorMsg.style.display = 'none';
            subscribe();
            break;
          case 410:
            getGameState();
            break;
          default:
            response.json().then(res => {
              showErrorMsg(res);
            });
            break;
        }
        return response;
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
    switch (String(response.status).charAt(0)) {
      case '2':
        getGameState();
        break;
      default:
        showErrorMsg(response);
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
