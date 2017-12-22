const util = require('util');
const events = require('events');

const TIMEOUT_RETRY_INTERVAL = 50;

function WaitForText() {
  events.EventEmitter.call(this);
  this.startTimeInMilliseconds = null;
}

util.inherits(WaitForText, events.EventEmitter);

WaitForText.prototype.check = function check(element, url, callback, maxTimeInMilliseconds) {
  this.api.getText(element, result => {
    const now = new Date().getTime();
    if (result.status === 0 && url === result.value) {
      callback(true, now);
    } else if (now - this.startTimeInMilliseconds < maxTimeInMilliseconds) {
      setTimeout(() => {
        this.check(element, url, callback, maxTimeInMilliseconds);
      }, TIMEOUT_RETRY_INTERVAL);
    } else {
      callback(false, maxTimeInMilliseconds, result.value);
    }
  });
};

WaitForText.prototype.command = function command(element, text, timeoutInMilliseconds) {
  this.startTimeInMilliseconds = new Date().getTime();
  this.check(
    element,
    text,
    (result, loadedTimeInMilliseconds, actualText) => {
      const message = result
        ? `waitForUrl: ${text}. Expression wasn true in ${timeoutInMilliseconds} ms.`
        : `waitForUrl: ${text}. Expression wasn't true in ${timeoutInMilliseconds} ms.`;
      this.client.assertion(result, actualText, text, message, true);
      this.emit('complete');
    },
    timeoutInMilliseconds,
  );

  return this;
};

module.exports = WaitForText;
