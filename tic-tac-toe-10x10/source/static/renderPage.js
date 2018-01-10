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

function showWhoMoves(step) {
  const msg = document.querySelector('#info-title .message');
  // msg.textContent = step === 'x' ? 'Chross step!' : 'Zero step!';
  msg.textContent = step === true ? 'Ваш ход' : 'Ожидайте';
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
          showWhoMoves(false);
          // field.removeEventListener('click', cellEventHandler);
          setTimeout(subscribe, 300);
        } else {
          showGameOverMsg(response.win);
        }
      } else {
        // my step
        showWhoMoves(true);
        field.addEventListener('click', cellEventHandler);
        const prevMove = document.querySelector(`[data-index='${response.move}']`);
        const url = new URL(document.location);
        if (url.search.indexOf('side=') !== -1) {
          const side = url.search[url.search.length - 1];
          prevMove.classList.add(side === 'x' ? 'r' : 'ch');
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
      const url = new URL(document.location);
      if (url.search.indexOf('side=') !== -1) {
        const side = url.search[url.search.length - 1];
        if (response.step !== side) {
          showWhoMoves(false);
          // disable field
          // field.removeEventListener('click', cellEventHandler);
          subscribe();
        } else {
          // field.addEventListener('click', cellEventHandler);
          showWhoMoves(true);
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
        console.log(res);
        let cellClass = null;
        let errorMsg = null;
        let side = null;
        // const response = null;
        const url = new URL(document.location);
        if (url.search.indexOf('side=') !== -1) {
          side = url.search[url.search.length - 1];
        }
        switch (res.status) {
          case 200:
            cellClass = side === 'x' ? 'ch' : 'r';
            event.target.classList.add(cellClass);
            showWhoMoves(false); // waiting
            // disable field
            // field.removeEventListener('click', cellEventHandler);
            subscribe();
            break;
          case 410:
            getGameState();
            break;
          default:
            // response = res.json();
            // console.log(res);
            errorMsg = document.querySelector('#alert');
            errorMsg.classList.add('error');
            res.json().then(response => {
              // console.log(response.message);
              response.message
                ? (errorMsg.textContent = response.message)
                : (errorMsg.textContent = 'Неизвестная ошибка');
            });
            errorMsg.style.display = 'block';
            // res.message
            //   ? (errorMsg.textContent = res.message)
            //   : (errorMsg.textContent = 'Неизвестная ошибка');
            // Прекратить выполнение любой логики, связанной с игрой кроме кнопки новой игры
            break;
        }
        return res;
      })
      .then(response => response.json())
      .then(response => {
        // const errorMsg = document.querySelector('#alert');
        // errorMsg.classList.add('error');
        // errorMsg.style.display = 'block';
        // response.message
        //   ? (errorMsg.textContent = response.message)
        //   : (errorMsg.textContent = 'Неизвестная ошибка');
        console.log(response);
        // console.log(response.message);
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
