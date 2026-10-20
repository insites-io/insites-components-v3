import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-header v6 instance switcher with a roster set after load (TW#26744156). CRM fetches the roster
 * once the shell has loaded and sets `instances`; Switch emits insInstanceSwitch and the host navigates.
 * Switch shows no toast: the host navigates away, and landing in the target is the confirmation.
 */
const CURRENT = '52e3cdc5-397c-4ce6-b1d2-5e2107d0b6e7';
const OTHER = '06cc1511-9aed-4da6-9703-2d689a74bad7';
const roster = [
  { id: CURRENT, name: 'test', env: 'staging', domain: 'test.staging-insites.io' },
  { id: OTHER, name: 'test2', env: 'staging', domain: 'test2.staging-insites.io' },
];

test('a roster set after load lists every instance, and Switch shows no toast', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mount(page, `<ins-header id="hdr" variant="v6" environment="staging" instance-name="test" instance-id="${CURRENT}"></ins-header>`);
  await page.evaluate(() => { (window as any).__ev = []; document.getElementById('hdr').addEventListener('insInstanceSwitch', (e: any) => (window as any).__ev.push(e.detail)); });
  await page.evaluate((r) => document.getElementById('hdr').setAttribute('instances', JSON.stringify(r)), roster);
  await page.waitForChanges();

  await page.locator('ins-header [data-env-trigger]').click();
  await page.waitForChanges();
  const rows = page.locator('ins-header [role="menuitemradio"]');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toHaveAttribute('aria-checked', 'true');

  await rows.filter({ hasText: 'test2' }).click();
  await page.waitForChanges();
  expect(await page.evaluate(() => (window as any).__ev)).toEqual([{ from: CURRENT, to: OTHER, env: 'staging' }]);
  await expect(page.locator('ins-header')).not.toContainText('Now in test2');
  await expect(page.locator('ins-header')).not.toContainText('Switching to test2');
});
