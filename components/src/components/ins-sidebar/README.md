# ins-sidebar

The admin rail. Holds `ins-sidebar-item` children (contributed by each module's own
`insites_menu/*_side_menu.liquid` partial plus two migration-seeded instance partials), owns
the hash router that activates the matching item, and forwards `routePage` to `ins-renderer`.

## Default rendering

Unchanged from the original: 240px fixed rail with the logo at the top, collapsing to 50px on
`body.mini`, sub-menus opening inline.

## v6 variant (IIA Admin Shell v1.5, opt-in)

`variant="v6"` renders the Admin Shell v1.5 rail (TW#26371963). The rail is a flex sibling of the
content column under the 56px header rather than a fixed strip: 216px expanded, 64px collapsed
(56px below 768px), `--ins-chrome-bg`, no logo (the header carries it). One shared hover pill
slides between rows, the active module shows a 2px `--ins-main` marker and its icon cross-fades
from Phosphor regular to fill. Before the first render the rail arranges its top-level items into
the design's groups (Dashboard; Work; Build; Sell; Configure), each labelled group opening with a
1px rule and a 12px label; the collapsed rail keeps only the rules. The grouping is keyed by each
item's `icon` class in `utils/phosphor-shell-icons`, so partials stay untouched, and any module the
design does not place lands in an unlabelled trailing group. A module with a sub-menu opens a fixed flyout beside the rail
on hover (tap below 1024px). Only the Dashboard item carries a divider after it.

Nothing about the items' API changes. Each item's existing `icon="icon-…"` class is resolved to a
Phosphor glyph by the map in `utils/phosphor-shell-icons.ts`; an unmapped class keeps its font
icon. Collapsed state still rides `body.mini` and `minimise()`/`maximise()`, mirrored onto the
`iia-rail--collapsed` host class the CSS reads. Below 1280px the rail overlays the content and
the body row keeps a collapsed-width gutter (design: overlay mode).

```html
<ins-sidebar variant="v6">
  <div>
    <ins-sidebar-item link="#" icon="icon-dashboard" label="Dashboard"></ins-sidebar-item>
    <ins-sidebar-item icon="icon-crm" label="CRM" with-submenu>
      <ins-sidebar-item link="#/crm/contacts" label="Contacts"></ins-sidebar-item>
    </ins-sidebar-item>
  </div>
</ins-sidebar>
```

Styles live in the shared `insites.css` under "IIA v6 admin shell layer"; the class names are all
`iia-*` so none of the legacy `.ins-sidebar` / `body.mini` rules match the v6 DOM.

<!-- Auto Generated Below -->


## Overview

IIA v6 shell rail (TW#26371963) is an ADDITIVE variant of this component.

`variant="v6"` renders the Admin Shell v1.5 rail: 216px expanded / 64px collapsed
(56px below 768px), shared sliding hover pill, 2px active marker, Phosphor
outline-to-fill icons, hover flyouts for sub-menus. The default render, the hash
routing, `minimise()`/`maximise()` and the `routePage` listener are unchanged,
so every module partial that emits <ins-sidebar-item> keeps working with no
edit, which is the decision recorded on that task. Child items detect the
variant through `closest('ins-sidebar[variant="v6"]')`.

Collapsed state still rides `body.mini` + `minimised`, because ins-sidebar-item
and the legacy ins-header toggle both key off those. The v6 CSS reads the
`iia-rail--collapsed` host class that mirrors `minimised`.

## Properties

| Property    | Attribute    | Description                                                         | Type      | Default     |
| ----------- | ------------ | ------------------------------------------------------------------- | --------- | ----------- |
| `checkLoad` | `check-load` |                                                                     | `boolean` | `false`     |
| `fullLogo`  | `full-logo`  |                                                                     | `string`  | `undefined` |
| `hasLoad`   | `has-load`   |                                                                     | `string`  | `undefined` |
| `iconLogo`  | `icon-logo`  |                                                                     | `string`  | `undefined` |
| `load`      | `load`       |                                                                     | `boolean` | `false`     |
| `variant`   | `variant`    | '' keeps the original rendering. 'v6' is the Admin Shell v1.5 rail. | `string`  | `''`        |


## Events

| Event              | Description                                   | Type                                             |
| ------------------ | --------------------------------------------- | ------------------------------------------------ |
| `didLoad`          |                                               | `CustomEvent<void>`                              |
| `insFlyoutChange`  | v6: fires when a rail flyout opens or closes. | `CustomEvent<{ open: boolean; label: string; }>` |
| `insSidebarAction` |                                               | `CustomEvent<any>`                               |


## Methods

### `closeFlyout() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `deactivateSidebarItems() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `isCollapsed() => Promise<boolean>`

v6: whether the rail is collapsed.

#### Returns

Type: `Promise<boolean>`



### `maximise() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `minimise() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `railItemEnter(itemEl: HTMLElement) => Promise<void>`

Called by top-level ins-sidebar-item on pointer enter (v6).

#### Parameters

| Name     | Type          | Description |
| -------- | ------------- | ----------- |
| `itemEl` | `HTMLElement` |             |

#### Returns

Type: `Promise<void>`



### `railItemLeave() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `toggleFlyout(host: HTMLInsSidebarItemElement) => Promise<void>`

Called by a top-level ins-sidebar-item with a submenu when clicked (v6).

#### Parameters

| Name   | Type                        | Description |
| ------ | --------------------------- | ----------- |
| `host` | `HTMLInsSidebarItemElement` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
