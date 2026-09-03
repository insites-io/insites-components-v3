# ins-filter-item



<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description | Type      | Default                                      |
| ----------- | ------------ | ----------- | --------- | -------------------------------------------- |
| `checkLoad` | `check-load` |             | `boolean` | `false`                                      |
| `hasLoad`   | `has-load`   |             | `string`  | `undefined`                                  |
| `load`      | `load`       |             | `boolean` | `false`                                      |
| `name`      | `name`       |             | `string`  | `'Category Label'`                           |
| `options`   | `options`    |             | `any`     | `["Category 1", "Category 2", "Category 3"]` |
| `selected`  | `selected`   |             | `any`     | `undefined`                                  |


## Events

| Event       | Description | Type                                             |
| ----------- | ----------- | ------------------------------------------------ |
| `didLoad`   |             | `CustomEvent<any>`                               |
| `insSelect` |             | `CustomEvent<{ name: string; option: string; }>` |


## Methods

### `closeFilter() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getSelected() => Promise<{ name: string; option: string; }>`



#### Returns

Type: `Promise<{ name: string; option: string; }>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
