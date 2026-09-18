# ins-tab



<!-- Auto Generated Below -->


## Overview

Tabs. Two renderings share one public API (props, methods, insTabChange payload, header
class names, the :scope > .ins-tab > .ins-tab-headers > .ins-tab-header structure), so the
63 module views that drive this component keep working untouched:

- legacy: the original strip, unchanged.
- v6 (TW#26778152): the IIA v6 tab strip from the CRM record pages (ViewContact /
  ViewCompany's RecordTabs). Icon + label + optional count chip per tab, the design's
  colours and underline, icons dropped below 1280px, and no sideways scroll: tabs that do
  not fit move into a "More" menu at the end of the strip. The active tab is always visible
  in the strip; when it comes from the menu it takes the last visible slot.

The v6 rendering switches on automatically inside the v6 Admin Shell (a
<ins-sidebar variant="v6"> is on the page), the same detection the rail item uses, so no
module needs a commit. `variant="v6"` forces it (tests, pages outside the shell) and
`variant="legacy"` opts out.

Tab icons come from the item's icon="…" or, when absent, from utils/tab-icons by label.

## Properties

| Property    | Attribute    | Description                                                                                         | Type      | Default     |
| ----------- | ------------ | --------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `checkLoad` | `check-load` |                                                                                                     | `boolean` | `false`     |
| `hasLoad`   | `has-load`   |                                                                                                     | `string`  | `undefined` |
| `load`      | `load`       |                                                                                                     | `boolean` | `false`     |
| `moreLabel` | `more-label` | Label of the overflow menu trigger in the v6 strip.                                                 | `string`  | `'More'`    |
| `tabs`      | `tabs`       |                                                                                                     | `any`     | `[]`        |
| `variant`   | `variant`    | '' = detect from the page (v6 inside the Admin Shell, legacy elsewhere); 'v6' or 'legacy' to force. | `string`  | `''`        |


## Events

| Event          | Description | Type               |
| -------------- | ----------- | ------------------ |
| `didLoad`      |             | `CustomEvent<any>` |
| `insTabChange` |             | `CustomEvent<any>` |


## Methods

### `activateTab(place: number) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `place` | `number` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
