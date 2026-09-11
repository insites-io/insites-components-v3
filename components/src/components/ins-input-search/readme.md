# ins-input-search



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default               |
| ----------------- | ------------------ | ----------- | --------- | --------------------- |
| `addPx`           | `add-px`           |             | `number`  | `35`                  |
| `blankSearch`     | `blank-search`     |             | `boolean` | `false`               |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`               |
| `checkValue`      | `check-value`      |             | `boolean` | `false`               |
| `description`     | `description`      |             | `string`  | `""`                  |
| `disabled`        | `disabled`         |             | `boolean` | `false`               |
| `dropUp`          | `drop-up`          |             | `boolean` | `false`               |
| `errorMessage`    | `error-message`    |             | `string`  | `""`                  |
| `hasError`        | `has-error`        |             | `boolean` | `false`               |
| `hasLoad`         | `has-load`         |             | `string`  | `undefined`           |
| `htmlDescription` | `html-description` |             | `boolean` | `false`               |
| `icon`            | `icon`             |             | `string`  | `"icon-search-1"`     |
| `label`           | `label`            |             | `string`  | `undefined`           |
| `load`            | `load`             |             | `boolean` | `false`               |
| `loading`         | `loading`          |             | `boolean` | `false`               |
| `loadingText`     | `loading-text`     |             | `string`  | `'Searching...'`      |
| `multiple`        | `multiple`         |             | `boolean` | `false`               |
| `name`            | `name`             |             | `string`  | `undefined`           |
| `noResults`       | `no-results`       |             | `boolean` | `false`               |
| `noResultsText`   | `no-results-text`  |             | `string`  | `'No results found.'` |
| `optionsData`     | `options-data`     |             | `any`     | `[]`                  |
| `placeholder`     | `placeholder`      |             | `string`  | `""`                  |
| `readonly`        | `readonly`         |             | `boolean` | `false`               |
| `searchValue`     | `search-value`     |             | `string`  | `""`                  |
| `tooltip`         | `tooltip`          |             | `string`  | `""`                  |
| `value`           | `value`            |             | `any`     | `undefined`           |


## Events

| Event             | Description | Type               |
| ----------------- | ----------- | ------------------ |
| `didLoad`         |             | `CustomEvent<any>` |
| `insInput`        |             | `CustomEvent<any>` |
| `insOptionSelect` |             | `CustomEvent<any>` |
| `insSearch`       |             | `CustomEvent<any>` |


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



### `resetValue() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setOptions(value: Array<{ label: string; value: string; }>) => Promise<void>`



#### Parameters

| Name    | Type                                  | Description |
| ------- | ------------------------------------- | ----------- |
| `value` | `{ label: string; value: string; }[]` |             |

#### Returns

Type: `Promise<void>`



### `setValue(value: any) => Promise<void>`



#### Parameters

| Name    | Type  | Description |
| ------- | ----- | ----------- |
| `value` | `any` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ins-input-search-option](../ins-input-search-option)
- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-input-search --> ins-input-search-option
  ins-input-search --> ins-input-tooltip
  style ins-input-search fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
