# ins-button



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute        | Description | Type      | Default     |
| --------------- | ---------------- | ----------- | --------- | ----------- |
| `checkLoad`     | `check-load`     |             | `boolean` | `false`     |
| `color`         | `color`          |             | `string`  | `'blue'`    |
| `cursor`        | `cursor`         |             | `string`  | `''`        |
| `data`          | `data`           |             | `string`  | `''`        |
| `disabled`      | `disabled`       |             | `boolean` | `false`     |
| `dropdown`      | `dropdown`       |             | `boolean` | `false`     |
| `hasLoad`       | `has-load`       |             | `string`  | `undefined` |
| `icon`          | `icon`           |             | `string`  | `''`        |
| `iconRight`     | `icon-right`     |             | `string`  | `''`        |
| `label`         | `label`          |             | `string`  | `'BUTTON'`  |
| `load`          | `load`           |             | `boolean` | `false`     |
| `loading`       | `loading`        |             | `boolean` | `false`     |
| `options`       | `options`        |             | `string`  | `''`        |
| `optionsOnly`   | `options-only`   |             | `boolean` | `false`     |
| `outlined`      | `outlined`       |             | `boolean` | `false`     |
| `size`          | `size`           |             | `string`  | `'normal'`  |
| `solid`         | `solid`          |             | `boolean` | `false`     |
| `textTransform` | `text-transform` |             | `string`  | `''`        |
| `type`          | `type`           |             | `string`  | `''`        |


## Events

| Event            | Description | Type                                              |
| ---------------- | ----------- | ------------------------------------------------- |
| `didLoad`        |             | `CustomEvent<void>`                               |
| `insClick`       |             | `CustomEvent<{ label: string; data: string; }>`   |
| `insClickOption` |             | `CustomEvent<{ label: string; option: string; }>` |


## Dependencies

### Used by

 - [ins-carousel](../ins-carousel)
 - [ins-credit-card](../ins-credit-card)
 - [ins-filter](../ins-filter)
 - [ins-heading](../ins-heading)
 - [ins-image-picker](../ins-image-picker)
 - [ins-input-table](../ins-input-table)
 - [ins-modal](../ins-modal)
 - [ins-table](../ins-table)
 - [ins-thumbnail](../ins-thumbnail)

### Graph
```mermaid
graph TD;
  ins-carousel --> ins-button
  ins-credit-card --> ins-button
  ins-filter --> ins-button
  ins-heading --> ins-button
  ins-image-picker --> ins-button
  ins-input-table --> ins-button
  ins-modal --> ins-button
  ins-table --> ins-button
  ins-thumbnail --> ins-button
  style ins-button fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
