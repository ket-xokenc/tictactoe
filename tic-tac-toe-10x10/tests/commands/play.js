const defaultEnemyPattern = i => i;

exports.command = function play({
  pattern,
  side = 'x',
  iterationCount = 3,
  endPredicate = () => true,
  enemyPattern = defaultEnemyPattern,
  delta = 1,
}) {
  const client = this;
  const page = client.page.game();
  const isFirst = side === 'x';
  const infoTitle = '#info-title > .message:first-child';
  for (let i = 1; i <= iterationCount; i += delta) {
    this.waitForElementText(infoTitle, isFirst ? 'Ваш ход' : 'Ожидайте', 500);
    if (isFirst) {
      page.click(page.cell(pattern(i)));
    } else {
      client.makeBotMove(pattern(i));
    }
    if (endPredicate(i)) {
      this.waitForElementText(infoTitle, isFirst ? 'Ожидайте' : 'Ваш ход', 500);
      if (isFirst) {
        client.makeBotMove(enemyPattern(i));
      } else {
        page.click(page.cell(enemyPattern(i)));
      }
    }
  }
  return this;
};
