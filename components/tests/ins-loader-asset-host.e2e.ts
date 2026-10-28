import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-loader image paths on the prod01 stack (bundle 3.4.6, TW#26951438).
 *
 * Module screens pass their loader as `/assets/modules/<slug>/insites_admin/images/loader.gif`, a path on the
 * instance host. prod01 serves assets only from the CDN host the module scripts load from, so the loader
 * resolves the path against that host, and falls back to the bundled loader when no image is given or the
 * image still fails. A `type="text/plain"` script stands in for a module's app.js: it carries the src the
 * shell renders but is never fetched.
 */
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const FALLBACK = 'https://components.insites.io/assets/images/loading-loop-2x.gif';
const CDN_BASE = 'https://files.example.test/instances/38';
const MODULE_SCRIPT = `<script type="text/plain" src="${CDN_BASE}/assets/modules/insites_databases/insites_admin/app/js/app.js?updated=1"></script>`;
const LOADER_PATH = '/assets/modules/insites_databases/insites_admin/images/loader.gif';

const serve = async (page, url: string, status = 200) => {
  await page.route(url, (route) => (status === 200
    ? route.fulfill({ status, contentType: 'image/gif', body: GIF })
    : route.fulfill({ status, contentType: 'text/plain', body: 'Not found' })));
};

const loaderImg = (page) => page.locator('ins-loader img');

test.describe('ins-loader image source', () => {
  test('resolves an instance-host /assets/ path against the module scripts\' asset host', async ({ page }) => {
    await serve(page, `${CDN_BASE}${LOADER_PATH}`);
    await mount(page, `${MODULE_SCRIPT}<ins-loader state-icon="processing" image-source="${LOADER_PATH}"></ins-loader>`);
    await expect(loaderImg(page)).toHaveAttribute('src', `${CDN_BASE}${LOADER_PATH}`);
    await expect.poll(() => loaderImg(page).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test('falls back to the bundled loader when the resolved image fails', async ({ page }) => {
    await serve(page, `${CDN_BASE}${LOADER_PATH}`, 404);
    await serve(page, FALLBACK);
    await mount(page, `${MODULE_SCRIPT}<ins-loader state-icon="processing" image-source="${LOADER_PATH}"></ins-loader>`);
    await expect(loaderImg(page)).toHaveAttribute('src', FALLBACK);
    await expect.poll(() => loaderImg(page).evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  });

  test('leaves the path alone on a page with no module scripts', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', (req) => requested.push(req.url()));
    await serve(page, FALLBACK);
    await mount(page, `<ins-loader state-icon="processing" image-source="${LOADER_PATH}"></ins-loader>`);
    await expect.poll(() => requested.some((u) => new URL(u).pathname === LOADER_PATH && !u.startsWith(CDN_BASE))).toBe(true);
  });

  test('leaves an absolute image URL alone', async ({ page }) => {
    const absolute = 'https://cdn.example.test/images/loader.gif';
    await serve(page, absolute);
    await mount(page, `${MODULE_SCRIPT}<ins-loader state-icon="processing" image-source="${absolute}"></ins-loader>`);
    await expect(loaderImg(page)).toHaveAttribute('src', absolute);
  });

  test('tries a new image source again after falling back', async ({ page }) => {
    const absolute = 'https://cdn.example.test/images/next.gif';
    await serve(page, `${CDN_BASE}${LOADER_PATH}`, 404);
    await serve(page, FALLBACK);
    await serve(page, absolute);
    await mount(page, `${MODULE_SCRIPT}<ins-loader id="l" state-icon="processing" image-source="${LOADER_PATH}"></ins-loader>`);
    await expect(loaderImg(page)).toHaveAttribute('src', FALLBACK);
    await page.evaluate((src) => { (document.getElementById('l') as any).imageSource = src; }, absolute);
    await expect(loaderImg(page)).toHaveAttribute('src', absolute);
  });

  test('leaves the path alone when the module scripts load from the page\'s own origin', async ({ page }) => {
    await serve(page, FALLBACK);
    await mount(page, `<script type="text/plain" src="/assets/modules/insites_databases/insites_admin/app/js/app.js?updated=1"></script><ins-loader state-icon="processing" image-source="${LOADER_PATH}"></ins-loader>`);
    await expect(loaderImg(page)).toHaveAttribute('src', /^(\/assets\/|https:\/\/components\.insites\.io\/)/);
    const first = await page.evaluate(() => performance.getEntriesByType('resource').map((e) => e.name).find((n) => n.includes('/images/loader.gif')));
    expect(first && new URL(first).pathname).toBe(LOADER_PATH);
    expect(first && first.startsWith('https://files.example.test')).toBe(false);
  });

  test('uses the bundled loader when no image source is given', async ({ page }) => {
    await serve(page, FALLBACK);
    await mount(page, `<ins-loader state-icon="processing"></ins-loader><ins-loader id="empty" state-icon="processing" image-source=""></ins-loader>`);
    await expect(page.locator('ins-loader:not(#empty) img')).toHaveAttribute('src', FALLBACK);
    await expect(page.locator('#empty img')).toHaveAttribute('src', FALLBACK);
  });
});
