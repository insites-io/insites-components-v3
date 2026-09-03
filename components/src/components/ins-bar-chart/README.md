# ins-bar-chart



<!-- Auto Generated Below -->


## Properties

| Property     | Attribute    | Description | Type      | Default     |
| ------------ | ------------ | ----------- | --------- | ----------- |
| `categories` | --           |             | `any[]`   | `[]`        |
| `chartData`  | --           |             | `any[]`   | `[]`        |
| `checkLoad`  | `check-load` |             | `boolean` | `false`     |
| `hasLoad`    | `has-load`   |             | `string`  | `undefined` |
| `horizontal` | `horizontal` |             | `boolean` | `false`     |
| `load`       | `load`       |             | `boolean` | `false`     |
| `name`       | `name`       |             | `string`  | `""`        |
| `stacked`    | `stacked`    |             | `boolean` | `false`     |


## Events

| Event     | Description | Type                |
| --------- | ----------- | ------------------- |
| `didLoad` |             | `CustomEvent<void>` |


## Dependencies

### Depends on

- [ins-chart](../ins-chart)

### Graph
```mermaid
graph TD;
  ins-bar-chart --> ins-chart
  style ins-bar-chart fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
