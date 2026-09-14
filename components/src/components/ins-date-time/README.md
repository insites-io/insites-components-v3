# ins-date-time



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default     |
| ----------------- | ------------------ | ----------- | --------- | ----------- |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`     |
| `checkValue`      | `check-value`      |             | `boolean` | `false`     |
| `description`     | `description`      |             | `string`  | `""`        |
| `disabled`        | `disabled`         |             | `boolean` | `false`     |
| `errorMessage`    | `error-message`    |             | `string`  | `""`        |
| `format`          | `format`           |             | `string`  | `undefined` |
| `hasError`        | `has-error`        |             | `boolean` | `false`     |
| `hasLoad`         | `has-load`         |             | `string`  | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `icon`            | `icon`             |             | `string`  | `""`        |
| `inline`          | `inline`           |             | `boolean` | `false`     |
| `label`           | `label`            |             | `string`  | `undefined` |
| `load`            | `load`             |             | `boolean` | `false`     |
| `maxDate`         | `max-date`         |             | `string`  | `""`        |
| `maxTime`         | `max-time`         |             | `string`  | `""`        |
| `minDate`         | `min-date`         |             | `string`  | `""`        |
| `minTime`         | `min-time`         |             | `string`  | `""`        |
| `mode`            | `mode`             |             | `string`  | `""`        |
| `name`            | `name`             |             | `string`  | `undefined` |
| `noMeridiem`      | `no-meridiem`      |             | `boolean` | `false`     |
| `placeholder`     | `placeholder`      |             | `string`  | `""`        |
| `readonly`        | `readonly`         |             | `boolean` | `false`     |
| `tooltip`         | `tooltip`          |             | `string`  | `""`        |
| `value`           | `value`            |             | `string`  | `""`        |


## Events

| Event            | Description | Type               |
| ---------------- | ----------- | ------------------ |
| `didLoad`        |             | `CustomEvent<any>` |
| `insInput`       |             | `CustomEvent<any>` |
| `insValueChange` |             | `CustomEvent<any>` |


## Methods

### `formatDate(date: Date) => Promise<string>`



#### Parameters

| Name   | Type   | Description |
| ------ | ------ | ----------- |
| `date` | `Date` |             |

#### Returns

Type: `Promise<string>`



### `getDate() => Promise<{ value: string; selected_dates: Date[]; }>`



#### Returns

Type: `Promise<{ value: string; selected_dates: Date[]; }>`



### `getValue() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `insRecover() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `insReset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setValue(value: string) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `value` | `string` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ins-filter](../ins-filter)
 - [ins-table](../ins-table)

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-date-time --> ins-input-tooltip
  ins-filter --> ins-date-time
  ins-table --> ins-date-time
  style ins-date-time fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
