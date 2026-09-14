# CHANGELOG

## Unreleased (TW#26717377)

- Added `variant="strip"`: the v6 record-page header metric strip (`.hm-strip`). The host becomes the flex row and carries the `hm-strip` class so the shared `insites.css` record-page layer (`.crm-hm-inline`, `.crm-hm-card`) matches it. Child tiles switch to their strip cell.
- Added `card` (strip only): cells share the row and wrap, for the standalone metrics card below 900px.
- Added `clickable`: opts every child tile into the button affordance. Off by default.
- `variant`, `card` and `clickable` cascade to the child tiles and re-render them on change.
- The default grid variant and `columns` render exactly as before.

## Initial

- `ins-metric-tile-group` added with `columns`.
