# ins-input-search-option



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute   | Description | Type      | Default    |
| ----------- | ----------- | ----------- | --------- | ---------- |
| `activated` | `activated` |             | `boolean` | `false`    |
| `label`     | `label`     |             | `string`  | `'Option'` |
| `value`     | `value`     |             | `string`  | `''`       |


## Events

| Event                         | Description | Type                                             |
| ----------------------------- | ----------- | ------------------------------------------------ |
| `insInputSearchOptionClicked` |             | `CustomEvent<{ value: string; label: string; }>` |


## Dependencies

### Used by

 - [ins-input-search](../ins-input-search)

### Graph
```mermaid
graph TD;
  ins-input-search --> ins-input-search-option
  style ins-input-search-option fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
