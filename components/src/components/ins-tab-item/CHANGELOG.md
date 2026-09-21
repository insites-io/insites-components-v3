# v3.2.0 (TW#26778152)

- Added `count`: optional badge on the tab header (a number, or a non-empty string). Drawn by the v6 strip only; the legacy header ignores it.
- Added `insTabItemChange` (`{ prop }`), fired when `label`, `icon`, `count` or `active` changes after load, so `<ins-tab>` redraws the header. Previously a count arriving from an async fetch, or `:active` driven from the route, never reached the strip.

# v2.0.0

## Changes from V1
- Methods are now asynchronous
- Updated `tabItemError` to `insTabError` to avoid DOM event conflict 
- Updated `tabItemDisableToggled` to `insTabDisableToggle` to avoid DOM event conflict 