import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * The v6 rail flyout draws above the page's fixed action bar (TW#26946871).
 *
 * The flyout is position:fixed inside ins-sidebar, and the rail is a stacking context (position:relative plus a
 * z-index), so the flyout's own z-index only ordered it among the rail's children. Every module edit screen pins
 * .footer-buttons-wrapper, the bar with DELETE, to the bottom of the viewport at z-index 100 (legacy app.min.css),
 * and on iia-uat that bar covered the Settings flyout's last two rows. These specs mount the shell frame with the
 * live rail's Configure group and that bar, styled with app.min.css's own values, hover each Configure item at
 * 800px and 700px of window height and ask the browser which element is on top at the middle of every row.
 */

const CONFIGURE: Record<string, string[]> = {
  API: ['Insites API Endpoints', 'Custom API Endpoints', 'Authorization Policies', 'GraphQL', 'Reports'],
  Permissions: ['Profiles'],
  Integrations: ['Google Maps', 'reCAPTCHA', 'Stripe', 'Twilio', 'Event Stream API Key', 'Instance API Key', 'Git Repository'],
  Settings: ['Administrators', 'Redirects', 'Sitemap', 'Robots', 'System Logs', 'Email Logs', 'Localization', 'Instance Configuration', 'Insites Modules'],
};
const ICONS: Record<string, string> = { API: 'icon-cpu', Permissions: 'icon-lock-1', Integrations: 'icon-integrations', Settings: 'icon-settings-1' };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The rail iia-uat renders: Dashboard, Work, Build, Sell, then Configure at the bottom. */
const RAIL = `
  <ins-sidebar variant="v6">
    <div>
      <ins-sidebar-item link="#" icon="icon-dashboard" label="Dashboard"></ins-sidebar-item>
      ${[['CRM', 'icon-crm'], ['Pipelines', 'icon-filter'], ['Tasks', 'icon-task-list'], ['Assets', 'icon-folder1'], ['CMS', 'icon-site-manager'],
         ['Data', 'icon-database'], ['Forms', 'icon-completed-outcomes'], ['Ecommerce', 'icon-credit-card'], ['Locator', 'icon-map-pin'], ['Events', 'icon-calendar']]
        .map(([label, icon]) => `<ins-sidebar-item link="#/${slug(label)}" icon="${icon}" label="${label}"></ins-sidebar-item>`).join('\n      ')}
      ${Object.keys(CONFIGURE).map(label => `
      <ins-sidebar-item icon="${ICONS[label]}" label="${label}" with-submenu>
        ${CONFIGURE[label].map(sub => `<ins-sidebar-item link="#/${slug(label)}/${slug(sub)}" label="${sub}"></ins-sidebar-item>`).join('\n        ')}
      </ins-sidebar-item>`).join('')}
    </div>
  </ins-sidebar>`;

/** An edit screen's action bar, with app.min.css's values for .footer-buttons-wrapper (min-width 640px). */
const PAGE = `
  <style>
    .footer-buttons-wrapper { padding: 16px 24px; position: fixed; bottom: 0; left: 0; z-index: 100; margin-left: 240px;
      width: calc(100% - 240px); box-sizing: border-box; background: #FDFDFD; border-top: 1px solid #DFDFDF; }
    .footer-buttons-wrapper button { height: 38px; }
  </style>
  <div class="ins-shell iia-shell--v6" style="height: 100vh">
    <div style="flex: none; height: 56px"></div><!-- the header's height, so the rail starts where it does live -->
    <div class="iia-shell__body">
      ${RAIL}
      <div class="iia-shell__main">
        <ins-renderer></ins-renderer>
        <div class="grid-x footer-buttons-wrapper"><button type="button">Delete</button></div>
      </div>
    </div>
  </div>`;

/** Hover a Configure row from outside the rail, so it gets a fresh mouseenter; on desktop hover opens the flyout. */
const openFlyout = async (page, label: string) => {
  await page.mouse.move(900, 300);
  await page.locator(`ins-sidebar-item[label="${label}"] .iia-rail-item__link`).hover();
  await page.waitForChanges();
  await expect(page.locator('ins-sidebar .iia-flyout')).toHaveAttribute('aria-label', label);
  // Let the fade-in and the staggered row entrance settle before hit-testing.
  await page.waitForTimeout(400);
};

/** Each flyout row's label and the element the browser hit-tests at the middle of the row, when that is not the row. */
const rowsOnTop = (page) => page.evaluate(() => {
  const fly = document.querySelector('ins-sidebar .iia-flyout') as HTMLElement;
  const box = fly.getBoundingClientRect();
  return Array.from(fly.querySelectorAll('.iia-flyout__item')).map((row: HTMLElement) => {
    const r = row.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const hit = document.elementFromPoint(r.left + r.width / 2, y);
    return {
      label: row.textContent.trim(),
      inside: y >= 0 && y <= window.innerHeight && r.top >= box.top - 0.5 && r.bottom <= box.bottom + 0.5,
      covered: hit && row.contains(hit) ? null : (hit ? `${hit.tagName.toLowerCase()}.${hit.className}` : 'nothing'),
    };
  });
});

for (const height of [800, 700]) {
  test.describe(`ins-sidebar v6 flyout over an edit screen's action bar, 1470x${height}`, () => {
    for (const label of Object.keys(CONFIGURE)) {
      test(`every ${label} row is inside the window and on top of the bar`, async ({ page }) => {
        await page.setViewportSize({ width: 1470, height });
        await mount(page, PAGE);
        await openFlyout(page, label);

        const rows = await rowsOnTop(page);
        expect(rows.map(r => r.label)).toEqual(CONFIGURE[label]);
        // At these sizes the bar overlaps every flyout's lower rows (it did on iia-uat), so a covered row names the bar.
        expect(rows.filter(r => !r.inside || r.covered)).toEqual([]);
      });
    }
  });
}

test.describe('ins-sidebar v6 flyout layer', () => {
  test('a click on the last Settings row, over the bar, follows its link', async ({ page }) => {
    await page.setViewportSize({ width: 1470, height: 800 });
    await mount(page, PAGE);
    await openFlyout(page, 'Settings');

    const last = page.locator('ins-sidebar .iia-flyout__item', { hasText: 'Insites Modules' });
    const bar = await page.locator('.footer-buttons-wrapper').boundingBox();
    const row = await last.boundingBox();
    expect(row.y + row.height / 2).toBeGreaterThan(bar.y); // the row sits where the bar is
    await page.mouse.click(row.x + row.width / 2, row.y + row.height / 2);
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe('#/settings/insites-modules');
  });

  test('the rail rises only while a flyout is open, so the header menus still cover it otherwise', async ({ page }) => {
    await page.setViewportSize({ width: 1470, height: 800 });
    await mount(page, PAGE);
    const railZ = () => page.locator('ins-sidebar').evaluate((el: HTMLElement) => getComputedStyle(el).zIndex);

    expect(await railZ()).toBe('40');
    await openFlyout(page, 'Settings');
    expect(await railZ()).toBe('105');
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    await expect(page.locator('ins-sidebar .iia-flyout')).toHaveCount(0);
    expect(await railZ()).toBe('40');
  });
});
