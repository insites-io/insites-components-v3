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

  // What a module View page actually renders: readonly plus a disabled class, with the shared
  // dist/styles/app.min.css rule that makes a readonly ins-input-file pointer-events: none.
  test('opens on a readonly field under the shared stylesheet', async ({ page }) => {
    await mount(
      page,
      '<style>ins-input-file[readonly]{pointer-events:none}</style>' +
        '<ins-input-file label="Image" tooltip="Shown on the listing card" readonly class="disabled"></ins-input-file>',
    );
    await page.locator('ins-input-file ins-input-tooltip .ins-input-tooltip').click();
    await expect(page.locator('.tippy-box')).toContainText('Shown on the listing card');
    await expect(page.locator('ins-input-file .ins-dropzone').first()).toHaveCSS('pointer-events', 'none');
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
