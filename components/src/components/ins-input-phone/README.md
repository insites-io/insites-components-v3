# ins-input-tel



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default     |
| ----------------- | ------------------ | ----------- | --------- | ----------- |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`     |
| `description`     | `description`      |             | `string`  | `""`        |
| `disabled`        | `disabled`         |             | `boolean` | `undefined` |
| `errorMessage`    | `error-message`    |             | `string`  | `""`        |
| `fieldId`         | `field-id`         |             | `string`  | `""`        |
| `hasError`        | `has-error`        |             | `boolean` | `undefined` |
| `hasLoad`         | `has-load`         |             | `string`  | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `invalidMessage`  | `invalid-message`  |             | `string`  | `""`        |
| `label`           | `label`            |             | `string`  | `""`        |
| `load`            | `load`             |             | `boolean` | `false`     |
| `name`            | `name`             |             | `string`  | `""`        |
| `placeholder`     | `placeholder`      |             | `string`  | `""`        |
| `readonly`        | `readonly`         |             | `boolean` | `undefined` |
| `required`        | `required`         |             | `boolean` | `undefined` |
| `tooltip`         | `tooltip`          |             | `string`  | `""`        |
| `validate`        | `validate`         |             | `boolean` | `undefined` |
| `value`           | `value`            |             | `string`  | `""`        |


## Events

| Event            | Description | Type                                                        |
| ---------------- | ----------- | ----------------------------------------------------------- |
| `didLoad`        |             | `CustomEvent<void>`                                         |
| `insInput`       |             | `CustomEvent<any>`                                          |
| `insValidation`  |             | `CustomEvent<{ hasError: boolean; errorMessage: string; }>` |
| `insValueChange` |             | `CustomEvent<string>`                                       |


## Methods

### `getValue() => Promise<any>`



#### Returns

Type: `Promise<any>`



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
  ins-input-phone --> ins-input-tooltip
  style ins-input-phone fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
