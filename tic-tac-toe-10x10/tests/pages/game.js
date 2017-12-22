const util = require('util');

const { API_URL = 'http://localhost:3000' } = process.env;

module.exports = {
  url: `${API_URL}/game.html`,
  elements: {
    cell: {
      selector: '.cell[data-index="%d"]',
    },
    reservedCell: {
      selector: '.cell.ch, .cell.r',
    },
    infoTitle: {
      selector: '#info-title .message:first-child',
    },
    gameSpace: {
      selector: '#game-space',
    },
    wonTitle: {
      selector: '#won-title .message:first-child',
    },
    surrendBtn: {
      selector: '#surrend-btn',
    },
    returnBtn: {
      selector: '#won-title > a',
    },
  },
  commands: [
    {
      cell(index) {
        return util.format(this.elements.cell.selector, index);
      },
    },
  ],
};
