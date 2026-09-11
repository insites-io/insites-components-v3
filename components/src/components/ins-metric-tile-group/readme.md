# ins-metric-tile-group

Lays out a set of `ins-metric-tile` children.

## Variants

**Default** (no `variant`): a CSS grid of `columns` equal columns (default 3), collapsing to one column below 560px. Unchanged for existing consumers.

**Strip** (`variant="strip"`): the v6 record-page header metric strip from the CRM Contact v1.4 / Company v1.0 designs. The host becomes the `.hm-strip` flex row (`position: relative; display: flex; align-items: stretch`, no gap) and every child tile renders its strip cell. `columns` is ignored in this variant.

Because the host carries `.hm-strip`, the shared `insites.css` record-page rules match it directly. The consumer adds the placement class:

- `class="crm-hm-inline"` when the strip sits inside the identity header. The shared layer hides it below 900px and, at 1180px and below, drops it onto its own header row with left-aligned cells.
- Wrap the group in the design's `section.crm-hm-card` for the standalone metrics card the layer shows below 900px, and set `card="true"` so the cells share the row (`flex: 1 1 180px`, wrapping, stacking at 560px).

`clickable="true"` on the group opts every tile into the button affordance (pointer, hover tint, `insTileClick`). Off by default: the design's header cells are informational. A tile's own `clickable="true"` still opts that one tile in. `card`, `clickable` and `variant` cascade to the tiles live; changing them on the group re-renders the tiles.

```html
<ins-metric-tile-group variant="strip" class="crm-hm-inline" clickable="true">
  <ins-metric-tile label="Opportunities total" value="AUD 121.4k" metric-key="oppTotal"></ins-metric-tile>
  <ins-metric-tile label="Orders total (incl. tax)" value="AUD 90" metric-key="orderTotal"></ins-metric-tile>
  <ins-metric-tile label="Sponsorships total (incl. tax)" value="AUD 9.1k" metric-key="sponsTotal"></ins-metric-tile>
</ins-metric-tile-group>
```

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type                   | Default     |
| ----------- | ------------ | ----------- | ---------------------- | ----------- |
| `card`      | `card`       |             | `boolean`              | `false`     |
| `checkLoad` | `check-load` |             | `boolean`              | `false`     |
| `clickable` | `clickable`  |             | `boolean`              | `false`     |
| `columns`   | `columns`    |             | `number`               | `3`         |
| `hasLoad`   | `has-load`   |             | `string`               | `undefined` |
| `load`      | `load`       |             | `boolean`              | `false`     |
| `variant`   | `variant`    |             | `"default" \| "strip"` | `'default'` |


## Events

| Event     | Description | Type                |
| --------- | ----------- | ------------------- |
| `didLoad` |             | `CustomEvent<void>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
