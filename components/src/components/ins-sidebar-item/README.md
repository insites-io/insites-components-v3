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
unchanged. No new props.

<!-- Auto Generated Below -->


## Overview

IIA v6 rail item (TW#26371963). No new props: when the closest <ins-sidebar>
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

## Properties

| Property           | Attribute            | Description | Type      | Default                  |
| ------------------ | -------------------- | ----------- | --------- | ------------------------ |
| `app`              | `app`                |             | `boolean` | `false`                  |
| `checkLoad`        | `check-load`         |             | `boolean` | `false`                  |
| `externalLink`     | `external-link`      |             | `boolean` | `false`                  |
| `externalLinkIcon` | `external-link-icon` |             | `string`  | `'icon-external-link-1'` |
| `footerLink`       | `footer-link`        |             | `string`  | `''`                     |
| `hasLoad`          | `has-load`           |             | `string`  | `undefined`              |
| `icon`             | `icon`               |             | `any`     | `'no-icon'`              |
| `label`            | `label`              |             | `string`  | `'Label'`                |
| `landingPage`      | `landing-page`       |             | `boolean` | `false`                  |
| `link`             | `link`               |             | `any`     | `''`                     |
| `load`             | `load`               |             | `boolean` | `false`                  |
| `tooltip`          | `tooltip`            |             | `boolean` | `false`                  |
| `withSubmenu`      | `with-submenu`       |             | `boolean` | `false`                  |


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
