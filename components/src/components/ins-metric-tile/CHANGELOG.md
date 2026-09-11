# CHANGELOG

## Unreleased (TW#26717377)

- Added `variant="strip"`: the v6 record-page header metric cell (`.hm-cell`) from the CRM Contact v1.4 / Company v1.0 designs. Value over a centred label, 120px minimum, left divider after the first cell, no card chrome. Inherited from `ins-metric-tile-group` when the tile's own `variant` is unset.
- Added `card`: strip cells share the row (`flex: 1 1 180px`) for the standalone metrics card the design shows below 900px. Inherits from the group when unset.
- `clickable` now also inherits from the group. Strip cells are informational unless opted in (cursor default, no hover tint), per the design.
- The default variant renders exactly as before. No prop, event, class or DOM change for existing consumers.

## Initial

- `ins-metric-tile` added with `label`, `value`, `hint`, `icon`, `metricKey`, `clickable`, `loading` and the `insTileClick` event.
