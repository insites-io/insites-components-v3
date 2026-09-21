import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-record-header (TW#26778152): the CRM identity card as a bundle component. These pin the
 * parts a module SubHeader relies on when it swaps its own markup for this element: initials vs
 * image, the status pill colours, facts, and that slotted metrics/actions land where the design
 * puts them at wide and narrow widths.
 */

const EVENT = `<ins-record-header name="Demo Sydney Tech Summit" icon="icon-calendar" subtitle="Sydney Convention Centre" status="Enabled" status-color="green" facts='["12 Oct 2026","240 capacity","In person"]'>
  <span slot="pills" class="ins-record-header__pill ins-record-header__pill--blue">Conference</span>
  <ins-metric-tile-group slot="metrics" variant="strip">
    <ins-metric-tile label="Ticket revenue" value="AUD 12.4k" metric-key="tickets"></ins-metric-tile>
    <ins-metric-tile label="Sponsorship" value="AUD 3.0k" metric-key="sponsors"></ins-metric-tile>
    <ins-metric-tile label="Expenses" value="AUD 3.7k" metric-key="expenses"></ins-metric-tile>
  </ins-metric-tile-group>
  <div slot="actions"><button type="button" id="save">Save</button></div>
</ins-record-header>`;

test.describe('ins-record-header', () => {
  // One mount per test: a second page.setContent() under @stencil/playwright keeps the first document.
  test('renders initials on the brand colour when there is no image', async ({ page }) => {
    await mount(page, `<ins-record-header name="Amelia Nguyen"></ins-record-header>`);
    const avatar = page.locator('ins-record-header .ins-record-header__avatar');
    await expect(avatar).toHaveText('AN');
    const bg = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('renders the image instead of initials when one is given', async ({ page }) => {
    await mount(page, `<ins-record-header name="Amelia Nguyen" image="https://example.com/a.png"></ins-record-header>`);
    const avatar = page.locator('ins-record-header .ins-record-header__avatar');
    await expect(avatar).toHaveText('');
    await expect(avatar).toHaveClass(/has-image/);
    const img = await avatar.evaluate((el) => (el as HTMLElement).style.backgroundImage);
    expect(img).toContain('example.com/a.png');
  });

  test('an icon replaces the initials', async ({ page }) => {
    await mount(page, `<ins-record-header name="Demo Sydney Tech Summit" icon="icon-calendar"></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__avatar i')).toHaveClass(/icon-calendar/);
  });

  test('no-avatar hides the circle', async ({ page }) => {
    await mount(page, `<ins-record-header name="Demo Sydney Tech Summit" no-avatar></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__avatar')).toHaveCount(0);
  });

  test('name is the page h1; subtitle, website and facts render in order', async ({ page }) => {
    await mount(page, `<ins-record-header name="Demo Harbour Events Co." subtitle="Events agency" website="harbourevents.example.com" facts="Sydney, NSW, Since 2012"></ins-record-header>`);
    await expect(page.locator('ins-record-header h1.ins-record-header__name')).toHaveText('Demo Harbour Events Co.');
    await expect(page.locator('ins-record-header .ins-record-header__subtitle')).toHaveText('Events agency');
    const link = page.locator('ins-record-header a.ins-record-header__website');
    await expect(link).toHaveAttribute('href', 'https://harbourevents.example.com');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(page.locator('ins-record-header .ins-record-header__fact')).toHaveText(['Sydney', 'NSW', 'Since 2012']);
  });

  test('status pill takes the colour class and status-info sits before it', async ({ page }) => {
    await mount(page, `<ins-record-header name="X" status="Enabled" status-color="green" status-info="Published"></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__pill')).toHaveText('Enabled');
    await expect(page.locator('ins-record-header .ins-record-header__pill')).toHaveClass(/ins-record-header__pill--green/);
    await expect(page.locator('ins-record-header .ins-record-header__status-info')).toHaveText('Published');
  });

  test('status words from the old ins-tag map to the design colours', async ({ page }) => {
    await mount(page, `<ins-record-header name="X" status="Enabled" status-color="enabled"></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__pill')).toHaveClass(/ins-record-header__pill--green/);
  });

  test('an unknown status colour falls back to grey', async ({ page }) => {
    await mount(page, `<ins-record-header name="X" status="Odd" status-color="magenta"></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__pill')).toHaveClass(/ins-record-header__pill--grey/);
  });

  test('no status and no pills slot renders no pill row', async ({ page }) => {
    await mount(page, `<ins-record-header name="X"></ins-record-header>`);
    await expect(page.locator('ins-record-header .ins-record-header__pills')).toHaveCount(0);
  });

  test('slotted pills, metrics and actions land in their regions', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 600 });
    await mount(page, `<div style="width:1300px">${EVENT}</div>`);
    await expect(page.locator('ins-record-header .ins-record-header__pills .ins-record-header__pill')).toHaveText(['Enabled', 'Conference']);
    await expect(page.locator('ins-record-header .ins-record-header__metrics ins-metric-tile')).toHaveCount(3);
    await expect(page.locator('ins-record-header .ins-record-header__actions #save')).toBeVisible();
    await expect(page.locator('ins-record-header')).toHaveClass(/has-metrics/);
    await expect(page.locator('ins-record-header')).toHaveClass(/has-actions/);

    // wide: metrics sit on the identity row (same top as the name), not below it
    const rows = await page.evaluate(() => {
      const name = document.querySelector('ins-record-header .ins-record-header__name')!.getBoundingClientRect();
      const metrics = document.querySelector('ins-record-header .ins-record-header__metrics')!.getBoundingClientRect();
      return { nameBottom: name.bottom, metricsTop: metrics.top };
    });
    expect(rows.metricsTop).toBeLessThan(rows.nameBottom);
  });

  test('from 1180px down the metric strip drops to its own full-width row', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 700 });
    await mount(page, `<div style="width:1000px">${EVENT}</div>`);
    await page.waitForTimeout(100);
    const rows = await page.evaluate(() => {
      const card = document.querySelector('ins-record-header .ins-record-header__card')!.getBoundingClientRect();
      const name = document.querySelector('ins-record-header .ins-record-header__name')!.getBoundingClientRect();
      const metrics = document.querySelector('ins-record-header .ins-record-header__metrics')!.getBoundingClientRect();
      return { nameBottom: name.bottom, metricsTop: metrics.top, metricsWidth: metrics.width, cardWidth: card.width };
    });
    expect(rows.metricsTop).toBeGreaterThan(rows.nameBottom);
    expect(rows.metricsWidth).toBeGreaterThan(rows.cardWidth * 0.9);
  });

  test('archived dims the card; extra slot renders under it', async ({ page }) => {
    await mount(page, `<ins-record-header name="X" archived><div slot="extra" id="toggle">Toggle</div></ins-record-header>`);
    await expect(page.locator('ins-record-header')).toHaveClass(/is-archived/);
    const opacity = await page.locator('ins-record-header .ins-record-header__card').evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeLessThan(1);
    await expect(page.locator('ins-record-header .ins-record-header__extra #toggle')).toBeVisible();
  });

  test('a menu opened from the actions area paints above the tab strip that follows the header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 700 });
    await mount(page, `<div style="width:1000px">
      <ins-record-header name="Demo Leather Card Wallet" icon="icon-box" status="Enabled" status-color="enabled">
        <div slot="actions" class="sub-header details-buttons">
          <ins-button id="kebab" class="more-button" icon="icon-more-vertical" outlined color="blue" size="normal" options="Disable Product,Archive Product,Delete Product"></ins-button>
        </div>
      </ins-record-header>
      <ins-tab variant="v6">
        <ins-tab-item label="Details" active><p>panel</p></ins-tab-item>
        <ins-tab-item label="Variants"></ins-tab-item>
        <ins-tab-item label="Pricing"></ins-tab-item>
        <ins-tab-item label="Content"></ins-tab-item>
        <ins-tab-item label="Media"></ins-tab-item>
        <ins-tab-item label="Gallery"></ins-tab-item>
        <ins-tab-item label="Sitemap"></ins-tab-item>
        <ins-tab-item label="Metadata"></ins-tab-item>
        <ins-tab-item label="Open Graph"></ins-tab-item>
        <ins-tab-item label="Schema"></ins-tab-item>
        <ins-tab-item label="Event Stream"></ins-tab-item>
      </ins-tab>
    </div>`);
    await expect(page.locator('ins-record-header .ins-record-header__pill')).toHaveClass(/--green/);
    await page.locator('#kebab .carets').click(); // the caret toggles the options; the button itself is the primary action
    await page.waitForChanges();
    const item = page.locator('#kebab .options-wrap li.option').filter({ hasText: 'Archive Product' });
    await expect(item).toBeVisible();
    // the element under the menu item's centre must be the menu item (or inside it), not a tab header
    const onTop = await item.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { insideMenu: !!hit && (el.contains(hit) || hit.contains(el)), hitClass: hit?.className || '' };
    });
    expect(onTop.insideMenu, `menu item is covered by ${onTop.hitClass}`).toBe(true);
  });
});
