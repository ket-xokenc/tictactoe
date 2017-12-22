const util = require('util');
const events = require('events');

const TIMEOUT_RETRY_INTERVAL = 50;

function WaitForUrl() {
  events.EventEmitter.call(this);
  this.startTimeInMilliseconds = null;
}

util.inherits(WaitForUrl, events.EventEmitter);

WaitForUrl.prototype.check = function check(url, callback, maxTimeInMilliseconds) {
  this.api.url(result => {
    const now = new Date().getTime();
    if (result.status === 0 && result.value.indexOf(url) !== -1) {
      callback(true, now);
    } else if (now - this.startTimeInMilliseconds < maxTimeInMilliseconds) {
      setTimeout(() => {
        this.check(url, callback, maxTimeInMilliseconds);
      }, TIMEOUT_RETRY_INTERVAL);
    } else {
      callback(false, maxTimeInMilliseconds, result.value);
    }
  });
};

WaitForUrl.prototype.command = function command(url, timeoutInMilliseconds) {
  this.startTimeInMilliseconds = new Date().getTime();
  this.check(
    url,
    (result, loadedTimeInMilliseconds, actualUrl) => {
      const message = result
        ? `waitForUrl: ${url}. Expression wasn true in ${timeoutInMilliseconds} ms.`
        : `waitForUrl: ${url}. Expression wasn't true in ${timeoutInMilliseconds} ms.`;
      this.client.assertion(result, actualUrl, url, message, true);
      this.emit('complete');
    },
    timeoutInMilliseconds,
  );

  return this;
};

module.exports = WaitForUrl;
