const rowSize = 10;

function checkInitialGameState(page, client) {
  client.expect.element('#alert').to.be.not.visible;
  page.expect.element('@gameSpace').to.be.visible;
  page.expect.element('@wonTitle').to.be.not.visible;
  page.expect.element('@infoTitle').to.be.visible;
  page.expect.element('@surrendBtn').to.be.visible;
  page.expect.element('@surrendBtn').text.to.be.equals('Сдаться');
  page.expect.element(page.cell(rowSize * rowSize)).to.be.visible;
  page.expect.element('@reservedCell').to.be.not.present;
  client.url(result => {
    // console.log(result);
    const [, side] = /side=(x|o)/gi.exec(result.value);
    page.expect.element('@infoTitle').text.to.equal(side === 'x' ? 'Ваш ход' : 'Ожидайте');
  });
}

const defaultPostCheck = (client, side) => {
  const page = client.page.game();
  page.expect.element('@wonTitle').to.be.visible;
  page.expect.element('@wonTitle').text.to.equal(side === 'x' ? 'Крест выиграл!' : 'Ноль выиграл!');
  page.expect
    .element('@gameSpace')
    .to.have.attribute('disabled')
    .equals('true');
  page.expect.element('@returnBtn').to.be.visible;
  page.click('@returnBtn');
  client.waitForUrl('/game-list.html', 500);
};

const drawPostChecker = client => {
  const page = client.page.game();
  page.waitForElementPresent('@wonTitle', 500);
  page.expect
    .element('@gameSpace')
    .to.have.attribute('disabled')
    .equals('true');
  client.waitForElementText('#won-title .message:first-child', 'Ничья', 500);
};

const checkDidntWin = client => {
  client.page.game().expect.element('@wonTitle').to.be.not.visible;
};

function checkGame(client, options) {
  const { checkAlert = defaultPostCheck } = options;
  client.url(result => {
    const [, side] = /side=(x|o)/gi.exec(result.value);
    client.play(options);
    checkAlert(client, side);
  });
}

function checkSurrend(client, side) {
  const page = client.page.game();
  if (side === 'x') {
    page.click('@surrendBtn');
  } else {
    client.surrendBot();
    page.click(page.cell(1));
  }
  page.waitForElementText('@wonTitle', side === 'x' ? 'Ноль выиграл!' : 'Крест выиграл!', 200);
  page.expect.element('@surrendBtn').to.be.not.visible;
  page.expect
    .element('@gameSpace')
    .to.have.attribute('disabled')
    .equals('true');
  page.click('@returnBtn');
  client.waitForUrl('/game-list.html', 500);
}

function checkMultiMove(page) {
  page.click(page.cell(1));
  page.click(page.cell(2));
  page.click(page.cell(3));
}

function checkDoubleReserve(page, client) {
  page.click(page.cell(1));
  client.waitForElementText('#info-title > .message:first-child', 'Ожидайте', 500);
  client.makeBotMove(2);
  client.waitForElementText('#info-title > .message:first-child', 'Ваш ход', 500);
  page.click(page.cell(2));
}

function moveErrorHandling(client) {
  const error = { status: 403, message: 'Test error text' };
  const page = client.page.game();
  client.createOwnGame();
  client.throws(error);
  page.click(page.cell(1));
  client.waitForElementVisible('#alert', 200);
  client.assert.cssClassPresent('#alert', 'error');
  client.expect.element('#alert').text.to.be.equal(error.message);
  client.removeError();
}

function moveUnkonwErrorHandling(client) {
  const page = client.page.game();
  client.createOwnGame();
  client.throws({ status: 403 });
  page.click(page.cell(1));
  client.waitForElementVisible('#alert', 200);
  client.assert.cssClassPresent('#alert', 'error');
  client.expect.element('#alert').text.to.be.equal('Неизвестная ошибка');
  client.removeError();
}
module.exports = {
  beforeEach: client => {
    client.createOwnGame();
  },
  'Check initial game state': client => {
    checkInitialGameState(client.page.game(), client);
    client.end();
  },
  'Check multi move for cell': client => {
    checkMultiMove(client.page.game());
    client.end();
  },
  'Check multi cell reserve': client => {
    checkDoubleReserve(client.page.game(), client);
    client.end();
  },
  'Check horizontal win': client => {
    checkGame(client, { pattern: i => i + 4, endPredicate: i => i !== 3 });
    client.end();
  },
  'Check vertical win': client => {
    checkGame(client, {
      pattern: i => (i + 1) * rowSize,
      endPredicate: i => i !== 3,
    });
    client.end();
  },
  'Check right diagonal win': client => {
    checkGame(client, {
      pattern: i => (i + 1) * rowSize + i + 1,
      endPredicate: i => i !== 3,
    });
    client.end();
  },
  'Check left diagonal win': client => {
    checkGame(client, {
      pattern: i => (i + 1) * rowSize - i - 1,
      endPredicate: i => i !== 3,
    });
    client.end();
  },
  'Check horizontal boundery condition': client => {
    checkGame(client, {
      pattern: i => i + rowSize - 2,
      endPredicate: i => i !== 3,
      checkAlert: checkDidntWin,
    });
    client.end();
  },
  'Check right diagonal boundery condition': client => {
    checkGame(client, {
      pattern: i => (i + 1) * rowSize + i + rowSize - 2,
      endPredicate: i => i !== 3,
      checkAlert: checkDidntWin,
    });
    client.end();
  },
  'Check left diagonal boundery condition': client => {
    checkGame(client, {
      pattern: i => (i + 1) * rowSize - i - rowSize + 3,
      endPredicate: i => i !== 3,
      checkAlert: checkDidntWin,
    });
    client.end();
  },
  'Check draw': client => {
    checkGame(client, {
      pattern: i => (Math.floor((i - 1) / rowSize) % 4 <= 1 ? i : i + 1),
      enemyPattern: i => (Math.floor((i - 1) / rowSize) % 4 <= 1 ? i + 1 : i),
      iterationCount: rowSize * rowSize,
      checkAlert: drawPostChecker,
      delta: 2,
    });
    client.end();
  },
  'Check surrend by owner': client => {
    checkSurrend(client, 'x');
    client.end();
  },
  'Check surrend by player': client => {
    checkSurrend(client, 'o');
    client.end();
  },
  'Check move error': client => {
    moveErrorHandling(client);
    client.end();
  },
  'Check unknow move error': client => {
    moveUnkonwErrorHandling(client);
    client.end();
  },
};
