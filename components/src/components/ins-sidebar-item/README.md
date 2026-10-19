# ins-sidebar-item

One rail entry. Top-level items may carry `with-submenu` and nest further `ins-sidebar-item`
children; `app` items route into the renderer iframe. `routePageHandler()` builds the crumb trail
and emits `routePage`; `activate()`/`deactivate()` drive the active state.

## v6 rendering

When the closest `ins-sidebar` carries `variant="v6"` (TW#26371963), the item renders the Admin
Shell v1.5 row: 32px on a 2px gap, 13px type, `--iia-rail-fg-muted` resting and `--iia-rail-fg`
when hovered or active, a 2px `--ins-main` marker on the active module, a 16px Phosphor glyph
that cross-fades regular to fill when active, and a caret when the item has a sub-menu and the
rail is expanded. Nested items are not drawn inline; the parent rail lists them in a flyout and
routes a pick back through the child's own `routePageHandler()`, so crumbs and activation are
unchanged.

## Rail group (`rail-group`, v6 only)

The v6 rail sorts top-level items into the design's groups by their `icon` class (the list in
`utils/phosphor-shell-icons`). A module whose icon is not on that list can name the group itself
(TW#26868377):

```html
<ins-sidebar-item label="Activities" icon="icon-activity" link="#/activities" rail-group="work"></ins-sidebar-item>
```

| Value | Group |
| --- | --- |
| `work` | Work (CRM, Pipelines, Tasks) |
| `build` | Build |
| `sell` | Sell |
| `configure` | Configure |

- The value is trimmed and matched in any case. A declared value always wins over the icon lookup.
- Inside the group the item comes after the items the icon list ranks, in the order the partials
  emit it.
- Any other value, including `primary` and an empty string, logs one `console.warn` naming the
  item and the value (`ins-sidebar: unknown rail-group "reports" on "Activities"; valid values are
  work, build, sell, configure.`) and the item is placed by its icon as if the attribute were absent.
- An item with the `hide-for-medium` class stays in the hidden mobile-only group whatever its
  `rail-group`. Nested items ignore it, and so does a rail without `variant="v6"`.
- Without `rail-group` nothing changes: the icon lookup places the item, and an unlisted icon lands
  in the unlabelled trailing group.

<!-- Auto Generated Below -->


## Overview

IIA v6 rail item (TW#26371963). When the closest <ins-sidebar>
carries variant="v6" this item renders the Admin Shell v1.5 row instead of the
legacy one. Its public API and every method the module partials and the hash
router rely on are unchanged, so the ten module rail partials and the two
migration-seeded instance partials keep working untouched.

In v6 a top-level item with a submenu does NOT render its children inline; the
parent rail reads them and shows a flyout. Nested items render nothing
themselves, but stay in the DOM so routing, crumbs and activation keep working
through routePageHandler()/activate() exactly as before.

The icon: the legacy `icon="icon-…"` class is resolved centrally to a Phosphor
glyph (utils/phosphor-shell-icons). Unmapped classes fall back to the font icon,
so an unknown module still renders.

The group: a top-level item may name its rail group with `rail-group` (TW#26868377);
without it the rail places the item by its icon class, as before.

## Properties

| Property           | Attribute            | Description                                                                                                                                                                                                                                                                                                                                                           | Type      | Default                  |
| ------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------ |
| `app`              | `app`                |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `checkLoad`        | `check-load`         |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `externalLink`     | `external-link`      |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `externalLinkIcon` | `external-link-icon` |                                                                                                                                                                                                                                                                                                                                                                       | `string`  | `'icon-external-link-1'` |
| `footerLink`       | `footer-link`        |                                                                                                                                                                                                                                                                                                                                                                       | `string`  | `''`                     |
| `hasLoad`          | `has-load`           |                                                                                                                                                                                                                                                                                                                                                                       | `string`  | `undefined`              |
| `icon`             | `icon`               |                                                                                                                                                                                                                                                                                                                                                                       | `any`     | `'no-icon'`              |
| `label`            | `label`              |                                                                                                                                                                                                                                                                                                                                                                       | `string`  | `'Label'`                |
| `landingPage`      | `landing-page`       |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `link`             | `link`               |                                                                                                                                                                                                                                                                                                                                                                       | `any`     | `''`                     |
| `load`             | `load`               |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `railGroup`        | `rail-group`         | v6 rail only: the named group this top-level item sits in, `work`, `build`, `sell` or `configure` (trimmed, any case). It wins over the icon lookup and places the item after the group's icon-ranked items. Any other value logs one console.warn and falls back to the icon lookup. Ignored on nested items, on `hide-for-medium` items and without `variant="v6"`. | `string`  | `undefined`              |
| `tooltip`          | `tooltip`            |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |
| `withSubmenu`      | `with-submenu`       |                                                                                                                                                                                                                                                                                                                                                                       | `boolean` | `false`                  |


## Events

| Event       | Description | Type                                                                    |
| ----------- | ----------- | ----------------------------------------------------------------------- |
| `didHover`  |             | `CustomEvent<{ x: number; y: number; label: string; state: boolean; }>` |
| `didLoad`   |             | `CustomEvent<void>`                                                     |
| `routePage` |             | `CustomEvent<{ crumbs: any[]; redirect: boolean; }>`                    |


## Methods

### `activate() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `activateParent() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `deactivate() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `formatRoute() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `hideSubMenu() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `routePageHandler(e?: Event | string) => Promise<{ crumbs: any[]; }>`



#### Parameters

| Name | Type              | Description |
| ---- | ----------------- | ----------- |
| `e`  | `string \| Event` |             |

#### Returns

Type: `Promise<{ crumbs: any[]; }>`



### `showSubMenu() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
