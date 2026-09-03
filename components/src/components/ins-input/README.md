# ins-input



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute          | Description | Type      | Default     |
| ----------------- | ------------------ | ----------- | --------- | ----------- |
| `activated`       | `activated`        |             | `boolean` | `false`     |
| `checkLoad`       | `check-load`       |             | `boolean` | `false`     |
| `checkValue`      | `check-value`      |             | `boolean` | `false`     |
| `description`     | `description`      |             | `string`  | `""`        |
| `disabled`        | `disabled`         |             | `boolean` | `false`     |
| `errorMessage`    | `error-message`    |             | `string`  | `""`        |
| `field`           | `field`            |             | `string`  | `'text'`    |
| `fieldId`         | `field-id`         |             | `string`  | `""`        |
| `hasError`        | `has-error`        |             | `boolean` | `false`     |
| `hasLoad`         | `has-load`         |             | `string`  | `undefined` |
| `htmlDescription` | `html-description` |             | `boolean` | `false`     |
| `icon`            | `icon`             |             | `string`  | `""`        |
| `iconEvent`       | `icon-event`       |             | `boolean` | `false`     |
| `iconTitle`       | `icon-title`       |             | `string`  | `""`        |
| `label`           | `label`            |             | `string`  | `""`        |
| `load`            | `load`             |             | `boolean` | `false`     |
| `max`             | `max`              |             | `string`  | `""`        |
| `maxlength`       | `maxlength`        |             | `string`  | `""`        |
| `min`             | `min`              |             | `string`  | `""`        |
| `name`            | `name`             |             | `string`  | `""`        |
| `placeholder`     | `placeholder`      |             | `string`  | `""`        |
| `readonly`        | `readonly`         |             | `boolean` | `false`     |
| `required`        | `required`         |             | `boolean` | `false`     |
| `step`            | `step`             |             | `string`  | `""`        |
| `tooltip`         | `tooltip`          |             | `string`  | `""`        |
| `unitLeft`        | `unit-left`        |             | `string`  | `""`        |
| `unitRight`       | `unit-right`       |             | `string`  | `""`        |
| `value`           | `value`            |             | `string`  | `""`        |


## Events

| Event            | Description | Type                                                   |
| ---------------- | ----------- | ------------------------------------------------------ |
| `didLoad`        |             | `CustomEvent<any>`                                     |
| `insBlur`        |             | `CustomEvent<{ value: string; keyCode: number; }>`     |
| `insColorChange` |             | `CustomEvent<{ value: string; valid: boolean; }>`      |
| `insIconClick`   |             | `CustomEvent<{ target: HTMLElement; value: string; }>` |
| `insInput`       |             | `CustomEvent<{ value: string; keyCode?: number; }>`    |
| `insValueChange` |             | `CustomEvent<string>`                                  |


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

### Used by

 - [ins-heading](../ins-heading)
 - [ins-instances](../ins-instances)
 - [ins-table](../ins-table)

### Depends on

- [ins-input-tooltip](../ins-input-tooltip)

### Graph
```mermaid
graph TD;
  ins-input --> ins-input-tooltip
  ins-heading --> ins-input
  ins-instances --> ins-input
  ins-table --> ins-input
  style ins-input fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
