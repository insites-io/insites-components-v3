# ins-checkbox-group



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default     |
| ----------------- | ------------------ | ----------- | --------- | ----------- |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`     |
| `checkValue`      | `check-value`      |             | `boolean` | `false`     |
| `description`     | `description`      |             | `string`  | `""`        |
| `disabled`        | `disabled`         |             | `boolean` | `undefined` |
| `errorMessage`    | `error-message`    |             | `string`  | `undefined` |
| `hasError`        | `has-error`        |             | `boolean` | `undefined` |
| `horizontal`      | `horizontal`       |             | `boolean` | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `label`           | `label`            |             | `string`  | `undefined` |
| `load`            | `load`             |             | `boolean` | `false`     |
| `multiple`        | `multiple`         |             | `boolean` | `undefined` |
| `readonly`        | `readonly`         |             | `boolean` | `undefined` |
| `tooltip`         | `tooltip`          |             | `string`  | `undefined` |
| `value`           | `value`            |             | `any`     | `[]`        |


## Events

| Event      | Description | Type               |
| ---------- | ----------- | ------------------ |
| `didLoad`  |             | `CustomEvent<any>` |
| `insInput` |             | `CustomEvent<any>` |


## Methods

### `getValue() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `insRecover() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `insReset() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setValue(value: string[]) => Promise<void>`



#### Parameters

| Name    | Type       | Description |
| ------- | ---------- | ----------- |
| `value` | `string[]` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-checkbox-group --> ins-input-tooltip
  style ins-checkbox-group fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
