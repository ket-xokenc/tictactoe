const socket = io('/games');


// socket.on('connect', () => {
//   // alert('Соединение установлено.');
// });

let counter = 1;

socket.on('add', gameId => {
  const gameList = document.querySelector('#game-list');
  const newGameEl = document.createElement('li');
  const newGameLnk = document.createElement('a');
  newGameEl.classList.add('simple-list-item', 'link-item');
  newGameLnk.setAttribute('href', '#');
  newGameLnk.setAttribute('id', gameId.id);
  newGameLnk.innerHTML = `Room ${counter}`;
  newGameEl.appendChild(newGameLnk);
  newGameLnk.addEventListener('click', joinTheGame);
  gameList.appendChild(newGameEl);
  counter++;
  // gameId.id;

  // console.log(newGameId);
  // alert(`Получены данные ${JSON.stringify(game, null, 2)}`);
});

socket.on('remove', gameId => {
  //  {action: 'remove', id: '345678'} - удалить из списка "Существующие игры" игру с id ”345678". Она просто должна исчезнуть
  // const gameList = document.querySelector('#game-list');
  // gameList.removeChild.document.querySelector(`#${gameId}`).parentNode;
});

socket.on('startGame', (game) => {
  document.location = 'game.html';
  localStorage.setItem('side', game.side);
});

socket.on('exception', error => {
  //  {action: 'exception', message: 'message'} - вы делаете что-то не так и веб сервер сообщает Вам об этом.
  alert(`Ошибка ${error.message}`);
});

const createGameBtn = document.querySelector('#create-game');

function createGameHandler() {
  fetch('/newGame', { method: 'POST' })
    .then(response => response.json())
    .then(response => {
      // response.json();
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
        if (res.status >= 400 && res.status !== 410) {
          const errorMsg = document.querySelector('#alert');
          errorMsg.innerHTML = 'Неизвестная ошибка старта игры';
        } else if (res.status === 410) {
          const errorMsg = document.querySelector('#alert');
          errorMsg.style.display = 'block';
          errorMsg.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
        } else if (res.status >= 200 && res.status < 300) {

          // display first player step
        }
      });
    })
    .then(() => {})
    .catch(err => {
      const errorMsg = document.querySelector('#alert');
      errorMsg.innerHTML = 'Ошибка создания игры';
      createGameBtn.removeAttribute('disabled');
    });

  createGameBtn.setAttribute('disabled', true);
}

createGameBtn.addEventListener('click', createGameHandler);

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
