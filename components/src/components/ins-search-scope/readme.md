# ins-search-scope



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description | Type                      | Default     |
| -------------- | --------------- | ----------- | ------------------------- | ----------- |
| `checkLoad`    | `check-load`    |             | `boolean`                 | `false`     |
| `debounce`     | `debounce`      |             | `number`                  | `300`       |
| `hasLoad`      | `has-load`      |             | `string`                  | `undefined` |
| `load`         | `load`          |             | `boolean`                 | `false`     |
| `placeholder`  | `placeholder`   |             | `string`                  | `"Search"`  |
| `scope`        | `scope`         |             | `string`                  | `undefined` |
| `scopeOptions` | `scope-options` |             | `ScopeOption[] \| string` | `[]`        |
| `value`        | `value`         |             | `string`                  | `""`        |


## Events

| Event            | Description | Type                                             |
| ---------------- | ----------- | ------------------------------------------------ |
| `didLoad`        |             | `CustomEvent<void>`                              |
| `insScopeChange` |             | `CustomEvent<{ scope: string; }>`                |
| `insSearch`      |             | `CustomEvent<{ value: string; scope: string; }>` |


## Methods

### `clear() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
