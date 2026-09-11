# ins-input-table



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description | Type      | Default        |
| ------------------- | --------------------- | ----------- | --------- | -------------- |
| `addButtonColor`    | `add-button-color`    |             | `string`  | `"blue"`       |
| `addButtonIcon`     | `add-button-icon`     |             | `string`  | `"icon-plus"`  |
| `blankValues`       | `blank-values`        |             | `boolean` | `undefined`    |
| `checkLoad`         | `check-load`          |             | `boolean` | `false`        |
| `checkValue`        | `check-value`         |             | `boolean` | `false`        |
| `description`       | `description`         |             | `string`  | `""`           |
| `disabled`          | `disabled`            |             | `boolean` | `undefined`    |
| `errorMessage`      | `error-message`       |             | `string`  | `undefined`    |
| `hasError`          | `has-error`           |             | `boolean` | `undefined`    |
| `hasLoad`           | `has-load`            |             | `string`  | `undefined`    |
| `htmlDescription`   | `html-description`    |             | `boolean` | `false`        |
| `label`             | `label`               |             | `string`  | `undefined`    |
| `load`              | `load`                |             | `boolean` | `false`        |
| `readonly`          | `readonly`            |             | `boolean` | `undefined`    |
| `removeButtonColor` | `remove-button-color` |             | `string`  | `"blue"`       |
| `removeButtonIcon`  | `remove-button-icon`  |             | `string`  | `"icon-minus"` |
| `tableHeaders`      | `table-headers`       |             | `any`     | `[]`           |
| `tooltip`           | `tooltip`             |             | `string`  | `undefined`    |


## Events

| Event      | Description | Type               |
| ---------- | ----------- | ------------------ |
| `didLoad`  |             | `CustomEvent<any>` |
| `insInput` |             | `CustomEvent<any>` |


## Methods

### `getValue() => Promise<Record<string, string>[]>`



#### Returns

Type: `Promise<Record<string, string>[]>`



### `insRecover() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `insReset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setValue(value: Array<Record<string, string | null>>) => Promise<Record<string, string>[]>`



#### Parameters

| Name    | Type                       | Description |
| ------- | -------------------------- | ----------- |
| `value` | `Record<string, string>[]` |             |

#### Returns

Type: `Promise<Record<string, string>[]>`




## Dependencies

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)
- [ins-button](../ins-button)

### Graph
```mermaid
graph TD;
  ins-input-table --> ins-input-tooltip
  ins-input-table --> ins-button
  style ins-input-table fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
