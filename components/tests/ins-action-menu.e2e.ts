import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-action-menu + ins-action-menu-item (TW#26717377).
 *
 * The submenu assertions are the ones this harness exists for. On TW#26673778 the channel flyouts
 * opened on hover AND toggled on click, so entering a row opened the flyout and the click that
 * followed shut it again: clicking a channel closed it. A screenshot cannot see that; a
 * hover-then-click sequence catches it immediately. Submenus now open on click or ArrowRight only.
 */

const MENU = `
  <ins-action-menu trigger-label="Actions">
    <ins-action-menu-item label="Edit" value="edit"></ins-action-menu-item>
    <ins-action-menu-item label="Send message" value="message">
      <ins-action-menu-item label="Email" value="email"></ins-action-menu-item>
      <ins-action-menu-item label="SMS" value="sms"></ins-action-menu-item>
    </ins-action-menu-item>
    <ins-action-menu-item label="Delete" value="delete" danger></ins-action-menu-item>
  </ins-action-menu>
`;

test.describe('ins-action-menu', () => {
  test('is closed until the trigger is clicked, then emits insOpenChange', async ({ page }) => {
    await mount(page, MENU);
    const panel = page.locator('ins-action-menu .ins-action-menu__panel');
    const spy = await page.spyOnEvent('insOpenChange');

    await expect(panel).toBeHidden();
    await page.locator('.ins-action-menu__trigger').click();
    await page.waitForChanges();

    await expect(panel).toBeVisible();
    expect(spy).toHaveReceivedEventDetail({ open: true });
  });

  test('selecting a leaf item emits insSelect and closes the menu', async ({ page }) => {
    await mount(page, MENU);
    const select = await page.spyOnEvent('insSelect');
    const openChange = await page.spyOnEvent('insOpenChange');

    await page.locator('.ins-action-menu__trigger').click();
    await page.locator('ins-action-menu-item[value="edit"] > .ins-action-menu-item__button').click();
    await page.waitForChanges();

    expect(select).toHaveReceivedEventDetail({ label: 'Edit', value: 'edit' });
    expect(openChange).toHaveReceivedEventDetail({ open: false });
    await expect(page.locator('.ins-action-menu__panel')).toBeHidden();
  });

  test('a submenu does NOT open on hover', async ({ page }) => {
    await mount(page, MENU);
    await page.locator('.ins-action-menu__trigger').click();
    const row = page.locator('ins-action-menu-item[value="message"]');
    const submenu = row.locator(':scope > .ins-action-menu-item__submenu');

    await row.locator(':scope > .ins-action-menu-item__button').hover();
    await page.waitForChanges();

    await expect(row).toHaveClass(/has-submenu/);
    await expect(submenu).toBeHidden();
  });

  test('hover then click on a submenu row leaves the submenu OPEN (the TW#26673778 regression)', async ({ page }) => {
    await mount(page, MENU);
    await page.locator('.ins-action-menu__trigger').click();
    const row = page.locator('ins-action-menu-item[value="message"]');
    const button = row.locator(':scope > .ins-action-menu-item__button');
    const submenu = row.locator(':scope > .ins-action-menu-item__submenu');

    // The exact sequence a mouse produces: pointer enters the row, then the click lands.
    await button.hover();
    await button.click();
    await page.waitForChanges();

    await expect(submenu).toBeVisible();
    await expect(row).toHaveClass(/is-open/);
    await expect(submenu.locator('ins-action-menu-item')).toHaveCount(2);
  });

  test('ArrowRight opens a submenu and moves focus into it', async ({ page }) => {
    await mount(page, MENU);
    await page.locator('.ins-action-menu__trigger').click();
    // Opening the menu focuses its first item on the next render. Let that land before moving focus
    // ourselves, or the key lands on "Edit" instead of the submenu row.
    await page.waitForChanges();
    const button = page.locator('ins-action-menu-item[value="message"] > .ins-action-menu-item__button');

    await button.focus();
    await button.press('ArrowRight');
    await page.waitForChanges();

    await expect(page.locator('ins-action-menu-item[value="message"] > .ins-action-menu-item__submenu')).toBeVisible();
    await expect(page.locator('ins-action-menu-item[value="email"] > .ins-action-menu-item__button')).toBeFocused();
  });

  test('Escape closes the menu and resets any open submenu', async ({ page }) => {
    await mount(page, MENU);
    await page.locator('.ins-action-menu__trigger').click();
    await page.locator('ins-action-menu-item[value="message"] > .ins-action-menu-item__button').click();
    await page.waitForChanges();

    await page.keyboard.press('Escape');
    await page.waitForChanges();

    await expect(page.locator('.ins-action-menu__panel')).toBeHidden();
    await expect(page.locator('ins-action-menu-item[value="message"]')).not.toHaveClass(/is-open/);
  });

  test('a disabled item neither selects nor opens', async ({ page }) => {
    await mount(page, `
      <ins-action-menu>
        <ins-action-menu-item label="Archive" value="archive" disabled></ins-action-menu-item>
      </ins-action-menu>`);
    const select = await page.spyOnEvent('insSelect');

    await page.locator('.ins-action-menu__trigger').click();
    const button = page.locator('ins-action-menu-item[value="archive"] > .ins-action-menu-item__button');
    // A real disabled control, so a user cannot click it at all; dispatch the click to prove the handler
    // also ignores it if something synthetic gets through.
    await expect(button).toBeDisabled();
    await button.dispatchEvent('click');
    await page.waitForChanges();

    expect(select).not.toHaveReceivedEvent();
  });
});
