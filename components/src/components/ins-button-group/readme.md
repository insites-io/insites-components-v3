# ins-button-group



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type      | Default     |
| -------------- | --------------- | ----------- | --------- | ----------- |
| `activeIndex`  | `active-index`  |             | `number`  | `0`         |
| `activeOption` | `active-option` |             | `string`  | `""`        |
| `checkLoad`    | `check-load`    |             | `boolean` | `false`     |
| `color`        | `color`         |             | `string`  | `'blue'`    |
| `disabled`     | `disabled`      |             | `boolean` | `undefined` |
| `hasLoad`      | `has-load`      |             | `string`  | `undefined` |
| `load`         | `load`          |             | `boolean` | `false`     |
| `options`      | `options`       |             | `string`  | `""`        |
| `size`         | `size`          |             | `string`  | `'normal'`  |


## Events

| Event      | Description | Type                                                             |
| ---------- | ----------- | ---------------------------------------------------------------- |
| `didLoad`  |             | `CustomEvent<void>`                                              |
| `insClick` |             | `CustomEvent<{ action: string; label: string; index: number; }>` |


## Methods

### `getActiveOption() => Promise<{ index: number; label: string; }>`



#### Returns

Type: `Promise<{ index: number; label: string; }>`



### `setActiveOption(option: string) => Promise<void>`



#### Parameters

| Name     | Type     | Description |
| -------- | -------- | ----------- |
| `option` | `string` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
