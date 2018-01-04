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

function showGameOverMsg(side) {
  const wonTitle = document.querySelector('#won-title');
  const wonSide = document.querySelector('#won-title .message');
  const gameInfo = document.querySelector('#info-title');
  wonTitle.style.display = 'block';
  if (side === 'x') {
    wonSide.textContent = 'Crosses won!';
  } else if (side === 'o') {
    wonSide.textContent = 'Zero won!';
  } else {
    wonSide.textContent = 'It\'s a draw!';
  }
  gameInfo.style.display = 'none';
}

function showWhoMoves(step) {
  const msg = document.querySelector('#info-title .message');
  msg.textContent = step === 'x' ? 'Chross step!' : 'Zero step!';
}

function crossCellsForWin(comb, type) {
  comb.forEach((cell) => {
    document.querySelector(`[data-id='${cell}']`).classList.add('win', _.kebabCase(type));
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
      // debugger;
      if (!response.move) {
        // not my step, waiting for enemy step
        showWhoMoves(localStorage.getItem('side') === 'x' ? 'r' : 'x');
        setTimeout(subscribe, 300);
      } else {
        // my step
        // console.log(response);
        showWhoMoves(localStorage.getItem('side'));
        const prevMove = document.querySelector(`[data-id='${response.move}']`);
        prevMove.classList.add(localStorage.getItem('side') === 'x' ? 'r' : 'ch');
        if (response.win) {
          showGameOverMsg(response.win);
          if (response.info) {
            crossCellsForWin(response.info.comb, response.info.type);
          }
        }
      }
    })
    .catch((error) => {
      console.log(error);
      subscribe();
    });
}

function restoreMoves(movesObj) {
  Object.keys(movesObj).forEach((key) => {
    const cellClass = key === 'x' ? 'ch' : 'r';
    movesObj[key].forEach((element) => {
      document.querySelector(`[data-id='${element}']`).classList.add(cellClass);
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
    const moveId = event.target.dataset.id;
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
          // case (String(res.status).charAt(0)) == '2':
            cellClass = localStorage.getItem('side') === 'x' ? 'ch' : 'r';
            event.target.classList.add(cellClass);
            showWhoMoves(cellClass === 'ch' ? 'o' : 'x');
            subscribe();
            break;
          case 410:
            getGameState();
            break;
          default:
            errorMsg = document.querySelector('#alert');
            (res.message) ? errorMsg.textContent = res.message : errorMsg.textContent = 'Неизвестная ошибка';
            // Прекратить выполнение любой логики, связанной с игрой кроме кнопки новой игры
            break;
        }
        return res;
      })
      .then(response => response.json())
      .then(response => {
        // console.log(response);
        if (response.win) {
          showGameOverMsg(response.win);
          if (response.info) {
            crossCellsForWin(response.info.comb, response.info.type);
          }
          // localStorage.clear();
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
  })
    .then(response => {
      // console.log(response.status[0]);
      const errorMsg = document.querySelector('#alert');
      switch (String(response.status).charAt(0)) {
        case '2':
          getGameState();
          // console.log(response.json());
          localStorage.clear();
          document.location = 'game-list.html';
          break;
        default:
          (response.message) ? errorMsg.textContent = response.message : errorMsg.textContent = 'Неизвестная ошибка';
          break;
      }
      return response;
    });
}

function newGameBtnHandler() {
  localStorage.clear();
  document.location = 'game-list.html';
}

surrendBtn.addEventListener('click', surrendBtnHandler);
newGameBtn.addEventListener('click', newGameBtnHandler);


/*  TODO : restructure repeating code (from subscribe and cellEventHandler)

  if (response.win) {
    showGameOverMsg(response.win);
    if (response.info) {
      crossCellsForWin(response.info.comb, response.info.type);
    }
  }
*/
