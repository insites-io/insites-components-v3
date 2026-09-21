# ins-tab-item



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                                                                                                                                                     | Type      | Default     |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `active`    | `active`     |                                                                                                                                                                                                                                 | `boolean` | `undefined` |
| `count`     | `count`      | Optional badge on the tab header (the CRM record pages show a record count per tab). Only a number, or a non-empty string, renders; null/undefined/'' render no chip. Only drawn by the v6 strip; the legacy header ignores it. | `any`     | `null`      |
| `disabled`  | `disabled`   |                                                                                                                                                                                                                                 | `boolean` | `undefined` |
| `hasError`  | `has-error`  |                                                                                                                                                                                                                                 | `boolean` | `undefined` |
| `icon`      | `icon`       |                                                                                                                                                                                                                                 | `string`  | `""`        |
| `label`     | `label`      |                                                                                                                                                                                                                                 | `string`  | `""`        |
| `noPadding` | `no-padding` |                                                                                                                                                                                                                                 | `boolean` | `undefined` |


## Events

| Event                 | Description                                                                                                                                                                                                                                                          | Type                             |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `insTabDisableToggle` |                                                                                                                                                                                                                                                                      | `CustomEvent<any>`               |
| `insTabError`         |                                                                                                                                                                                                                                                                      | `CustomEvent<any>`               |
| `insTabItemChange`    | Fired when label, icon, count or active changes after load, so the parent <ins-tab> redraws the header it renders for this item (TW#26778152). The parent reads these props once at load; without this a count arriving from an async fetch never reached the strip. | `CustomEvent<{ prop: string; }>` |
| `insTabLoad`          |                                                                                                                                                                                                                                                                      | `CustomEvent<any>`               |


## Methods

### `activate() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `deactivate() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
