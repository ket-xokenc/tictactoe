const { API_URL = 'http://localhost:3000' } = process.env;

module.exports = {
  url: `${API_URL}/game-list.html`,
  elements: {
    title: {
      selector: '#title',
    },
    createGameButton: {
      selector: '#create-game',
    },
    gameList: {
      selector: '#game-list',
    },
    lastGame: {
      selector: '#game-list > .simple-list-item.new:last-child > a',
    },
    modalWrap: {
      selector: '#modal-wrap',
    },
    modalTitle: {
      selector: '#modal-wrap .title:first-child',
    },
  },
};
