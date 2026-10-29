import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-header v6 dialogs and menus dim the whole page (TW#26955888).
 *
 * ins-header is a stacking context (position:relative plus a z-index), and its dialogs (keyboard shortcuts, the
 * production switch warning) and its instance switcher draw their scrim inside it. The scrim covered the window
 * but only at the header's layer, so the rail (z 40) and an edit screen's fixed DELETE/SAVE bar
 * (.footer-buttons-wrapper, z 100 in legacy app.min.css) stayed bright over an open dialog and took its clicks,
 * and "?" pressed inside an open drawer (ins-drawer, 9999) opened the shortcuts under it. These specs mount the
 * shell frame with the header, the rail and that bar, styled with app.min.css's own values, open each surface,
 * ask the browser which layer is on top over the rail and the bar, and click there.
 */

const CURRENT = 'staging-1';
const ROSTER = [
  { id: CURRENT, name: 'IIA Staging', env: 'staging', domain: 'iia-staging.staging-insites.io' },
  { id: 'production-1', name: 'Combinate Website UAT', env: 'production', domain: 'uat.example.com' },
];

/** app.min.css's .footer-buttons-wrapper: full width with its buttons stacked, then beside the rail from 640px. */
const BAR_CSS = `<style>
  .footer-buttons-wrapper { width: 100%; padding: 16px 24px; position: fixed; bottom: 0; left: 0; z-index: 100;
    box-sizing: border-box; background: #FDFDFD; border-top: 1px solid #DFDFDF; }
  .footer-buttons-wrapper .footer-btn-container { display: flex; flex-direction: column; gap: 16px; }
  .footer-buttons-wrapper button { height: 38px; }
  @media (min-width: 640px) {
    .footer-buttons-wrapper { margin-left: 240px; width: calc(100% - 240px); }
    .footer-buttons-wrapper .footer-btn-container { flex-direction: row; }
  }
</style>`;

/** The admin shell around an edit screen; `extra` lands after it, where the modules mount their drawers. */
const shell = (extra: string) => `${BAR_CSS}
  <div class="ins-shell iia-shell--v6" style="height: 100vh">
    <ins-header id="hdr" variant="v6" environment="staging" instance-name="IIA Staging" instance-id="${CURRENT}"></ins-header>
    <div class="iia-shell__body">
      <ins-sidebar variant="v6">
        <div>
          <ins-sidebar-item link="#/dashboard" icon="icon-dashboard" label="Dashboard"></ins-sidebar-item>
          <ins-sidebar-item link="#/crm" icon="icon-crm" label="CRM"></ins-sidebar-item>
        </div>
      </ins-sidebar>
      <div class="iia-shell__main">
        <div class="grid-x footer-buttons-wrapper"><div class="footer-btn-container">
          <button type="button" id="save">Save</button><button type="button" id="delete">Delete</button>
        </div></div>
      </div>
    </div>
  </div>${extra}`;

const RAIL_LINK = 'ins-sidebar-item[label="Dashboard"] .iia-rail-item__link';

/** Layers in the order a hit is named: the dialog sits inside its scrim, the switcher beside the menus' scrim. */
const LAYERS: [string, string][] = [
  ['.iia-dialog', 'dialog'], ['.iia-switcher', 'switcher'], ['.iia-scrim', 'scrim'],
  ['ins-drawer', 'drawer'], ['ins-sidebar', 'rail'], ['.footer-buttons-wrapper', 'bar'],
];

/** The layer the browser hit-tests at the middle of each element. */
const topAt = (page, selectors: string[]) => page.evaluate(({ selectors, layers }) => selectors.map((sel) => {
  const r = document.querySelector(sel).getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  const layer = hit && layers.find(([s]) => hit.closest(s));
  return layer ? layer[1] : hit ? hit.tagName.toLowerCase() : 'nothing';
}), { selectors, layers: LAYERS });

const headerZ = (page) => page.locator('ins-header').evaluate((el: HTMLElement) => getComputedStyle(el).zIndex);

/** Mount the frame at a window size with the roster set, recording the bar's clicks. */
const setup = async (page, width: number, height: number, roster = ROSTER, extra = '') => {
  await page.route('**/insites/core/administrator-preferences**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: { results: [] } }) }));
  await page.setViewportSize({ width, height });
  await mount(page, shell(extra));
  await page.evaluate((r) => {
    document.getElementById('hdr').setAttribute('instances', JSON.stringify(r));
    (window as any).__clicks = [];
    for (const id of ['save', 'delete']) document.getElementById(id).addEventListener('click', () => (window as any).__clicks.push(id));
  }, roster);
  await page.waitForChanges();
};

const openShortcuts = async (page) => {
  await page.keyboard.press('?');
  await page.waitForChanges();
  await expect(page.locator('ins-header .iia-dialog--shortcuts')).toBeVisible();
};

const openSwitcher = async (page) => {
  await page.locator('ins-header [data-env-trigger]').click();
  await page.waitForChanges();
  await expect(page.locator('ins-header .iia-switcher')).toBeVisible();
};

const openProdWarning = async (page) => {
  await openSwitcher(page);
  await page.locator('ins-header [role="menuitemradio"]').filter({ hasText: 'Combinate Website UAT' }).click();
  await page.waitForChanges();
  await expect(page.locator('ins-header .iia-dialog--prod')).toBeVisible();
};

const clickMiddle = async (page, sel: string) => {
  const box = await page.locator(sel).boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForChanges();
};

// Escape closes the warning first and leaves the switcher it was opened from open, at the raised level. Closing the
// switcher hands focus back to its trigger, whose tooltip keeps the header raised until focus moves on.
const DIALOGS = [
  { name: 'keyboard shortcuts', open: openShortcuts, zAfterEscape: ['30'] },
  { name: 'production switch warning', open: openProdWarning, zAfterEscape: ['106', '106'] },
];

for (const d of DIALOGS) {
  test.describe(`ins-header v6 ${d.name} over an edit screen, 1470x800`, () => {
    test('its scrim is on top of the rail and the action bar', async ({ page }) => {
      await setup(page, 1470, 800);
      await d.open(page);
      expect(await topAt(page, [RAIL_LINK, '#save', '#delete'])).toEqual(['scrim', 'scrim', 'scrim']);
    });

    test('a click over the action bar closes the dialog and never reaches the bar', async ({ page }) => {
      await setup(page, 1470, 800);
      await d.open(page);
      await clickMiddle(page, '#delete');
      await expect(page.locator('ins-header .iia-dialog')).toHaveCount(0);
      expect(await page.evaluate(() => (window as any).__clicks)).toEqual([]);
    });

    test('a click over the rail closes the dialog and never follows the rail link', async ({ page }) => {
      await setup(page, 1470, 800);
      await d.open(page);
      await clickMiddle(page, RAIL_LINK);
      await expect(page.locator('ins-header .iia-dialog')).toHaveCount(0);
      expect(await page.evaluate(() => window.location.hash)).toBe('');
    });

    test('the header holds the modal layer only while the dialog is open', async ({ page }) => {
      await setup(page, 1470, 800);
      expect(await headerZ(page)).toBe('30');
      await d.open(page);
      // Off the header, so a hovered tooltip does not raise it after the dialog closes.
      await page.mouse.move(1200, 400);
      expect(await headerZ(page)).toBe('10000');
      for (const z of d.zAfterEscape) {
        await page.keyboard.press('Escape');
        await page.waitForChanges();
        expect(await headerZ(page)).toBe(z);
      }
      await expect(page.locator('ins-header .iia-dialog, ins-header .iia-switcher')).toHaveCount(0);
      await page.evaluate(() => (document.activeElement as HTMLElement).blur());
      expect(await headerZ(page)).toBe('30');
    });
  });
}

test.describe('ins-header v6 dialog layer', () => {
  test('a header button focused from the keyboard behind an open dialog keeps the dialog on top', async ({ page }) => {
    await setup(page, 1470, 800);
    await openShortcuts(page);
    // Tab reaches the header's own controls behind the dialog, and they carry tooltips (data-tip).
    let focused = null;
    for (let i = 0; i < 5 && !focused?.tip; i++) {
      await page.keyboard.press('Tab');
      focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        return { tip: el.hasAttribute('data-tip') && !!el.closest('ins-header'), visible: el.matches(':focus-visible') };
      });
    }
    expect(focused).toEqual({ tip: true, visible: true });
    expect(await headerZ(page)).toBe('10000');
  });

  test('"?" pressed inside an open drawer opens the dialog on top of the drawer and its backdrop', async ({ page }) => {
    await setup(page, 1470, 800, ROSTER, '<ins-drawer is-open label="Edit contact"><button type="button" id="in-drawer">Save contact</button></ins-drawer>');
    // Let the drawer slide in before hit-testing.
    await page.waitForTimeout(400);
    expect(await topAt(page, ['#in-drawer'])).toEqual(['drawer']);

    await page.locator('#in-drawer').focus();
    await page.keyboard.press('?');
    await page.waitForChanges();
    await expect(page.locator('ins-header .iia-dialog--shortcuts')).toBeVisible();
    expect(await topAt(page, ['.iia-dialog--shortcuts .iia-dialog__close', '#in-drawer', RAIL_LINK])).toEqual(['dialog', 'scrim', 'scrim']);
  });
});

test.describe('ins-header v6 instance switcher over an edit screen', () => {
  test('at 1470x800 its scrim is on top of the rail and the action bar, and a click there only closes it', async ({ page }) => {
    await setup(page, 1470, 800);
    await openSwitcher(page);
    expect(await headerZ(page)).toBe('106');
    expect(await topAt(page, [RAIL_LINK, '#save', '#delete'])).toEqual(['scrim', 'scrim', 'scrim']);

    await clickMiddle(page, '#delete');
    await expect(page.locator('ins-header .iia-switcher')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).__clicks)).toEqual([]);
  });

  test('docked at 390x700, every row in view is on top of the action bar', async ({ page }) => {
    const roster = [ROSTER[0], ...Array.from({ length: 30 }, (_, i) => (
      { id: `staging-${i + 2}`, name: `Client site ${i + 2}`, env: 'staging', domain: `client-${i + 2}.staging-insites.io` }))];
    await setup(page, 390, 700, roster);
    await openSwitcher(page);

    // The docked switcher runs to 12px above the window's bottom edge, into the band the stacked bar covers.
    const bar = await page.locator('.footer-buttons-wrapper').boundingBox();
    const switcher = await page.locator('ins-header .iia-switcher').boundingBox();
    expect(switcher.y + switcher.height).toBeGreaterThan(bar.y + 20);

    const rows = await page.evaluate((barTop) => {
      const list = document.querySelector('ins-header .iia-switcher__list').getBoundingClientRect();
      return Array.from(document.querySelectorAll('ins-header [role="menuitemradio"]')).map((row: HTMLElement) => {
        const r = row.getBoundingClientRect();
        const y = r.top + r.height / 2;
        if (y < list.top || y > list.bottom) return null; // scrolled out of the list
        const hit = document.elementFromPoint(r.left + r.width / 2, y);
        return { name: row.textContent.trim(), onTop: !!hit && !!hit.closest('.iia-switcher'), inBarBand: y > barTop };
      }).filter(Boolean);
    }, bar.y);
    expect(rows.filter((r) => r.inBarBand).length).toBeGreaterThan(0);
    expect(rows.filter((r) => !r.onTop)).toEqual([]);
  });
});
