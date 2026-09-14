import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-search-scope (TW#26717377). The Contacts and Companies list search: a scope picker
 * ("Search by: Name") beside a text field. Contacts.vue passes the scope options as a plain array
 * of field names, so both option shapes are exercised.
 */

const SEARCH = `
  <ins-search-scope
    scope="name"
    scope-options='[{"label":"Name","value":"name"},{"label":"Email","value":"email"},"Phone"]'
    placeholder="Search contacts">
  </ins-search-scope>
`;

test.describe('ins-search-scope', () => {
  test('shows the current scope label in the trigger', async ({ page }) => {
    await mount(page, SEARCH);
    await expect(page.locator('.ins-search-scope__field')).toHaveText('Name');
    await expect(page.locator('.ins-search-scope__menu')).toBeHidden();
  });

  test('Enter emits insSearch with the trimmed value and the scope', async ({ page }) => {
    await mount(page, SEARCH);
    const spy = await page.spyOnEvent('insSearch');

    await page.locator('.ins-search-scope__input').fill('  acme  ');
    await page.locator('.ins-search-scope__input').press('Enter');
    await page.waitForChanges();

    expect(spy).toHaveReceivedEventDetail({ value: 'acme', scope: 'name' });
  });

  test('picking a scope from the menu emits insScopeChange and updates the trigger', async ({ page }) => {
    await mount(page, SEARCH);
    const spy = await page.spyOnEvent('insScopeChange');

    await page.locator('.ins-search-scope__trigger').click();
    await page.waitForChanges();
    await expect(page.locator('.ins-search-scope__menu')).toBeVisible();
    await expect(page.locator('.ins-search-scope__option')).toHaveCount(3);

    await page.locator('.ins-search-scope__option', { hasText: 'Email' }).click();
    await page.waitForChanges();

    expect(spy).toHaveReceivedEventDetail({ scope: 'email', label: 'Email' });
    await expect(page.locator('.ins-search-scope__field')).toHaveText('Email');
    await expect(page.locator('.ins-search-scope__menu')).toBeHidden();
  });

  test('a bare-string option works as both label and value', async ({ page }) => {
    await mount(page, SEARCH);
    const spy = await page.spyOnEvent('insScopeChange');
    await page.locator('.ins-search-scope__trigger').click();
    await page.locator('.ins-search-scope__option', { hasText: 'Phone' }).click();
    await page.waitForChanges();
    expect(spy).toHaveReceivedEventDetail({ scope: 'Phone', label: 'Phone' });
  });

  test('clear empties the field and emits insClear with the scope', async ({ page }) => {
    await mount(page, SEARCH);
    const spy = await page.spyOnEvent('insClear');

    await page.locator('.ins-search-scope__input').fill('acme');
    await page.waitForChanges();
    await page.locator('.ins-search-scope__clear').click();
    await page.waitForChanges();

    await expect(page.locator('.ins-search-scope__input')).toHaveValue('');
    expect(spy).toHaveReceivedEventDetail({ scope: 'name' });
  });

  test('insInput fires on every keystroke; debounce delays insSearch and collapses the burst to one', async ({ page }) => {
    await mount(page, `<ins-search-scope scope="name" scope-options='["Name"]' debounce="150"></ins-search-scope>`);
    const input = await page.spyOnEvent('insInput');
    const search = await page.spyOnEvent('insSearch');

    await page.locator('.ins-search-scope__input').pressSequentially('acm', { delay: 20 });
    await page.waitForChanges();
    expect(input).toHaveReceivedEventTimes(3);
    expect(input).toHaveReceivedEventDetail({ value: 'acm', scope: 'name' });
    expect(search).not.toHaveReceivedEvent();

    await page.waitForTimeout(300);
    await page.waitForChanges();
    expect(search).toHaveReceivedEventTimes(1);
    expect(search).toHaveReceivedEventDetail({ value: 'acm', scope: 'name' });
  });
});
