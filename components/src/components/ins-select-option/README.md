# ins-select-option



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description | Type      | Default    |
| ----------- | ----------- | ----------- | --------- | ---------- |
| `activated` | `activated` |             | `boolean` | `false`    |
| `default`   | `default`   |             | `boolean` | `false`    |
| `disabled`  | `disabled`  |             | `boolean` | `false`    |
| `hidden`    | `hidden`    |             | `boolean` | `false`    |
| `label`     | `label`     |             | `string`  | `'Option'` |
| `value`     | `value`     |             | `string`  | `''`       |


## Events

| Event                    | Description | Type                                             |
| ------------------------ | ----------- | ------------------------------------------------ |
| `insSelectOptionClicked` |             | `CustomEvent<{ value: string; label: string; }>` |


## Methods

### `activate() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `deactivate() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `hideOption() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `showOption() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Used by

 - [ins-select](../ins-select)
 - [ins-table](../ins-table)

### Graph
```mermaid
graph TD;
  ins-select --> ins-select-option
  ins-table --> ins-select-option
  style ins-select-option fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
