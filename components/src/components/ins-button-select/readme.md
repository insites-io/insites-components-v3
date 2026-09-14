# ins-button-select



<!-- Auto Generated Below -->


## Properties

| Property                | Attribute                | Description | Type      | Default            |
| ----------------------- | ------------------------ | ----------- | --------- | ------------------ |
| `blankLabel`            | `blank-label`            |             | `boolean` | `false`            |
| `checkLoad`             | `check-load`             |             | `boolean` | `false`            |
| `description`           | `description`            |             | `string`  | `""`               |
| `disabled`              | `disabled`               |             | `boolean` | `false`            |
| `dropUp`                | `drop-up`                |             | `boolean` | `false`            |
| `dynamicButtonLabel`    | `dynamic-button-label`   |             | `string`  | `"Add"`            |
| `dynamicErrorMessage`   | `dynamic-error-message`  |             | `string`  | `""`               |
| `dynamicHasError`       | `dynamic-has-error`      |             | `boolean` | `false`            |
| `dynamicOption`         | `dynamic-option`         |             | `boolean` | `false`            |
| `dynamicPlaceholder`    | `dynamic-placeholder`    |             | `string`  | `undefined`        |
| `dynamicValue`          | `dynamic-value`          |             | `string`  | `""`               |
| `errorMessage`          | `error-message`          |             | `string`  | `""`               |
| `hasError`              | `has-error`              |             | `boolean` | `false`            |
| `hasLoad`               | `has-load`               |             | `string`  | `undefined`        |
| `htmlDescription`       | `html-description`       |             | `boolean` | `false`            |
| `label`                 | `label`                  |             | `string`  | `undefined`        |
| `labelKey`              | `label-key`              |             | `string`  | `""`               |
| `load`                  | `load`                   |             | `boolean` | `false`            |
| `lookup`                | `lookup`                 |             | `boolean` | `false`            |
| `lookupLoading`         | `lookup-loading`         |             | `boolean` | `false`            |
| `lookupScrolling`       | `lookup-scrolling`       |             | `boolean` | `false`            |
| `multiple`              | `multiple`               |             | `boolean` | `false`            |
| `name`                  | `name`                   |             | `string`  | `undefined`        |
| `noLabel`               | `no-label`               |             | `boolean` | `false`            |
| `optionsData`           | --                       |             | `any[]`   | `[]`               |
| `placeholder`           | `placeholder`            |             | `string`  | `""`               |
| `readonly`              | `readonly`               |             | `boolean` | `false`            |
| `searchable`            | `searchable`             |             | `boolean` | `false`            |
| `searchablePlaceholder` | `searchable-placeholder` |             | `string`  | `"Search options"` |
| `selectedValues`        | `selected-values`        |             | `any`     | `[]`               |
| `small`                 | `small`                  |             | `boolean` | `false`            |
| `value`                 | `value`                  |             | `any`     | `undefined`        |
| `valueKey`              | `value-key`              |             | `string`  | `""`               |


## Events

| Event              | Description | Type                                                                                                          |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `didLoad`          |             | `CustomEvent<void>`                                                                                           |
| `insChange`        |             | `CustomEvent<any>`                                                                                            |
| `insDynamicSubmit` |             | `CustomEvent<string>`                                                                                         |
| `insLoadMore`      |             | `CustomEvent<void>`                                                                                           |
| `insOptionSelect`  |             | `CustomEvent<{ event_type: string; selected: any[]; selectedOptions: { label: string; value: string; }[]; }>` |
| `insSearch`        |             | `CustomEvent<string>`                                                                                         |


## Methods

### `closeOptions() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `disableNoResult() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `dynamicCloseOptions() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `dynamicUpdateOptions() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `enableNoResult() => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `getAllOptions() => Promise<NodeListOf<HTMLInsButtonSelectOptionElement>>`



#### Returns

Type: `Promise<NodeListOf<HTMLInsButtonSelectOptionElement>>`



### `getValue() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `resetValue() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setLoadingState(state: boolean) => Promise<boolean>`



#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| `state` | `boolean` |             |

#### Returns

Type: `Promise<boolean>`



### `setSearchingState(state: boolean) => Promise<boolean>`



#### Parameters

| Name    | Type      | Description |
| ------- | --------- | ----------- |
| `state` | `boolean` |             |

#### Returns

Type: `Promise<boolean>`



### `setValue(value?: any) => Promise<boolean>`



#### Parameters

| Name    | Type  | Description |
| ------- | ----- | ----------- |
| `value` | `any` |             |

#### Returns

Type: `Promise<boolean>`




## Dependencies

### Depends on

- [ins-button-select-option](../ins-button-select-option)

### Graph
```mermaid
graph TD;
  ins-button-select --> ins-button-select-option
  style ins-button-select fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
