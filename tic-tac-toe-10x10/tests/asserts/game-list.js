const testErrorMessage = 'test exception';

function checkInitialState(page) {
  page.expect.element('@title').to.be.visible;
  page.expect.element('@title').text.to.equal('Существующие игры');
  page.expect.element('@createGameButton').to.be.visible;
  page.expect.element('@createGameButton').text.to.equal('Создать игру');
  page.expect.element('@gameList').to.be.visible;
  page.expect.element('@modalWrap').to.be.not.visible;
}

function checkLobbyCreating(page) {
  page.click('@createGameButton');
  page.expect
    .element('@createGameButton')
    .to.have.attribute('disabled')
    .equals('true');
  page.waitForElementVisible('@lastGame', 500);
}

function checkWaitingModal(page) {
  page.waitForElementVisible('@modalWrap', 200);
  page.expect.element('@modalTitle').text.to.equal('Ожидаем начала игры');
}

function checkExceptionHandling(client) {
  client.throws({ message: testErrorMessage, type: 'socket' });
  client.waitForElementVisible('#alert', 200);
  client.assert.cssClassPresent('#alert', 'error');
  client.expect.element('#alert').text.to.be.equal(testErrorMessage);
}

function checkStartGameByOwner(page, client) {
  client.createOwnGame();
}

function checkStartGameBySecondPlayer(client) {
  client.subscribeOnGame();
}

function checkHandlingGoneError(client) {
  client.throws({ status: 410 });
  client.page.gameList().click('@createGameButton');
  client.waitForElementVisible('#alert', 200);
  client.assert.cssClassPresent('#alert', 'error');
  client.expect
    .element('#alert')
    .text.to.be.equal('Ошибка старта игры: другой игрок не ответил');
  client.removeError();
}

function checkHandlingOtherNewGameError(client) {
  client.throws({ status: 403 });
  client.page.gameList().click('@createGameButton');
  client.waitForElementVisible('#alert', 200);
  client.assert.cssClassPresent('#alert', 'error');
  client.expect
    .element('#alert')
    .text.to.be.equal('Неизвестная ошибка старта игры');
  client.removeError();
}

function checkRemoveGame(page, client) {
  client.subscribeOnGame();
  page.waitForElementNotPresent('@lastGame', 300);
}

module.exports = {
  'Check initial lobby state elements': client => {
    const page = client.page.gameList();
    page.navigate();
    checkInitialState(page, client);
    checkLobbyCreating(page, client);
    checkWaitingModal(page, client);
    client.end();
  },
  'Check start game by game owner': client => {
    const page = client.page.gameList();
    page.navigate();
    checkStartGameByOwner(page, client);
    client.end();
  },
  'Check start game by second player': client => {
    const page = client.page.gameList();
    page.navigate();
    checkStartGameBySecondPlayer(page, client);
    client.end();
  },
  'Check remove game': client => {
    const page = client.page.gameList();
    page.navigate();
    checkRemoveGame(page, client);
    client.end();
  },
  'Check exception handling': client => {
    const page = client.page.gameList();
    page.navigate();
    checkExceptionHandling(page, client);
    client.end();
  },
  'Check create game error handling': client => {
    const page = client.page.gameList();
    page.navigate();
    checkHandlingGoneError(client);
    client.end();
  },
  'Check unkonw create game error handling': client => {
    const page = client.page.gameList();
    page.navigate();
    checkHandlingOtherNewGameError(client);
    client.end();
  },
};
