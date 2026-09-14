import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * Token resolution guard (TW#26737045).
 *
 * On TW#26598247 two var(--ins-*) names referenced by the CRM SASS were defined nowhere, and
 * font-weight and colour silently fell back. An unresolved custom property raises no error
 * anywhere, so only an assertion on the computed value catches it. This is that assertion.
 *
 * The list is every --ins-* the module-v6-crm SPA reads from the bundle (measured 14 Sep 2026,
 * 51 names). Seven are excluded because the CRM defines them itself, in its own SASS, rather than
 * reading them from here: --ins-text-1/2/3 and --ins-ui-1/2/3/5. If either side changes ownership
 * of a token, this list is what tells you.
 *
 * When a module adds a dependency on a new --ins-* token, add it here in the same change.
 */
const BUNDLE_OWNED_TOKENS = [
  '--ins-alert-negative', '--ins-alert-negative-light',
  '--ins-alert-positive', '--ins-alert-positive-light',
  '--ins-alert-warning', '--ins-alert-warning-dark', '--ins-alert-warning-light',
  '--ins-border-color', '--ins-card',
  '--ins-color-ink', '--ins-color-negative', '--ins-color-orange', '--ins-color-orange-10p',
  '--ins-color-primary', '--ins-color-red', '--ins-color-red-10p',
  '--ins-disabled-opacity', '--ins-duration-fast', '--ins-ease-out',
  '--ins-font-family',
  '--ins-leading-snug', '--ins-leading-tight',
  '--ins-main', '--ins-main-dark', '--ins-main-light',
  '--ins-neutral', '--ins-radius',
  '--ins-shadow-1', '--ins-shadow-2',
  '--ins-space-2xs', '--ins-space-3xs', '--ins-space-lg', '--ins-space-md', '--ins-space-sm', '--ins-space-xs',
  '--ins-text-buttonlabel', '--ins-text-md', '--ins-text-sm', '--ins-text-xs',
  '--ins-title-5', '--ins-title-6',
  '--ins-weight-bold', '--ins-weight-regular', '--ins-weight-semibold',
];

test.describe('design tokens the CRM depends on', () => {
  test(`all ${BUNDLE_OWNED_TOKENS.length} bundle-owned --ins-* tokens resolve to a non-empty value`, async ({ page }) => {
    await mount(page, `<div id="probe"></div>`);

    const unresolved = await page.evaluate((tokens: string[]) => {
      const style = getComputedStyle(document.documentElement);
      return tokens.filter((t) => style.getPropertyValue(t).trim() === '');
    }, BUNDLE_OWNED_TOKENS);

    expect(unresolved, `unresolved tokens: ${unresolved.join(', ')}`).toEqual([]);
  });

  test('a token that is not defined anywhere really does read as empty (sanity check on the method)', async ({ page }) => {
    await mount(page, `<div></div>`);
    const value = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--ins-this-token-does-not-exist').trim()
    );
    expect(value).toBe('');
  });
});
