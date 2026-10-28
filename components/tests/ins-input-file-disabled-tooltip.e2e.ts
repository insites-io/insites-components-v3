import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-input-file when disabled (TW#26923706). The whole element had pointer-events: none, so on a
 * read-only form (the Data item View page) the label's tooltip could not be clicked. The tooltip
 * opens again; the dropzone stays disabled.
 */
const field = (disabled: boolean) =>
  `<ins-input-file label="Image" tooltip="Shown on the listing card" ${disabled ? 'disabled' : ''}></ins-input-file>`;

test.describe('ins-input-file tooltip', () => {
  test('opens on a disabled field', async ({ page }) => {
    await mount(page, field(true));
    await page.locator('ins-input-file ins-input-tooltip .ins-input-tooltip').click();
    await expect(page.locator('.tippy-box')).toContainText('Shown on the listing card');
  });

  test('leaves the disabled dropzone without pointer events', async ({ page }) => {
    await mount(page, field(true));
    const dropzone = page.locator('ins-input-file .ins-dropzone').first();
    await expect(dropzone).toHaveCSS('pointer-events', 'none');
  });

  test('still opens on an enabled field', async ({ page }) => {
    await mount(page, field(false));
    await page.locator('ins-input-file ins-input-tooltip .ins-input-tooltip').click();
    await expect(page.locator('.tippy-box')).toContainText('Shown on the listing card');
  });
});
