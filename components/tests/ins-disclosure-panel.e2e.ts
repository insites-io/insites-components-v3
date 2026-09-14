import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-disclosure-panel (TW#26717377). The CRM record pages mount each reference section inside
 * one of these, and read `insMount` to know when to fetch. So the contract that matters is: the
 * body is not "mounted" until first open, `insMount` fires exactly once, and the programmatic
 * methods change state without pretending the user did it (no insToggle).
 */

const PANEL = `
  <ins-disclosure-panel heading="Relationships" count="3" v6>
    <p class="body-copy">Three related contacts.</p>
  </ins-disclosure-panel>
`;

test.describe('ins-disclosure-panel', () => {
  test('starts closed with the count visible and the body hidden', async ({ page }) => {
    await mount(page, PANEL);
    // The v6 header renders the count as a .chip; the legacy header uses .ins-disclosure-panel_count.
    await expect(page.locator('ins-disclosure-panel .chip')).toHaveText('3');
    await expect(page.locator('[role="region"]')).toBeHidden();
    expect(await page.locator('ins-disclosure-panel').evaluate((el: any) => el.isMounted())).toBe(false);
  });

  test('clicking the header opens it, emits insToggle and insMount once', async ({ page }) => {
    await mount(page, PANEL);
    const toggle = await page.spyOnEvent('insToggle');
    const mountSpy = await page.spyOnEvent('insMount');

    await page.locator('.ins-disclosure-panel_header').click();
    await page.waitForChanges();

    await expect(page.locator('[role="region"]')).toBeVisible();
    await expect(page.locator('.body-copy')).toBeVisible();
    expect(toggle).toHaveReceivedEventDetail({ open: true, heading: 'Relationships' });
    expect(mountSpy).toHaveReceivedEventTimes(1);
    expect(mountSpy).toHaveReceivedEventDetail({ heading: 'Relationships' });

    // Close and reopen: the body stays mounted and insMount does not fire again.
    await page.locator('.ins-disclosure-panel_header').click();
    await page.locator('.ins-disclosure-panel_header').click();
    await page.waitForChanges();
    expect(mountSpy).toHaveReceivedEventTimes(1);
    expect(toggle).toHaveReceivedEventTimes(3);
  });

  test('openPanel() opens without emitting insToggle, and still mounts', async ({ page }) => {
    await mount(page, PANEL);
    const toggle = await page.spyOnEvent('insToggle');
    const mountSpy = await page.spyOnEvent('insMount');

    await page.locator('ins-disclosure-panel').evaluate((el: any) => el.openPanel());
    await page.waitForChanges();

    await expect(page.locator('[role="region"]')).toBeVisible();
    expect(toggle).not.toHaveReceivedEvent();
    expect(mountSpy).toHaveReceivedEventTimes(1);
  });

  test('eager mounts the body on load and fires insMount immediately', async ({ page }) => {
    // insMount fires during componentDidLoad, before a spy can be attached to the mounted page, so
    // count it with a listener installed before navigation instead.
    await page.addInitScript(() => {
      (window as any).__insMount = 0;
      window.addEventListener('insMount', () => { (window as any).__insMount += 1; });
    });
    await mount(page, `<ins-disclosure-panel heading="Tasks" eager><span>hi</span></ins-disclosure-panel>`);
    expect(await page.evaluate(() => (window as any).__insMount)).toBe(1);
    expect(await page.locator('ins-disclosure-panel').evaluate((el: any) => el.isMounted())).toBe(true);
    // Eager mounts, it does not open.
    await expect(page.locator('[role="region"]')).toBeHidden();
  });

  test('an empty count is not rendered', async ({ page }) => {
    await mount(page, `<ins-disclosure-panel heading="Notes" count=""></ins-disclosure-panel>`);
    await expect(page.locator('ins-disclosure-panel .chip, ins-disclosure-panel .ins-disclosure-panel_count')).toHaveCount(0);
  });

  test('disabled ignores header clicks', async ({ page }) => {
    await mount(page, `<ins-disclosure-panel heading="Locked" disabled><span>x</span></ins-disclosure-panel>`);
    const toggle = await page.spyOnEvent('insToggle');
    await page.locator('.ins-disclosure-panel_header').click({ force: true });
    await page.waitForChanges();
    expect(toggle).not.toHaveReceivedEvent();
    await expect(page.locator('[role="region"]')).toBeHidden();
  });
});
