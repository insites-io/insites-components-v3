import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * Lazy-load retry (TW#26896897). scripts/stencil-lazy-retry.js patches Stencil's loadModule so a
 * component whose code fails to download retries at ./<bundle>.entry.js?retry=<n> (three times)
 * before giving up. Before the patch one dropped request left the component unregistered
 * ("Constructor for "ins-x#undefined" was not found") until the page was reloaded.
 */

const ENTRY = /\.entry\.js(\?|$)/;

test.describe('lazy component download retry', () => {
  test('a component whose first download fails still renders', async ({ page }) => {
    const seen: string[] = [];
    await page.route(ENTRY, (route) => {
      const url = route.request().url();
      seen.push(url);
      // Drop the first request for every bundle; let the retries through.
      return url.includes('retry=') ? route.continue() : route.abort('connectionreset');
    });

    await mount(page, `<ins-metric-tile label="Contacts" value="12" metric-key="contacts"></ins-metric-tile>`);

    await expect(page.locator('.hm-cell__label, .ins-metric-tile__label').first()).toHaveText('Contacts');
    expect(seen.some((url) => url.includes('retry=1'))).toBe(true);
  });

  test('a download that keeps failing gives up after three retries and logs the failure once', async ({ page }) => {
    await mount(page, '');

    const attempts: string[] = [];
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('Failed to fetch dynamically imported module')) errors.push(msg.text());
    });
    await page.route(ENTRY, (route) => {
      attempts.push(route.request().url());
      return route.abort('connectionreset');
    });

    await page.evaluate(() => {
      document.body.insertAdjacentHTML('beforeend', '<ins-metric-tile label="Contacts" value="12"></ins-metric-tile>');
    });

    // Retries wait 0.4 s, 1.5 s and 4 s, so the last failure lands about 6 s in.
    await expect.poll(() => errors.length, { timeout: 15000 }).toBe(1);
    const bundles = new Set(attempts.map((url) => url.replace(/\?.*$/, '')));
    expect(attempts).toHaveLength(bundles.size * 4);
    expect(attempts.filter((url) => url.includes('retry=3'))).toHaveLength(bundles.size);
  });
});
