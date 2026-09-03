# ins-disclosure-panel



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default     |
| ----------- | ------------ | ----------- | --------- | ----------- |
| `checkLoad` | `check-load` |             | `boolean` | `false`     |
| `count`     | `count`      |             | `number`  | `undefined` |
| `disabled`  | `disabled`   |             | `boolean` | `false`     |
| `hasLoad`   | `has-load`   |             | `string`  | `undefined` |
| `heading`   | `heading`    |             | `string`  | `undefined` |
| `icon`      | `icon`       |             | `string`  | `undefined` |
| `load`      | `load`       |             | `boolean` | `false`     |
| `open`      | `open`       |             | `boolean` | `false`     |


## Events

| Event       | Description | Type                                               |
| ----------- | ----------- | -------------------------------------------------- |
| `didLoad`   |             | `CustomEvent<void>`                                |
| `insToggle` |             | `CustomEvent<{ open: boolean; heading: string; }>` |


## Methods

### `closePanel() => Promise<void>`

Programmatic close — does NOT emit insToggle.

#### Returns

Type: `Promise<void>`



### `openPanel() => Promise<void>`

Programmatic open — does NOT emit insToggle.

#### Returns

Type: `Promise<void>`



### `toggle() => Promise<void>`

Programmatic toggle — does NOT emit insToggle.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
