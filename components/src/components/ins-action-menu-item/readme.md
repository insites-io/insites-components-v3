# ins-action-menu-item

One row of an `ins-action-menu`. Nest `ins-action-menu-item` children to make a submenu (the row gains an
`icon-chevron-right` and `aria-haspopup="menu"`). Emits `insSelect` with `{ label, value }`; `value`
falls back to `label`.

Additive props for the IIA v6 record pages:

- `divider` renders a 1px `--ins-border-color` rule (`role="separator"`) instead of a button. Arrow keys
  skip it. Use it between item groups.
- `slot-label` renders secondary text right-aligned after the label in the small muted style. The design's
  channel flyouts put the address in `label` ("shane@insites.io") and the slot here ("Email 1").

Inside `<ins-action-menu variant="record">` the row picks up the record-page treatment from the parent's
class (light DOM cascade). A submenu row opens on click or ArrowRight and closes on a second click or
ArrowLeft; it never opens on hover, for the reason given in `ins-action-menu`'s readme. Nested children
added after mount are picked up (a MutationObserver keeps `hasSubmenu` current).

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `checkLoad` | `check-load` |             | `boolean` | `false`     |
| `danger`    | `danger`     |             | `boolean` | `false`     |
| `disabled`  | `disabled`   |             | `boolean` | `false`     |
| `divider`   | `divider`    |             | `boolean` | `false`     |
| `hasLoad`   | `has-load`   |             | `string`  | `undefined` |
| `icon`      | `icon`       |             | `string`  | `''`        |
| `label`     | `label`      |             | `string`  | `''`        |
| `load`      | `load`       |             | `boolean` | `false`     |
| `slotLabel` | `slot-label` |             | `string`  | `''`        |
| `value`     | `value`      |             | `string`  | `''`        |


## Events

| Event       | Description | Type                                             |
| ----------- | ----------- | ------------------------------------------------ |
| `didLoad`   |             | `CustomEvent<void>`                              |
| `insSelect` |             | `CustomEvent<{ label: string; value: string; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
