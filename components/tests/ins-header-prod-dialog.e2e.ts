import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-header v6 production switch warning (TW#26936693).
 *
 * "Don't show me again" is the dialog's own checkbox with a <label for>: one centred line under the message,
 * the text toggles it, and keyboard focus shows a ring. On the admin page the legacy sheets below load after
 * the bundle; they are what used to stack ins-checkbox's box and label (display:block on both) and they restyle
 * every bare label and checkbox, so the specs load them too, verbatim minus vendor prefixes: legacy
 * dist/styles/app.min.css, Foundation from CRM's insites.min.css, and dist/styles/InsitesAdmin.min.css.
 */
const LEGACY = `<style>
  ins-checkbox .ins-checkbox-wrap label{display:block}
  ins-checkbox .ins-checkbox-wrap .ripple-check{display:block;top:0}
  label{color:var(--ins-text-1)}
  [type=checkbox],[type=radio]{box-sizing:border-box;padding:0}
  [type=checkbox],[type=file],[type=radio]{margin:0 0 1rem}
  [type=checkbox]+label,[type=radio]+label{display:inline-block;vertical-align:baseline;margin-left:.5rem;margin-right:1rem;margin-bottom:0}
  label{display:block;margin:0;font-size:.875rem;font-weight:400;line-height:1.8;color:#0a0a0a}
  label{font-size:var(--font-size-x-small,12px);font-weight:var(--font-bold,600);font-family:var(--font-main, "Open Sans", sans-serif);color:var(--color-primary,#2c3148);margin-bottom:2px;display:inline-block}
  .ins-form-field-wrap,.ins-select-wrap,ins-checkbox .ins-radio-checkbox label{margin-bottom:24px}
</style>`;

const CURRENT = 'staging-1';
const PROD = 'production-1';
const roster = [
  { id: CURRENT, name: 'IIA Staging', env: 'staging', domain: 'iia-staging.staging-insites.io' },
  { id: PROD, name: 'Combinate Website UAT', env: 'production', domain: 'uat.example.com' },
];

const PREFS = '**/insites/core/administrator-preferences**';

/** Every preference write the header sends, answered locally so nothing leaves the test server. */
const recordWrites = async (page) => {
  const writes: any[] = [];
  await page.route(PREFS, async (route) => {
    if (route.request().method() === 'POST') writes.push(JSON.parse(route.request().postData() || '{}').payload);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: { results: [] } }) });
  });
  return writes;
};

const openDialog = async (page) => {
  await mount(page, `${LEGACY}<ins-header id="hdr" variant="v6" environment="staging" instance-name="IIA Staging" instance-id="${CURRENT}"></ins-header>`);
  await page.evaluate((r) => document.getElementById('hdr').setAttribute('instances', JSON.stringify(r)), roster);
  await page.waitForChanges();
  await page.locator('ins-header [data-env-trigger]').click();
  await page.waitForChanges();
  await page.locator('ins-header [role="menuitemradio"]').filter({ hasText: 'Combinate Website UAT' }).click();
  await page.waitForChanges();
  await expect(page.locator('ins-header .iia-dialog--prod')).toBeVisible();
};

/** Box and label geometry against the dialog body's content box. */
const geometry = (page) => page.evaluate(() => {
  const body = document.querySelector('.iia-dialog--prod .iia-dialog__body') as HTMLElement;
  const box = document.getElementById('iia-prod-switch-skip').getBoundingClientRect();
  const label = document.querySelector('label[for="iia-prod-switch-skip"]').getBoundingClientRect();
  const b = body.getBoundingClientRect();
  const cs = getComputedStyle(body);
  const contentCentre = b.left + parseFloat(cs.paddingLeft) + (b.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) / 2;
  return {
    boxMid: box.top + box.height / 2, labelMid: label.top + label.height / 2,
    boxRight: box.right, labelLeft: label.left, labelHeight: label.height,
    rowCentre: (box.left + label.right) / 2, contentCentre,
    dialogRight: (document.querySelector('.iia-dialog--prod') as HTMLElement).getBoundingClientRect().right,
  };
});

const expectOneCentredLine = async (page) => {
  const g = await geometry(page);
  expect(Math.abs(g.boxMid - g.labelMid)).toBeLessThanOrEqual(1);
  expect(g.boxRight).toBeLessThan(g.labelLeft);
  expect(g.labelHeight).toBeLessThan(30);
  expect(Math.abs(g.rowCentre - g.contentCentre)).toBeLessThanOrEqual(1);
  return g;
};

test.describe('ins-header production switch warning', () => {
  test('says "a live production instance", in bold, and uses its own labelled checkbox', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await recordWrites(page);
    await openDialog(page);

    await expect(page.locator('ins-header .iia-dialog__p')).toContainText('Combinate Website UAT is a live production instance.');
    await expect(page.locator('ins-header .iia-dialog__p strong').first()).toHaveText('a live production instance');
    await expect(page.locator('ins-header .iia-dialog--prod ins-checkbox')).toHaveCount(0);
    await expect(page.locator('ins-header label[for="iia-prod-switch-skip"]')).toHaveText("Don't show me again");
    await expect(page.locator('ins-header #iia-prod-switch-skip')).toHaveAttribute('type', 'checkbox');
  });

  test('box and label share one line, centred under the message, at desktop width and at 380px', async ({ page }) => {
    await recordWrites(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await openDialog(page);
    await expectOneCentredLine(page);

    await page.setViewportSize({ width: 380, height: 800 });
    await page.waitForChanges();
    const g = await expectOneCentredLine(page);
    expect(g.dialogRight).toBeLessThanOrEqual(380);
  });

  test('clicking the label text ticks and unticks the box, and each change is saved', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const writes = await recordWrites(page);
    await openDialog(page);
    const box = page.locator('ins-header #iia-prod-switch-skip');
    const label = page.locator('ins-header label[for="iia-prod-switch-skip"]');

    await expect(box).not.toBeChecked();
    await label.click();
    await page.waitForChanges();
    await expect(box).toBeChecked();
    await label.click();
    await page.waitForChanges();
    await expect(box).not.toBeChecked();
    await expect.poll(() => writes).toEqual([
      { key: 'switcher:skip_production_warning', value: 'true' },
      { key: 'switcher:skip_production_warning', value: 'false' },
    ]);
  });

  test('keyboard focus on the checkbox draws a visible ring, and Space toggles it', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await recordWrites(page);
    await openDialog(page);
    const box = page.locator('ins-header #iia-prod-switch-skip');

    // Reach the checkbox from the keyboard: from Cancel, one Shift+Tab back.
    await page.locator('ins-header .iia-dialog--prod .iia-btn--outline').focus();
    await page.keyboard.press('Shift+Tab');
    const ring = await box.evaluate((el) => ({
      focused: el === document.activeElement,
      visible: el.matches(':focus-visible'),
      style: getComputedStyle(el).outlineStyle,
      width: getComputedStyle(el).outlineWidth,
    }));
    expect(ring).toEqual({ focused: true, visible: true, style: 'solid', width: '2px' });

    await page.keyboard.press('Space');
    await page.waitForChanges();
    await expect(box).toBeChecked();
  });
});
