# ins-textarea



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default     |
| ----------------- | ------------------ | ----------- | --------- | ----------- |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`     |
| `checkValue`      | `check-value`      |             | `boolean` | `false`     |
| `counter`         | `counter`          |             | `string`  | `""`        |
| `description`     | `description`      |             | `string`  | `""`        |
| `disabled`        | `disabled`         |             | `boolean` | `false`     |
| `errorMessage`    | `error-message`    |             | `string`  | `undefined` |
| `hasError`        | `has-error`        |             | `boolean` | `false`     |
| `hasLoad`         | `has-load`         |             | `string`  | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `label`           | `label`            |             | `string`  | `undefined` |
| `load`            | `load`             |             | `boolean` | `false`     |
| `maxlength`       | `maxlength`        |             | `string`  | `""`        |
| `name`            | `name`             |             | `string`  | `undefined` |
| `placeholder`     | `placeholder`      |             | `string`  | `undefined` |
| `readonly`        | `readonly`         |             | `boolean` | `false`     |
| `required`        | `required`         |             | `boolean` | `false`     |
| `tooltip`         | `tooltip`          |             | `string`  | `""`        |
| `value`           | `value`            |             | `string`  | `undefined` |


## Events

| Event            | Description | Type               |
| ---------------- | ----------- | ------------------ |
| `didLoad`        |             | `CustomEvent<any>` |
| `insInput`       |             | `CustomEvent<any>` |
| `insValueChange` |             | `CustomEvent<any>` |


## Methods

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

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-textarea --> ins-input-tooltip
  style ins-textarea fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
