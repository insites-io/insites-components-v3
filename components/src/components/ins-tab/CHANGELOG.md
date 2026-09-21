# v3.2.0 (TW#26778152)

- Added the IIA v6 tab strip: the CRM record pages' RecordTabs look (icon + label + optional count chip, `--iia-text-3` idle / `--iia-text-1` active with a 2px `--ins-main` underline, icons dropped below 1280px), rendered inside the v6 Admin Shell automatically: a `<ins-sidebar variant="v6">` anywhere on the page switches it on, the same signal the rail item keys off.
- No sideways scroll in the v6 strip. Tabs that do not fit move into a "More" menu at the end (`.iia-tabs__more`, count chip of hidden tabs, click / Escape / outside-click to close). The active tab is always in the strip; picking one from the menu swaps it into the last visible slot. Re-fits on container resize and when the 1280px icon rule flips.
- Added `variant` (`''` detect, `'v6'`, `'legacy'`) and `moreLabel` props.
- Default tab icons by label (`utils/tab-icons.ts`, 102 labels from the module SPAs); an item's own `icon` still wins; unmapped labels render label-only.
- `insTabChange.detail.label` is the label text alone in both renderings (never the count chip). Module routers build route names from it.
- The legacy rendering is unchanged: same DOM, classes, `.scrollable` behaviour and events.

# v2.0.0

## Changes from V1
- Methods are now asynchronous
- Updated `onchangetab` to `insTabChange` to avoid DOM event conflict