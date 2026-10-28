import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-sidebar and ins-header match a hash that carries a query string (TW#26936697).
 *
 * Email Logs keeps its filters in the URL (#/settings/email-logs?search=...&range=...). The rail compared the
 * whole hash with each item's link, matched nothing, and on a reload fell back to the stored trail, whose
 * link-less "Settings" crumb matched the first link-less item (CRM). The rail now matches the route without
 * its query string, still exactly, once the exact and ?reroute= matches find nothing. The flyout marks its
 * row the same way, exact first: a row whose link is the whole hash wins over a sibling that matches the route.
 * The header's breadcrumb bar compared its leaf with the whole hash too, so after a filtered reload "Email Logs"
 * drew as a link that dropped the filters; the leaf now also matches the route and draws as the current crumb.
 *
 * The harness loads every page at "<base>#", so each spec sets the hash first and then inserts the shell, which
 * is what a reload does: the rail's first hash check and the header's first render run with the filters
 * already in the URL.
 */
const rail = (moreSettings = '') => `
  <ins-sidebar variant="v6">
    <ins-sidebar-item label="Dashboard" icon="icon-dashboard" link="#"></ins-sidebar-item>
    <ins-sidebar-item label="CRM" icon="icon-crm" with-submenu>
      <ins-sidebar-item link="#/crm/contacts" label="Contacts"></ins-sidebar-item>
      <ins-sidebar-item link="#/crm" label="Overview"></ins-sidebar-item>
    </ins-sidebar-item>
    <ins-sidebar-item label="Settings" icon="icon-settings-1" with-submenu>
      <ins-sidebar-item link="#/settings/system-logs" label="System Logs"></ins-sidebar-item>
      <ins-sidebar-item link="#/settings/email-logs" label="Email Logs"></ins-sidebar-item>${moreSettings}
    </ins-sidebar-item>
  </ins-sidebar>`;
const RAIL = rail();
/** A sibling row whose own link carries a query string, beside the Email Logs row it shares a route with. */
const RAIL_WITH_FILTERED_ROW = rail(`
      <ins-sidebar-item link="#/settings/email-logs?status=failed" label="Failed emails"></ins-sidebar-item>`);

/** The v6 header: its breadcrumb bar draws the trail the rail routes and the trail a page hands ins-breadcrumbs. */
const HEADER = `<ins-header variant="v6" environment="staging" instance-name="IIA Staging"></ins-header>`;

/** The trail CRM's Email Logs page stores (Home, then the link-less Settings heading). */
const PAGE_TRAIL = [{ link: '/dashboard', label: 'Home' }, { link: '', label: 'Settings', withSubmenu: true }];
/** The trail CRM's Email Logs page hands ins-breadcrumbs once it mounts: updateCrumbs(trail, true). */
const PAGE_OWN_TRAIL = [...PAGE_TRAIL, { link: '#/settings/email-logs', label: 'Email Logs' }];

const reloadAt = async (page, hash: string, trail: any[] | null = PAGE_TRAIL, shell: string = RAIL) => {
  await mount(page, `<ins-renderer></ins-renderer><div id="rail-slot"></div>`);
  await page.evaluate(({ hash, trail, shell }) => {
    (window as any).__routes = [];
    document.addEventListener('insRouteChange', (e: any) => (window as any).__routes.push(e.detail.crumbs.map((c: any) => c.label)));
    if (trail) window.localStorage.setItem('ins_breadcrumbs', JSON.stringify(trail));
    else window.localStorage.removeItem('ins_breadcrumbs');
    window.location.hash = hash;
    document.getElementById('rail-slot').innerHTML = shell;
  }, { hash, trail, shell });
  await page.waitForChanges();
};

const active = (page) => page.locator('ins-sidebar > * ins-sidebar-item.is-active, ins-sidebar > ins-sidebar-item.is-active')
  .evaluateAll((els: Element[]) => els.map((el) => el.getAttribute('label')));
const routes = (page) => page.evaluate(() => (window as any).__routes);

/** Hover a top-level row from outside the rail, so it gets a fresh mouseenter. On desktop hover opens the
 *  flyout (a click would toggle it shut), and a hash change that routes closes it again. */
const openFlyout = async (page, label: string) => {
  await page.mouse.move(1200, 700);
  await page.locator(`ins-sidebar-item[label="${label}"] .iia-rail-item__link`).hover();
  await page.waitForChanges();
};
const flyoutActive = (page) => page.locator('ins-sidebar .iia-flyout__item.is-active');

/** The breadcrumb bar after its own Home link: each crumb's label, how it drew, and its aria-current. */
const bar = (page) => page.locator('ins-header .iia-crumbs__nav > :not(.iia-crumbs__home):not(.iia-crumbs__sep)')
  .evaluateAll((els: Element[]) => els.map((el) => ({
    label: (el.textContent || '').trim(),
    as: el.classList.contains('iia-crumbs__current') ? 'current' : el.classList.contains('iia-crumbs__link') ? 'link' : 'text',
    ariaCurrent: el.getAttribute('aria-current'),
  })));
const EMAIL_LOGS_CURRENT = [
  { label: 'Settings', as: 'text', ariaCurrent: null },
  { label: 'Email Logs', as: 'current', ariaCurrent: 'page' },
];

/** Move to `hash` (the header redraws on hashchange), then hand ins-breadcrumbs `trail` as a page does. */
const handTrail = (page, hash: string, trail: any[]) => page.evaluate(async ({ hash, trail }) => {
  if (window.location.hash !== hash) {
    await new Promise<void>((resolve) => {
      window.addEventListener('hashchange', () => resolve(), { once: true });
      window.location.hash = hash;
    });
  }
  await (document.querySelector('ins-breadcrumbs') as any).updateCrumbs(trail, true);
}, { hash, trail });

test.describe('ins-sidebar hash with a query string', () => {
  test('a reload with Email Logs filters in the URL lights Settings and routes Email Logs', async ({ page }) => {
    const hash = '#/settings/email-logs?search=bounce&range=last_7_days';
    await reloadAt(page, hash);

    await expect.poll(() => active(page)).toEqual(['Settings']);
    await expect.poll(() => routes(page)).toEqual([['Settings', 'Email Logs']]);
    expect(await page.evaluate(() => window.location.hash)).toBe(hash);

    // The flyout marks Email Logs as the current row. On desktop, hover opens it (a click would toggle it shut).
    await page.locator('ins-sidebar-item[label="Settings"] .iia-rail-item__link').hover();
    await page.waitForChanges();
    await expect(page.locator('ins-sidebar .iia-flyout__item.is-active')).toHaveText('Email Logs');
  });

  test('without a query string nothing changes: the exact match routes as before', async ({ page }) => {
    await reloadAt(page, '#/settings/email-logs');
    await expect.poll(() => active(page)).toEqual(['Settings']);
    await expect.poll(() => routes(page)).toEqual([['Settings', 'Email Logs']]);
  });

  test('matching stays exact: #/crm-something?x=1 does not match #/crm, #/crm?view=all does', async ({ page }) => {
    // No stored trail, so the only way an item lights is a hash match.
    await reloadAt(page, '#/crm-something?x=1', null);
    expect(await active(page)).toEqual([]);
    expect(await routes(page)).toEqual([]);

    await page.evaluate(() => { window.location.hash = '#/crm?view=all'; });
    await page.waitForChanges();
    await expect.poll(() => active(page)).toEqual(['CRM']);
    await expect.poll(() => routes(page)).toEqual([['CRM', 'Overview']]);
  });

  test('the flyout marks the row whose link is the whole hash, not the sibling that matches its route', async ({ page }) => {
    await reloadAt(page, '#/settings/email-logs?status=failed', PAGE_TRAIL, RAIL_WITH_FILTERED_ROW);
    await expect.poll(() => routes(page)).toEqual([['Settings', 'Failed emails']]);
    await openFlyout(page, 'Settings');
    await expect(flyoutActive(page)).toHaveText(['Failed emails']);

    // A filter no row carries: nothing is the whole hash, so the route marks Email Logs alone, as the rail routed.
    await page.evaluate(() => { window.location.hash = '#/settings/email-logs?search=bounce'; });
    await page.waitForChanges();
    await expect.poll(() => routes(page)).toEqual([['Settings', 'Failed emails'], ['Settings', 'Email Logs']]);
    await openFlyout(page, 'Settings');
    await expect(flyoutActive(page)).toHaveText(['Email Logs']);
  });
});

test.describe('ins-header breadcrumb bar with a query string', () => {
  test('a reload with Email Logs filters ends the bar in the current Email Logs crumb, not a link', async ({ page }) => {
    // The rail's trail (insRouteChange) after a filtered reload.
    await reloadAt(page, '#/settings/email-logs?search=bounce&range=last_7_days', PAGE_TRAIL, HEADER + RAIL);
    await expect.poll(() => routes(page)).toEqual([['Settings', 'Email Logs']]);
    await expect.poll(() => bar(page)).toEqual(EMAIL_LOGS_CURRENT);
  });

  test("the page's own trail ends in the current crumb too, and the leaf otherwise compares as before", async ({ page }) => {
    // No rail: the only trail is the one the page hands ins-breadcrumbs (insBreadcrumbsChange).
    await mount(page, `${HEADER}<ins-breadcrumbs></ins-breadcrumbs>`);
    await handTrail(page, '#/settings/email-logs?search=Send+test&range=last_7_days', PAGE_OWN_TRAIL);
    await expect.poll(() => bar(page)).toEqual(EMAIL_LOGS_CURRENT);

    // Each case ends in a leaf of its own label, so a poll cannot pass on the render between the hash change and
    // the new trail.
    const CRM = { link: '', label: 'CRM', withSubmenu: true };
    const CRM_TEXT = { label: 'CRM', as: 'text', ariaCurrent: null };
    // Unchanged without a query string.
    await handTrail(page, '#/crm/contacts', [CRM, { link: '#/crm/contacts', label: 'Contacts' }]);
    await expect.poll(() => bar(page)).toEqual([CRM_TEXT, { label: 'Contacts', as: 'current', ariaCurrent: 'page' }]);
    // The route still compares exactly: #/crm-something is not #/crm.
    await handTrail(page, '#/crm-something?x=1', [CRM, { link: '#/crm', label: 'Overview' }]);
    await expect.poll(() => bar(page)).toEqual([CRM_TEXT, { label: 'Overview', as: 'link', ariaCurrent: null }]);
    // A leaf whose own link carries the query string still matches the whole hash.
    await handTrail(page, '#/crm/contacts?view=all', [CRM, { link: '#/crm/contacts?view=all', label: 'All contacts' }]);
    await expect.poll(() => bar(page)).toEqual([CRM_TEXT, { label: 'All contacts', as: 'current', ariaCurrent: 'page' }]);
  });
});
