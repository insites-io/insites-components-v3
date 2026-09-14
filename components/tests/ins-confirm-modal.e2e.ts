import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-confirm-modal (TW#26717377). The typed-word gate is the whole point of this component: a
 * destructive action must not be confirmable until the word is typed. Note the gate is expressed
 * as aria-disabled on the confirm button, not the disabled attribute, so it stays focusable for
 * screen readers; the specs assert on what the component actually does about a premature click.
 */

const MODAL = `
  <ins-confirm-modal heading="Delete company" confirm-word="DELETE" dialog-label="Delete company" open>
    <p>This permanently deletes Acme Pty Ltd and its 14 contacts.</p>
  </ins-confirm-modal>
`;

test.describe('ins-confirm-modal', () => {
  test('renders open with the prompt naming the confirm word', async ({ page }) => {
    await mount(page, MODAL);
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    await expect(page.locator('.ins-confirm-modal-heading')).toHaveText('Delete company');
    await expect(page.locator('.ins-confirm-modal-label')).toContainText('"DELETE"');
    await expect(page.locator('.ins-confirm-modal-confirm')).toHaveAttribute('aria-disabled', 'true');
  });

  test('confirm is gated until the word matches, then emits insConfirm', async ({ page }) => {
    await mount(page, MODAL);
    const confirm = await page.spyOnEvent('insConfirm');
    const input = page.locator('.ins-confirm-modal-input');
    const button = page.locator('.ins-confirm-modal-confirm');

    // Wrong word: still gated, click does nothing.
    await input.fill('DELET');
    await page.waitForChanges();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    // aria-disabled keeps the button focusable for screen readers, so the gate is in the handler,
    // not the attribute. Force the click past Playwright's actionability check to test that gate.
    await button.click({ force: true });
    await page.waitForChanges();
    expect(confirm).not.toHaveReceivedEvent();

    // Right word, case-insensitive: gate lifts and the click confirms.
    await input.fill('delete');
    await page.waitForChanges();
    await expect(button).toHaveAttribute('aria-disabled', 'false');
    await button.click();
    await page.waitForChanges();
    expect(confirm).toHaveReceivedEventTimes(1);
  });

  test('Enter in the input confirms only once the word matches', async ({ page }) => {
    await mount(page, MODAL);
    const confirm = await page.spyOnEvent('insConfirm');
    const input = page.locator('.ins-confirm-modal-input');

    await input.fill('nope');
    await input.press('Enter');
    await page.waitForChanges();
    expect(confirm).not.toHaveReceivedEvent();

    await input.fill('DELETE');
    await input.press('Enter');
    await page.waitForChanges();
    expect(confirm).toHaveReceivedEventTimes(1);
  });

  test('cancel and Escape both close and emit insClose without confirming', async ({ page }) => {
    await mount(page, MODAL);
    const close = await page.spyOnEvent('insClose');
    const confirm = await page.spyOnEvent('insConfirm');

    await page.locator('.ins-confirm-modal-cancel').click();
    await page.waitForChanges();
    expect(close).toHaveReceivedEventTimes(1);
    expect(await page.locator('ins-confirm-modal').evaluate((el: any) => el.open)).toBe(false);

    await page.locator('ins-confirm-modal').evaluate((el: any) => el.show());
    await page.waitForChanges();
    await page.keyboard.press('Escape');
    await page.waitForChanges();
    expect(close).toHaveReceivedEventTimes(2);
    expect(confirm).not.toHaveReceivedEvent();
  });

  test('reopening clears what was typed, so the gate is armed again', async ({ page }) => {
    await mount(page, MODAL);
    const input = page.locator('.ins-confirm-modal-input');
    await input.fill('DELETE');
    await page.waitForChanges();
    await expect(page.locator('.ins-confirm-modal-confirm')).toHaveAttribute('aria-disabled', 'false');

    await page.locator('ins-confirm-modal').evaluate((el: any) => el.hide());
    await page.locator('ins-confirm-modal').evaluate((el: any) => el.show());
    await page.waitForChanges();

    await expect(input).toHaveValue('');
    await expect(page.locator('.ins-confirm-modal-confirm')).toHaveAttribute('aria-disabled', 'true');
  });
});
