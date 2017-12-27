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
  newGameLnk.setAttribute('href', gameId.id);
  newGameLnk.innerHTML = `Room ${counter}`;
  newGameEl.appendChild(newGameLnk);
  newGameLnk.addEventListener('click', joinTheGame);
  gameList.appendChild(newGameEl);
  counter++;
  // gameId.id;

  // console.log(newGameId);
  // alert(`Получены данные ${JSON.stringify(game, null, 2)}`);
});

socket.on('remove', event => {});

socket.on('startGame', () => {
  document.location = 'game.html';
});

socket.on('exception', error => {
  alert(`Ошибка ${error.message}`);
});

const startGameBtn = document.querySelector('#create-game');

function startGameHandler() {
  fetch('/newGame', { method: 'POST' })
    .then(response => response.json())
    .then(userId => {
      const loadMsg = document.querySelector('#modal-wrap');
      loadMsg.style.display = 'block';
      return fetch('/gameReady', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerId: socket.id, gameId: userId.yourId }),
      }).then(res => {
        if (res.status >= 400 && res.status !== 410) {
          const errorMsg = document.querySelector('#alert');
          errorMsg.innerHTML = 'Неизвестная ошибка старта игры';
        } else if (res.status === 410) {
          const errorMsg = document.querySelector('#alert');
          errorMsg.style.display = 'block';
          errorMsg.innerHTML = 'Ошибка старта игры: другой игрок не ответил';
        } else if (res.status >= 200 && res.status < 300) {
          console.log(res.text());
        }
      });
    })
    .then(() => {})
    .catch(err => {
      const errorMsg = document.querySelector('#alert');
      errorMsg.innerHTML = 'Ошибка создания игры';
      startGameBtn.removeAttribute('disabled');
    });

  startGameBtn.setAttribute('disabled', true);
}

startGameBtn.addEventListener('click', startGameHandler);

function joinTheGame(event) {
  event.preventDefault();
  const roomId = event.target.getAttribute('href');
  fetch('/gameReady', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerId: socket.id, gameId: roomId }),
  });
  // console.log((playerId: socket.id), (gameId: roomId));
}
