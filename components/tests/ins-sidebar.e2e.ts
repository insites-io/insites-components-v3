import { test } from '@stencil/playwright';
import { expect } from '@playwright/test';
import { mount } from './helpers';

/**
 * ins-sidebar v6 rail groups and ins-sidebar-item `rail-group` (TW#26868377).
 *
 * The v6 rail places each top-level item by its legacy icon class (RAIL_GROUPS in
 * utils/phosphor-shell-icons). An icon the list does not know, such as icon-activity, used to land
 * in the unlabelled trailing group with no way for a module to say otherwise. `rail-group` names
 * the group on the item and wins over the icon lookup. These specs mount the CRM / Pipelines /
 * Tasks rail with an Activities item and read which group each item ends up in.
 */

type Item = { label: string; icon: string; attrs?: string };

const rail = (items: Item[], variant = 'v6') => `
  <ins-sidebar ${variant ? `variant="${variant}"` : ''}>
    ${items.map(i => `<ins-sidebar-item label="${i.label}" icon="${i.icon}" link="#/${i.label.toLowerCase()}" ${i.attrs || ''}></ins-sidebar-item>`).join('\n    ')}
  </ins-sidebar>
`;

const BASE: Item[] = [
  { label: 'Dashboard', icon: 'icon-dashboard' },
  { label: 'CRM', icon: 'icon-crm' },
  { label: 'Pipelines', icon: 'icon-filter' },
  { label: 'Tasks', icon: 'icon-task-list' },
  { label: 'Settings', icon: 'icon-settings-1' },
];

/** BASE with Activities emitted right after CRM, so "after the icon-ranked items" is a real reorder. */
const withActivities = (attrs?: string): Item[] => [
  BASE[0], BASE[1], { label: 'Activities', icon: 'icon-activity', attrs }, ...BASE.slice(2),
];

const groupLabels = (page, group: string) =>
  page.locator(`ins-sidebar .iia-rail__group[aria-label="${group}"] > ins-sidebar-item`)
    .evaluateAll((els: Element[]) => els.map(el => el.getAttribute('label')));

const railWarnings = (page) => {
  const warnings: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'warning' && msg.text().startsWith('ins-sidebar:')) warnings.push(msg.text()); });
  return warnings;
};

test.describe('ins-sidebar rail-group', () => {
  test('a declared rail-group puts the item in that group, after the icon-ranked items', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail(withActivities('rail-group="work"')));

    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Pipelines', 'Tasks', 'Activities']);
    expect(await groupLabels(page, 'More')).toEqual([]);
    expect(warnings).toEqual([]);
  });

  test('the declared value wins over the icon and is trimmed and case-insensitive', async ({ page }) => {
    const warnings = railWarnings(page);
    // icon-crm alone would put Reports in Work; the declared " Sell " moves it.
    await mount(page, rail([...BASE, { label: 'Reports', icon: 'icon-crm', attrs: 'rail-group=" Sell "' }]));

    expect(await groupLabels(page, 'Sell')).toEqual(['Reports']);
    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Pipelines', 'Tasks']);
    expect(warnings).toEqual([]);
  });

  test('without rail-group the icon lookup decides, as before, and nothing is logged', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail(withActivities()));

    expect(await groupLabels(page, 'Primary')).toEqual(['Dashboard']);
    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Pipelines', 'Tasks']);
    expect(await groupLabels(page, 'Configure')).toEqual(['Settings']);
    expect(await groupLabels(page, 'More')).toEqual(['Activities']);
    expect(warnings).toEqual([]);
  });

  test('an unknown value warns once, naming the item and the value, and falls back to the icon lookup', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail(withActivities('rail-group="reports"')));

    expect(await groupLabels(page, 'More')).toEqual(['Activities']);
    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Pipelines', 'Tasks']);
    expect(warnings).toEqual([
      'ins-sidebar: unknown rail-group "reports" on "Activities"; valid values are work, build, sell, configure.',
    ]);
  });

  test('"primary" and an empty value are not declarable: each warns and falls back', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail([
      ...BASE,
      { label: 'Activities', icon: 'icon-activity', attrs: 'rail-group="primary"' },
      { label: 'Cases', icon: 'icon-inbox', attrs: 'rail-group=""' },
      { label: 'Contacts', icon: 'icon-crm', attrs: 'rail-group="primary"' },
    ]));

    expect(await groupLabels(page, 'Primary')).toEqual(['Dashboard']);
    expect(await groupLabels(page, 'More')).toEqual(['Activities', 'Cases']);
    // Contacts falls back to its icon, which the list places in Work.
    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Contacts', 'Pipelines', 'Tasks']);
    expect(warnings).toHaveLength(3);
    expect(warnings[1]).toBe('ins-sidebar: unknown rail-group "" on "Cases"; valid values are work, build, sell, configure.');
  });

  test('a hide-for-medium item stays in the hidden mobile-only group whatever its rail-group', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail([...BASE, { label: 'My Profile', icon: 'icon-user-1', attrs: 'class="hide-for-medium" rail-group="work"' }]));

    expect(await groupLabels(page, 'Account')).toEqual(['My Profile']);
    expect(await groupLabels(page, 'Work')).toEqual(['CRM', 'Pipelines', 'Tasks']);
    expect(warnings).toEqual([]);
  });

  test('without variant="v6" the attribute does nothing: no groups, no warning', async ({ page }) => {
    const warnings = railWarnings(page);
    await mount(page, rail(withActivities('rail-group="reports"'), ''));

    await expect(page.locator('ins-sidebar .iia-rail__group')).toHaveCount(0);
    await expect(page.locator('ins-sidebar ins-sidebar-item[label="Activities"]')).toHaveCount(1);
    expect(warnings).toEqual([]);
  });

  test('railGroup is a documented property on ins-sidebar-item', async ({ page }) => {
    await mount(page, rail(withActivities('rail-group="work"')));
    expect(await page.locator('ins-sidebar-item[label="Activities"]').evaluate((el: any) => el.railGroup)).toBe('work');
  });
});
