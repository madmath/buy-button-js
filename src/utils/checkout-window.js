let checkoutWindow = null;
let checkoutOrigin = null;

function originFromUrl(url) {
  if (!url) {
    return null;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  if (!anchor.protocol || !anchor.hostname) {
    return null;
  }
  const isDefaultPort = (anchor.protocol === 'https:' && anchor.port === '443') ||
    (anchor.protocol === 'http:' && anchor.port === '80');
  const port = anchor.port && !isDefaultPort ? `:${anchor.port}` : '';
  return `${anchor.protocol}//${anchor.hostname}${port}`;
}

/**
 * Tracks the popup window BuyButton.js opened for checkout, so that `message`
 * events can be authenticated against it before the UI acts on them.
 */
const checkoutWindowTracker = {

  /**
   * record the window checkout was opened in and the URL it was sent to.
   * @param {Window} win - window returned by window.open (ignored if falsy or the current window).
   * @param {String} url - checkout URL the window was navigated to.
   */
  track(win, url) {
    if (!win || win === window) {
      return;
    }
    checkoutWindow = win;
    checkoutOrigin = originFromUrl(url);
  },

  /**
   * check that a message event was sent by the tracked checkout window, from the checkout origin
   * or the shop's configured domain.
   * @param {MessageEvent} msg - message event received by the host window.
   * @param {String} domain - shop domain configured on the client.
   * @return {Boolean} true when both source and origin are trusted.
   */
  isTrustedMessage(msg, domain) {
    if (!msg || !checkoutWindow || msg.source !== checkoutWindow || !msg.origin) {
      return false;
    }
    const trustedOrigins = [checkoutOrigin];
    if (domain) {
      trustedOrigins.push(originFromUrl(`https://${domain}`));
    }
    return trustedOrigins.indexOf(msg.origin) !== -1;
  },

  reset() {
    checkoutWindow = null;
    checkoutOrigin = null;
  },
};

export default checkoutWindowTracker;
