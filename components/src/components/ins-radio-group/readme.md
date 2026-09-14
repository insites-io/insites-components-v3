# ins-radio-group



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
| `hasNone`         | `has-none`         |             | `boolean` | `undefined` |
| `horizontal`      | `horizontal`       |             | `boolean` | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `label`           | `label`            |             | `string`  | `undefined` |
| `load`            | `load`             |             | `boolean` | `false`     |
| `multiple`        | `multiple`         |             | `boolean` | `undefined` |
| `noneLabel`       | --                 |             | `String`  | `"None"`    |
| `readonly`        | `readonly`         |             | `boolean` | `undefined` |
| `tooltip`         | `tooltip`          |             | `string`  | `undefined` |
| `value`           | `value`            |             | `any`     | `null`      |


## Events

| Event      | Description | Type                           |
| ---------- | ----------- | ------------------------------ |
| `didLoad`  |             | `CustomEvent<void>`            |
| `insInput` |             | `CustomEvent<{ value: any; }>` |


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



### `setValue(value: string | any[]) => Promise<void>`



#### Parameters

| Name    | Type              | Description |
| ------- | ----------------- | ----------- |
| `value` | `string \| any[]` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)
- [ins-radio](../ins-radio)

### Graph
```mermaid
graph TD;
  ins-radio-group --> ins-input-tooltip
  ins-radio-group --> ins-radio
  ins-radio --> ins-input-tooltip
  style ins-radio-group fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
