import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-tab v6 strip (TW#26778152).
 *
 * The strip the CRM record pages draw with their own RecordTabs.vue, moved into the bundle so
 * the other ten module SPAs (63 tabbed views, 292 tabs) get it from one release. Two things
 * these tests pin that a screenshot would not: the insTabChange payload must keep `label` as
 * the label text alone, because module routers build route names from it; and tabs that do not
 * fit must leave the strip for the More menu rather than make anything scroll sideways.
 *
 * Every spec forces variant="v6" because the page has no <ins-sidebar variant="v6">; the last
 * describe block checks that the detection itself works both ways.
 */

const tabs = (labels: string[], activeIndex = 0) =>
  labels
    .map((l, i) => `<ins-tab-item label="${l}"${i === activeIndex ? ' active' : ''}><p>${l} panel</p></ins-tab-item>`)
    .join('');

const TWENTY = [
  'Details', 'Venue', 'Pricing', 'Content', 'Speakers', 'Sponsors', 'Tickets', 'Ticket Layout', 'Expenses', 'Sitemap',
  'Metadata', 'Open Graph', 'Schema', 'Media', 'Gallery', 'FAQs', 'Alerts', 'Custom Fields', 'Event Stream', 'System Info',
];

async function noSidewaysScroll(page) {
  const overflow = await page.evaluate(() => {
    const strip = document.querySelector('ins-tab .ins-tab-headers') as HTMLElement;
    const doc = document.documentElement;
    return {
      strip: strip.scrollWidth - strip.clientWidth,
      page: doc.scrollWidth - doc.clientWidth,
    };
  });
  expect(overflow.strip, 'the strip must not scroll sideways').toBeLessThanOrEqual(0);
  expect(overflow.page, 'the page must not scroll sideways').toBeLessThanOrEqual(0);
}

test.describe('ins-tab v6 strip: icons and counts', () => {
  test('a tab with no icon gets the default glyph for its label; an explicit icon wins', async ({ page }) => {
    await mount(page, `<ins-tab variant="v6">
      <ins-tab-item label="Details" active></ins-tab-item>
      <ins-tab-item label="Pricing" icon="icon-star"></ins-tab-item>
      <ins-tab-item label="Something Unmapped"></ins-tab-item>
    </ins-tab>`);
    const icons = page.locator('ins-tab .ins-tab-header .iia-tabs__icon');
    await expect(icons).toHaveCount(2);
    await expect(icons.nth(0)).toHaveClass(/icon-file-text/);
    await expect(icons.nth(1)).toHaveClass(/icon-star/);
    // an unmapped label renders label-only, so the gap is visible rather than papered over
    await expect(page.locator('ins-tab .ins-tab-header').nth(2).locator('.iia-tabs__icon')).toHaveCount(0);
    await expect(page.locator('ins-tab .ins-tab-header').nth(2)).toHaveText('Something Unmapped');
  });

  test('a count renders as a chip and updates when the item prop changes', async ({ page }) => {
    await mount(page, `<ins-tab variant="v6">
      <ins-tab-item label="Details" active></ins-tab-item>
      <ins-tab-item label="Tasks" count="7"></ins-tab-item>
    </ins-tab>`);
    await expect(page.locator('ins-tab .ins-tab-header').nth(1).locator('.iia-tabs__count')).toHaveText('7');
    await expect(page.locator('ins-tab .ins-tab-header').nth(0).locator('.iia-tabs__count')).toHaveCount(0);

    await page.evaluate(() => { (document.querySelectorAll('ins-tab-item')[1] as any).count = 12; });
    await page.waitForChanges();
    await expect(page.locator('ins-tab .ins-tab-header').nth(1).locator('.iia-tabs__count')).toHaveText('12');
  });

  test('insTabChange reports index and the label text alone, without the count', async ({ page }) => {
    await mount(page, `<ins-tab variant="v6">
      <ins-tab-item label="Details" active></ins-tab-item>
      <ins-tab-item label="Body" count="3"></ins-tab-item>
    </ins-tab>`);
    const spy = await page.spyOnEvent('insTabChange');
    await page.locator('ins-tab .ins-tab-header').nth(1).click();
    await page.waitForChanges();
    // toHaveReceivedEventDetail deep-equals the whole detail, and detail.event is the MouseEvent, so read the fields
    expect(spy).toHaveReceivedEventTimes(1);
    expect(spy.lastEvent.detail.index).toBe(1);
    expect(spy.lastEvent.detail.label).toBe('Body');
    await expect(page.locator('ins-tab .ins-tab-header').nth(1)).toHaveClass(/active/);
    await expect(page.locator('ins-tab-item').nth(1).locator('> div')).toHaveClass(/active/);
  });

  test('has-error and disabled still mark the header', async ({ page }) => {
    await mount(page, `<ins-tab variant="v6">
      <ins-tab-item label="Details" active></ins-tab-item>
      <ins-tab-item label="Content" has-error></ins-tab-item>
      <ins-tab-item label="Schema" disabled></ins-tab-item>
    </ins-tab>`);
    await expect(page.locator('ins-tab .ins-tab-header').nth(1)).toHaveClass(/has-error/);
    await expect(page.locator('ins-tab .ins-tab-header').nth(2)).toHaveClass(/disabled/);
    const spy = await page.spyOnEvent('insTabChange');
    await page.locator('ins-tab .ins-tab-header').nth(2).click();
    await page.waitForChanges();
    expect(spy).not.toHaveReceivedEvent();
  });

  test('the active header follows the item when the SPA sets :active from the route', async ({ page }) => {
    await mount(page, `<ins-tab variant="v6">${tabs(['Details', 'Content', 'Schema'])}</ins-tab>`);
    await page.evaluate(() => {
      const items = document.querySelectorAll('ins-tab-item') as any;
      items[0].active = false; items[2].active = true;
    });
    await page.waitForChanges();
    await expect(page.locator('ins-tab .ins-tab-header').nth(2)).toHaveClass(/active/);
    await expect(page.locator('ins-tab .ins-tab-header').nth(0)).not.toHaveClass(/active/);
  });
});

test.describe('ins-tab v6 strip: overflow goes to More, never sideways', () => {
  test('six tabs at 1280 fit; no More trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, `<div style="width:900px"><ins-tab variant="v6">${tabs(['Event Stream', 'Activities', 'Tasks', 'Opportunities', 'Orders', 'Events'])}</ins-tab></div>`);
    await page.waitForTimeout(100);
    await expect(page.locator('ins-tab .iia-tabs__more')).toBeHidden();
    await expect(page.locator('ins-tab .ins-tab-header:visible')).toHaveCount(6);
    await noSidewaysScroll(page);
  });

  test('twenty tabs at 1280 collapse into More; the strip and page do not scroll sideways', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, `<div style="width:1000px"><ins-tab variant="v6">${tabs(TWENTY)}</ins-tab></div>`);
    await page.waitForTimeout(100);

    const more = page.locator('ins-tab .iia-tabs__more');
    await expect(more).toBeVisible();
    const visible = await page.locator('ins-tab .ins-tab-header:visible').count();
    const hidden = Number(await more.locator('.iia-tabs__count').textContent());
    expect(visible + hidden).toBe(20);
    expect(visible).toBeGreaterThan(1);
    await noSidewaysScroll(page);
  });

  test('choosing a tab from More activates it, emits insTabChange, and pulls it into the strip', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, `<div style="width:1000px"><ins-tab variant="v6">${tabs(TWENTY)}</ins-tab></div>`);
    await page.waitForTimeout(100);
    const spy = await page.spyOnEvent('insTabChange');

    await page.locator('ins-tab .iia-tabs__more-trigger').click();
    await page.waitForChanges();
    const menu = page.locator('ins-tab .iia-tabs__menu');
    await expect(menu).toBeVisible();
    // the last tab is always in the overflow at this width
    await menu.locator('.iia-tabs__menu-item').last().click();
    await page.waitForChanges();
    await page.waitForTimeout(100);

    expect(spy).toHaveReceivedEventTimes(1);
    expect(spy.lastEvent.detail.index).toBe(19);
    expect(spy.lastEvent.detail.label).toBe('System Info');
    await expect(menu).toBeHidden();
    const last = page.locator('ins-tab .ins-tab-header').nth(19);
    await expect(last).toBeVisible();
    await expect(last).toHaveClass(/active/);
    await expect(page.locator('ins-tab-item').nth(19).locator('> div')).toHaveClass(/active/);
    await noSidewaysScroll(page);
  });

  test('Escape and an outside click close the menu', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, `<div style="width:1000px"><ins-tab variant="v6">${tabs(TWENTY)}</ins-tab></div><p id="outside">outside</p>`);
    await page.waitForTimeout(100);
    await page.locator('ins-tab .iia-tabs__more-trigger').click();
    await expect(page.locator('ins-tab .iia-tabs__menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('ins-tab .iia-tabs__menu')).toBeHidden();
    await page.locator('ins-tab .iia-tabs__more-trigger').click();
    await expect(page.locator('ins-tab .iia-tabs__menu')).toBeVisible();
    await page.locator('#outside').click();
    await expect(page.locator('ins-tab .iia-tabs__menu')).toBeHidden();
  });

  test('below 1280 the icons drop, the labels stay, and it still does not scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await mount(page, `<ins-tab variant="v6">${tabs(TWENTY)}</ins-tab>`);
    await page.waitForTimeout(100);
    const firstIcon = page.locator('ins-tab .ins-tab-header').first().locator('.iia-tabs__icon');
    await expect(firstIcon).toBeHidden();
    await expect(page.locator('ins-tab .ins-tab-header').first().locator('.ins-tab-header__label')).toHaveText('Details');
    await noSidewaysScroll(page);
  });

  test('the strip re-fits when its container widens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await mount(page, `<div id="box" style="width:600px"><ins-tab variant="v6">${tabs(TWENTY.slice(0, 8))}</ins-tab></div>`);
    await page.waitForTimeout(100);
    const before = await page.locator('ins-tab .ins-tab-header:visible').count();
    expect(before).toBeLessThan(8);
    await page.evaluate(() => { (document.getElementById('box') as HTMLElement).style.width = '1200px'; });
    await page.waitForTimeout(150);
    await expect(page.locator('ins-tab .ins-tab-header:visible')).toHaveCount(8);
    await expect(page.locator('ins-tab .iia-tabs__more')).toBeHidden();
  });
});

test.describe('ins-tab variant detection', () => {
  test('without the v6 shell on the page the legacy strip renders unchanged', async ({ page }) => {
    await mount(page, `<ins-tab>${tabs(['Details', 'Content'])}</ins-tab>`);
    await expect(page.locator('ins-tab .ins-tab')).not.toHaveClass(/iia-tabs/);
    await expect(page.locator('ins-tab .iia-tabs__icon')).toHaveCount(0);
    await expect(page.locator('ins-tab .iia-tabs__more')).toHaveCount(0);
    await expect(page.locator('ins-tab .ins-tab-header').first()).toHaveClass(/active/);
  });

  test('with <ins-sidebar variant="v6"> on the page the strip switches to v6 on its own', async ({ page }) => {
    await mount(page, `<ins-sidebar variant="v6"></ins-sidebar><ins-tab>${tabs(['Details', 'Content'])}</ins-tab>`);
    await expect(page.locator('ins-tab .ins-tab')).toHaveClass(/iia-tabs/);
    await expect(page.locator('ins-tab .ins-tab-header').first().locator('.iia-tabs__icon')).toHaveClass(/icon-file-text/);
  });

  test('variant="legacy" opts out even inside the shell', async ({ page }) => {
    await mount(page, `<ins-sidebar variant="v6"></ins-sidebar><ins-tab variant="legacy">${tabs(['Details', 'Content'])}</ins-tab>`);
    await expect(page.locator('ins-tab .ins-tab')).not.toHaveClass(/iia-tabs/);
  });
});
