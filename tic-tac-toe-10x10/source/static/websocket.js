const socket = io('/games');

let counter = 1;

function joinTheGame(event) {
  event.preventDefault();
  const roomId = event.target.getAttribute('id');
  localStorage.setItem('Player-ID', socket.id);
  localStorage.setItem('Game-ID', roomId);
  fetch('/gameReady', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId: socket.id, gameId: roomId }),
  });
}

socket.on('add', gameId => {
  const gameList = document.querySelector('#game-list');
  const newGameEl = document.createElement('li');
  const newGameLnk = document.createElement('a');
  newGameEl.classList.add('simple-list-item', 'link-item', 'new');
  newGameLnk.setAttribute('href', '#');
  newGameLnk.setAttribute('id', gameId.id);
  newGameLnk.innerHTML = `Room ${counter}`;
  newGameEl.appendChild(newGameLnk);
  newGameLnk.addEventListener('click', joinTheGame);
  gameList.appendChild(newGameEl);
  counter++;
});

socket.on('remove', gameId => {
  //  {action: 'remove', id: '345678'} - удалить из списка "Существующие игры"
  // игру с id ”345678". Она просто должна исчезнуть
  const gameList = document.querySelector('#game-list');
  gameList.removeChild.document.querySelector(`#${gameId.id}`).parentNode;
});

socket.on('startGame', game => {
  document.location = 'game.html';
  localStorage.setItem('side', game.side);
});

socket.on('exception', error => {
  //  {action: 'exception', message: 'message'} - вы делаете что-то не так и веб
  // сервер сообщает Вам об этом.
  const errorMsg = document.querySelector('#alert');
  if (error.message) {
    errorMsg.style.display = 'block';
    errorMsg.textContent = error.message;
  } else {
    errorMsg.innerHTML = 'Неизвестная ошибка';
  }
});

const createGameBtn = document.querySelector('#create-game');

function createGameHandler() {
  fetch('/newGame', { method: 'POST' })
    .then(response => response.json())
    .then(response => {
      const loadMsg = document.querySelector('#modal-wrap');
      loadMsg.style.display = 'block';
      localStorage.setItem('Player-ID', socket.id);
      localStorage.setItem('Game-ID', response.yourId);
      return fetch('/gameReady', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: socket.id, gameId: response.yourId }),
      }).then(res => {
        const errorMsg = document.querySelector('#alert');
        // if (res.status === 410) {
        //   errorMsg.style.display = 'block';
        //   errorMsg.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
        // } else {
        //   errorMsg.style.display = 'block';
        //   errorMsg.innerHTML = 'Неизвестная ошибка старта игры';
        // }

        switch (res.status) {
          case 410:
            errorMsg.style.display = 'block';
            errorMsg.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
            break;
          default:
            errorMsg.style.display = 'block';
            errorMsg.innerHTML = 'Неизвестная ошибка старта игры';
        }
      });
    })
    // .then(() => {})
    .catch(() => {
      const errorMsg = document.querySelector('#alert');
      errorMsg.innerHTML = 'Ошибка создания игры';
      createGameBtn.removeAttribute('disabled');
    });

  createGameBtn.setAttribute('disabled', true);
}

createGameBtn.addEventListener('click', createGameHandler);
