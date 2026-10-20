import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-date-time on phones (TW#26807060). flatpickr swaps in the native date input on a mobile
 * user agent, and that input draws its own picker button. The field's calendar icon must not sit
 * on top of it, or the tap on the icon does nothing. Desktop keeps the icon.
 */
const field = '<ins-date-time label="Start Date" icon="icon-calendar" enable-time="true"></ins-date-time>';

test.describe('ins-date-time calendar icon', () => {
  test('is shown on desktop', async ({ page }) => {
    await mount(page, field);
    await expect(page.locator('ins-date-time .flatpickr-mobile')).toHaveCount(0);
    await expect(page.locator('ins-date-time i.icon-calendar')).toBeVisible();
  });

  test('is hidden when the native phone input is in use', async ({ browser }) => {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Linux; Android 16; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true,
    });
    const page: any = await ctx.newPage();
    await page.goto('/');
    await page.setContent(`<link rel="stylesheet" href="/assets/insites/css/insites-font-icons.css" /><link rel="stylesheet" href="/assets/insites/css/insites.css" /><script type="module" src="/build/insites.esm.js"></script>${field}`);
    await page.waitForSelector('ins-date-time .flatpickr-mobile', { state: 'attached' });
    await expect(page.locator('ins-date-time i.icon-calendar')).toBeHidden();
    await ctx.close();
  });
});
