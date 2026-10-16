import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-renderer frame stop (TW#26897281).
 *
 * Every time the renderer's iframe changes URL, the renderer stops the frame's load before it
 * calls location.replace(). It used to call window.frames.stop(), and window.frames is the top
 * window, so it stopped the whole admin page and cancelled whatever was still downloading: the
 * logo, module app.js files, Google Maps libraries and component chunks. These specs count calls
 * to the top window's stop() while the frame navigates, and check that rerouting still works.
 */

const FRAME_A = '/__renderer-test/a.html';
const FRAME_B = '/__renderer-test/b.html';

test.describe('ins-renderer frame stop', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/__renderer-test/*.html*', (route) =>
      route.fulfill({ contentType: 'text/html', body: `<!doctype html><title>frame</title><p>${new URL(route.request().url()).pathname}</p>` }),
    );
    await mount(page, '<ins-renderer label="Pipelines"></ins-renderer>');
    await page.evaluate(() => {
      (window as any).__topStops = 0;
      window.stop = () => { (window as any).__topStops++; };
    });
  });

  const framePath = (page) =>
    page.evaluate(() => (document.querySelector('#insRendererFrame') as HTMLIFrameElement).contentWindow?.location.pathname);
  const topStops = (page) => page.evaluate(() => (window as any).__topStops);

  test('navigating the frame never stops the admin page', async ({ page }) => {
    await page.evaluate((src) => { (document.querySelector('#insRendererFrame') as HTMLIFrameElement).src = src; }, FRAME_A);
    await expect.poll(() => framePath(page)).toBe(FRAME_A);

    await page.evaluate((src) => { (document.querySelector('#insRendererFrame') as HTMLIFrameElement).contentWindow!.location.href = src; }, FRAME_B);
    await expect.poll(() => framePath(page)).toBe(FRAME_B);

    // Give the unload/load listeners time to run their callback before counting.
    await page.waitForTimeout(500);
    expect(await topStops(page)).toBe(0);
  });

  test('?reroute= and ?reroutelabel= still move the frame and relabel the page', async ({ page }) => {
    const src = `${FRAME_A}?reroute=${FRAME_B}&reroutelabel=${encodeURIComponent('Rerouted page')}`;
    await page.evaluate((s) => { (document.querySelector('#insRendererFrame') as HTMLIFrameElement).src = s; }, src);

    await expect.poll(() => framePath(page)).toBe(FRAME_B);
    await expect(page.locator('ins-renderer .ins-renderer-wrap__title-span')).toHaveText('Rerouted page');
    expect(await topStops(page)).toBe(0);
  });
});
