import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * List-page title under the v6 shell (bundle 3.4.5, TW#26951361).
 *
 * Every module's Header.vue renders `.page-title-wrapper.grid-x.align-justify.align-bottom`: a title column
 * (its ins-breadcrumbs, hidden under the shell, and h1.header-title) and, on list pages about a second later,
 * the actions in `div.grid-x.buttons-wrapper`. The legacy rules below come from sheets this harness does not
 * load (Foundation in CRM's insites.min.css, components.insites.io/dist/styles/app.min.css) and are copied
 * verbatim, minus prefixes and the h1's entry animation. They go after the bundle's sheet, as on the admin page.
 * A 38px box stands in for the buttons: 200px for ADD COMPANY and the kebab.
 */
const LEGACY = `<style>
  .grid-x{display:flex;flex-flow:row wrap}
  .align-justify{justify-content:space-between}
  .align-bottom{align-items:flex-end}
  .buttons-wrapper{display:flex;flex-direction:column-reverse}
  @media(min-width: 640px){.buttons-wrapper{flex-direction:row}}
  .page-title-wrapper{margin-bottom:0;display:block;margin-bottom:24px}
  @media(min-width: 640px){.page-title-wrapper{display:flex}}
  .page-title-wrapper .buttons-wrapper{margin-top:24px}
  .page-title-wrapper .header-title{font-weight:600;font-size:32px;line-height:40px;letter-spacing:-1px;margin:8px 0 0}
</style>`;

const page_ = (shell: boolean, title = 'Companies') => `${LEGACY}
  <div class="${shell ? 'iia-shell--v6' : ''}">
    <div class="page-title-wrapper grid-x align-justify align-bottom">
      <div id="title-col"><div><ins-breadcrumbs></ins-breadcrumbs></div><h1 class="header-title">${title}</h1></div>
    </div>
    <div id="below">Search Companies</div>
  </div>`;

const addButtons = (page, width = 200) => page.evaluate((w) => {
  document.querySelector('.page-title-wrapper').insertAdjacentHTML('beforeend',
    `<div class="grid-x buttons-wrapper" id="actions"><div style="height:38px;width:${w}px"></div></div>`);
}, width);

const tops = (page) => page.evaluate(() => {
  const top = (sel: string) => document.querySelector(sel).getBoundingClientRect().top;
  const bottom = (sel: string) => document.querySelector(sel).getBoundingClientRect().bottom;
  const actions = document.querySelector('#actions');
  return {
    title: top('h1.header-title'),
    below: top('#below'),
    row: document.querySelector('.page-title-wrapper').getBoundingClientRect().height,
    titleColBottom: bottom('#title-col'),
    actionsTop: actions ? actions.getBoundingClientRect().top : null,
    actionsBottom: actions ? actions.getBoundingClientRect().bottom : null,
    actionsMarginTop: actions ? getComputedStyle(actions).marginTop : null,
  };
});

test.describe('v6 list-page title', () => {
  // 700px is inside the 640px media block that carries the row-gap: one line stays 48px there too.
  for (const width of [1470, 700]) {
    test(`at ${width}px the title and the content below stay put when the buttons appear; the buttons bottom-align with the title`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await mount(page, page_(true));
      const before = await tops(page);
      expect(before.row).toBe(48);

      await addButtons(page);
      const after = await tops(page);
      expect(after.title).toBe(before.title);
      expect(after.below).toBe(before.below);
      expect(after.row).toBe(48);
      expect(after.actionsMarginTop).toBe('0px');
      expect(after.actionsBottom).toBe(after.titleColBottom);
    });
  }

  // API › Custom API Endpoints wraps like this from 640 to about 710px, a long database name at 768px. The
  // 500px box makes the pair wider than the row in any font, while the title alone still fits on its line.
  test('when the buttons wrap under a long title they keep a 24px gap below it, and the title stays put', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 900 });
    await mount(page, page_(true, 'Custom API Endpoints'));
    const before = await tops(page);
    expect(before.row).toBe(48);

    await addButtons(page, 500);
    const after = await tops(page);
    expect(after.title).toBe(before.title);
    expect(after.actionsMarginTop).toBe('0px');
    expect(after.actionsTop - after.titleColBottom).toBe(24);
    expect(after.row).toBe(48 + 24 + 38);
  });

  test('below 640px the stacked buttons keep their 24px gap under the title', async ({ page }) => {
    await page.setViewportSize({ width: 600, height: 900 });
    await mount(page, page_(true));
    await addButtons(page);
    const after = await tops(page);
    expect(after.actionsMarginTop).toBe('24px');
    expect(after.actionsTop - after.titleColBottom).toBe(24);
  });

  test('outside the v6 shell the legacy layout is untouched (the 14px drop still reproduces there)', async ({ page }) => {
    await page.setViewportSize({ width: 1470, height: 900 });
    await mount(page, page_(false));
    const before = await tops(page);
    await addButtons(page);
    const after = await tops(page);
    expect(after.actionsMarginTop).toBe('24px');
    expect(after.title - before.title).toBe(14);
  });
});
