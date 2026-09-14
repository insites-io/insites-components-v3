import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-metric-tile + ins-metric-tile-group (TW#26717377). These are the header metric tiles on
 * the Company and Contact record pages; the CRM routes a tile click to its tab via `metricKey`.
 */

test.describe('ins-metric-tile', () => {
  test('renders label and value', async ({ page }) => {
    await mount(page, `<ins-metric-tile label="Orders total (incl. tax)" value="AUD 121.4k" metric-key="orderTotal"></ins-metric-tile>`);
    await expect(page.locator('.hm-cell__label, .ins-metric-tile__label').first()).toHaveText('Orders total (incl. tax)');
    await expect(page.locator('.hm-cell__value, .ins-metric-tile__value').first()).toHaveText('AUD 121.4k');
  });

  test('a clickable tile emits insTileClick with its metricKey', async ({ page }) => {
    await mount(page, `<ins-metric-tile label="Contacts" value="12" metric-key="contacts" clickable></ins-metric-tile>`);
    const spy = await page.spyOnEvent('insTileClick');

    await page.locator('ins-metric-tile button').click();
    await page.waitForChanges();

    expect(spy).toHaveReceivedEventDetail({ metricKey: 'contacts' });
  });

  test('a non-clickable tile stays silent when clicked', async ({ page }) => {
    await mount(page, `<ins-metric-tile label="Contacts" value="12" metric-key="contacts"></ins-metric-tile>`);
    const spy = await page.spyOnEvent('insTileClick');

    // A non-clickable tile is not a button at all, which is the accessible way to say "nothing happens".
    await expect(page.locator('ins-metric-tile button')).toHaveCount(0);
    await page.locator('ins-metric-tile .ins-metric-tile__body').click({ force: true });
    await page.waitForChanges();

    expect(spy).not.toHaveReceivedEvent();
  });

  test('loading swaps the value for a placeholder and marks the button busy', async ({ page }) => {
    await mount(page, `<ins-metric-tile label="Open tasks" value="7" loading></ins-metric-tile>`);
    await expect(page.locator('.ins-metric-tile__placeholder')).toHaveCount(1);
    await expect(page.locator('.hm-cell__value, .ins-metric-tile__value')).toHaveCount(0);
    await expect(page.locator('ins-metric-tile .ins-metric-tile__body')).toHaveAttribute('aria-busy', 'true');
  });
});

test.describe('ins-metric-tile-group', () => {
  test('lays its tiles out and forwards a child click', async ({ page }) => {
    await mount(page, `
      <ins-metric-tile-group columns="3" clickable card>
        <ins-metric-tile label="A" value="1" metric-key="a" clickable></ins-metric-tile>
        <ins-metric-tile label="B" value="2" metric-key="b" clickable></ins-metric-tile>
        <ins-metric-tile label="C" value="3" metric-key="c" clickable></ins-metric-tile>
      </ins-metric-tile-group>`);
    const spy = await page.spyOnEvent('insTileClick');

    await expect(page.locator('ins-metric-tile')).toHaveCount(3);
    await page.locator('ins-metric-tile[metric-key="b"] button').click();
    await page.waitForChanges();

    expect(spy).toHaveReceivedEventDetail({ metricKey: 'b' });
  });
});
