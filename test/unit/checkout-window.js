import checkoutWindowTracker from '../../src/utils/checkout-window';

describe('checkoutWindowTracker', () => {
  const checkoutWindow = {};

  afterEach(() => {
    checkoutWindowTracker.reset();
  });

  it('trusts nothing before a checkout window is tracked', () => {
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: null, origin: 'https://checkout.example.com'}));
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'https://checkout.example.com'}));
  });

  it('trusts a message from the tracked window on the checkout origin', () => {
    checkoutWindowTracker.track(checkoutWindow, 'https://checkout.example.com/1/checkouts/abc?key=1');
    assert.isTrue(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'https://checkout.example.com'}));
  });

  it('trusts a message from the tracked window on the configured shop domain', () => {
    checkoutWindowTracker.track(checkoutWindow, 'https://checkout.example.com/1/checkouts/abc');
    assert.isTrue(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'https://shop.myshopify.com'}, 'shop.myshopify.com'));
  });

  it('normalizes default ports on the checkout URL', () => {
    checkoutWindowTracker.track(checkoutWindow, 'https://checkout.example.com:443/1/checkouts/abc');
    assert.isTrue(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'https://checkout.example.com'}));
  });

  it('rejects a message from the tracked window on another origin', () => {
    checkoutWindowTracker.track(checkoutWindow, 'https://checkout.example.com/1/checkouts/abc');
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'https://attacker.example'}, 'shop.myshopify.com'));
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: checkoutWindow, origin: 'http://checkout.example.com'}));
  });

  it('rejects a message from another window on the checkout origin', () => {
    checkoutWindowTracker.track(checkoutWindow, 'https://checkout.example.com/1/checkouts/abc');
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: {}, origin: 'https://checkout.example.com'}));
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: window, origin: 'https://checkout.example.com'}));
  });

  it('does not track the current window or a blocked popup', () => {
    checkoutWindowTracker.track(window, 'https://checkout.example.com/1/checkouts/abc');
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: window, origin: 'https://checkout.example.com'}));
    checkoutWindowTracker.track(null, 'https://checkout.example.com/1/checkouts/abc');
    assert.isFalse(checkoutWindowTracker.isTrustedMessage({source: null, origin: 'https://checkout.example.com'}));
  });
});
