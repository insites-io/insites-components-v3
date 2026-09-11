# ins-metric-tile

A single metric: a value with a label, optional hint and icon. Usually placed inside an `ins-metric-tile-group`.

## Variants

**Default** (no `variant`, no group, or a group in its default variant): the boxed tile with card chrome, icon slot, label above the value and an optional hint. This is unchanged and is what every existing consumer gets.

**Strip** (`variant="strip"`, or inherited from `<ins-metric-tile-group variant="strip">`): the v6 record-page header metric cell from the CRM Contact v1.4 / Company v1.0 designs (`.hm-strip > .hm-cell`). The tile renders a `<button class="hm-cell">` with the value (`--ins-title-6`, semibold, `--ins-text-1`, tight leading) over a centred label (`--ins-text-xs`, `--ins-text-3`), `min-width: 120px`, `padding: 4px var(--ins-space-sm)`, a left divider on every cell after the first, and no card chrome. `icon` and `hint` are not rendered in this variant, matching the design. Every token has the design-system value as its CSS fallback, so the cell renders the same in modules that do not load the `--ins-*` semantic layer.

The design's default cell is informational: `cursor: default`, no hover tint, click does nothing. Set `clickable="true"` on the tile (or on the group) to opt into the button affordance: pointer cursor, `--ins-ui-1` hover, and `insTileClick` with the tile's `metricKey`.

### Placement

The shared `insites.css` record-page layer already carries the responsive rules for the two placements the design uses. The component emits the `.hm-strip` / `.hm-cell` class names; the consumer adds the placement class.

Inline, inside the identity header (desktop):

```html
<ins-metric-tile-group variant="strip" class="crm-hm-inline" clickable="true">
  <ins-metric-tile label="Open opportunities" value="4" metric-key="opportunities"></ins-metric-tile>
  <ins-metric-tile label="Last contacted" value="2h ago" metric-key="lastContact"></ins-metric-tile>
  <ins-metric-tile label="Open tasks" value="2" metric-key="tasks"></ins-metric-tile>
</ins-metric-tile-group>
```

Standalone card below 900px (the design swaps `.crm-hm-inline` for `.crm-hm-card` in a container query). `card` makes the cells share the row (`flex: 1 1 180px`) and wrap, stacking at 560px:

```html
<section class="crm-hm-card" style="background:var(--ins-card);border:1px solid var(--ins-border-color);border-radius:var(--ins-radius);padding:var(--ins-space-md)">
  <ins-metric-tile-group variant="strip" card="true" clickable="true">
    <ins-metric-tile label="Open opportunities" value="4" metric-key="opportunities"></ins-metric-tile>
    <ins-metric-tile label="Last contacted" value="2h ago" metric-key="lastContact"></ins-metric-tile>
    <ins-metric-tile label="Open tasks" value="2" metric-key="tasks"></ins-metric-tile>
  </ins-metric-tile-group>
</section>
```

`insTileClick` bubbles, so a consumer can listen once on the group.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type                   | Default     |
| ----------- | ------------ | ----------- | ---------------------- | ----------- |
| `card`      | `card`       |             | `boolean`              | `false`     |
| `checkLoad` | `check-load` |             | `boolean`              | `false`     |
| `clickable` | `clickable`  |             | `boolean`              | `false`     |
| `hasLoad`   | `has-load`   |             | `string`               | `undefined` |
| `hint`      | `hint`       |             | `string`               | `undefined` |
| `icon`      | `icon`       |             | `string`               | `undefined` |
| `label`     | `label`      |             | `string`               | `undefined` |
| `load`      | `load`       |             | `boolean`              | `false`     |
| `loading`   | `loading`    |             | `boolean`              | `false`     |
| `metricKey` | `metric-key` |             | `string`               | `undefined` |
| `value`     | `value`      |             | `string`               | `undefined` |
| `variant`   | `variant`    |             | `"default" \| "strip"` | `undefined` |


## Events

| Event          | Description | Type                                  |
| -------------- | ----------- | ------------------------------------- |
| `didLoad`      |             | `CustomEvent<void>`                   |
| `insTileClick` |             | `CustomEvent<{ metricKey: string; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
