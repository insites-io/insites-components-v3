import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * Administrator preferences from the shell's boot payload (TW#26944935).
 *
 * CRM renders every preference row into window.__iiaBoot.administratorPreferences, the endpoint's own
 * { items: { results } } body. ins-header and ins-help-panel read it instead of fetching, fall back to the
 * endpoint without it, and keep it current after a write so a panel mounted later on the page agrees.
 * The endpoint is answered locally here; nothing leaves the test server.
 */
const PREFS = '**/insites/core/administrator-preferences**';
const HELP = 'help_panels:dismissed';
const PROD = 'switcher:skip_production_warning';

type Row = { key: string; value: string };

/** Serve `rows` from the endpoint and record every GET key and POST payload. */
const fakeEndpoint = async (page, rows: Row[] = []) => {
  const log = { gets: [] as string[], posts: [] as Row[] };
  await page.route(PREFS, async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      log.posts.push(JSON.parse(req.postData() || '{}').payload);
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"items":{"results":[]}}' });
      return;
    }
    const key = new URL(req.url()).searchParams.get('key');
    log.gets.push(key);
    const results = rows.filter((r) => r.key === key);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: { results } }) });
  });
  return log;
};

const withBoot = (page, rows: Row[]) => page.addInitScript((r) => {
  (window as any).__iiaBoot = { administratorPreferences: { items: { results: r } } };
}, rows);

const roster = JSON.stringify([
  { id: 'staging-1', name: 'IIA Staging', env: 'staging', domain: 'iia-staging.staging-insites.io' },
  { id: 'production-1', name: 'Combinate Website UAT', env: 'production', domain: 'uat.example.com' },
]);

const shell = `
  <ins-header id="hdr" variant="v6" environment="staging" instance-name="IIA Staging" instance-id="staging-1" user-name="Ezekiel"
    instances='${roster}'></ins-header>
  <ins-help-panel id="p1" panel-key="dashboard" heading="Your instance at a glance" body="Help body"></ins-help-panel>`;

const restoreRow = (page) => page.locator('ins-header button[role="menuitem"]').filter({ hasText: 'Show help panels' });
const bootValue = (page, key: string) => page.evaluate((k) => {
  const rows = (window as any).__iiaBoot.administratorPreferences.items.results;
  const row = rows.find((r: any) => r.key === k);
  return row ? row.value : null;
}, key);
const addPanel = async (page, id: string) => {
  await page.evaluate((i) => document.body.insertAdjacentHTML('beforeend',
    `<ins-help-panel id="${i}" panel-key="dashboard" heading="Later" body="Mounted later"></ins-help-panel>`), id);
  await page.waitForChanges();
};

test.describe('administrator preferences from the boot payload', () => {
  test('with the payload, the header and the help panel make no preference request and follow its values', async ({ page }) => {
    const log = await fakeEndpoint(page);
    await withBoot(page, [{ key: HELP, value: '["dashboard"]' }, { key: PROD, value: 'true' }]);
    const switches: any[] = [];
    await page.exposeFunction('__switched', (d: any) => switches.push(d));
    await mount(page, shell);
    await page.evaluate(() => document.getElementById('hdr').addEventListener('insInstanceSwitch', (e: any) => (window as any).__switched(e.detail)));

    await expect(page.locator('#p1')).toHaveAttribute('hidden', '');
    await page.locator('ins-header .iia-hdr__avatarbtn').click();
    await page.waitForChanges();
    await expect(restoreRow(page)).toHaveAttribute('aria-disabled', 'false');

    // "Don't show me again" is stored as true, so a production row switches without the warning.
    await page.locator('ins-header [data-env-trigger]').click();
    await page.waitForChanges();
    await page.locator('ins-header [role="menuitemradio"]').filter({ hasText: 'Combinate Website UAT' }).click();
    await page.waitForChanges();
    await expect(page.locator('ins-header .iia-dialog--prod')).toHaveCount(0);
    await expect.poll(() => switches).toEqual([{ from: 'staging-1', to: 'production-1', env: 'production' }]);

    expect(log.gets).toEqual([]);
  });

  test('without the payload both components fetch, as before', async ({ page }) => {
    const log = await fakeEndpoint(page, [{ key: HELP, value: '["dashboard"]' }]);
    await mount(page, shell);

    await expect(page.locator('#p1')).toHaveAttribute('hidden', '');
    await expect.poll(() => [...log.gets].sort()).toEqual([HELP, HELP, PROD]);
  });

  test('a dismissal and a restore update the payload, so panels mounted later agree', async ({ page }) => {
    const log = await fakeEndpoint(page);
    await withBoot(page, [{ key: HELP, value: '[]' }]);
    await mount(page, shell);
    await expect(page.locator('#p1')).not.toHaveAttribute('hidden', '');

    await page.locator('#p1 .iia-help__dismiss').click();
    await page.waitForChanges();
    await expect(page.locator('#p1')).toHaveAttribute('hidden', '');
    await expect.poll(() => bootValue(page, HELP)).toBe('["dashboard"]');
    await addPanel(page, 'p2');
    await expect(page.locator('#p2')).toHaveAttribute('hidden', '');

    await page.locator('ins-header .iia-hdr__avatarbtn').click();
    await page.waitForChanges();
    await restoreRow(page).click();
    await page.waitForChanges();
    await expect.poll(() => bootValue(page, HELP)).toBe('[]');
    await expect(page.locator('#p1')).not.toHaveAttribute('hidden', '');
    await addPanel(page, 'p3');
    await expect(page.locator('#p3')).not.toHaveAttribute('hidden', '');

    expect(log.gets).toEqual([]);
    await expect.poll(() => log.posts).toEqual([
      { key: HELP, value: '["dashboard"]' },
      { key: HELP, value: '[]' },
    ]);
  });
});
