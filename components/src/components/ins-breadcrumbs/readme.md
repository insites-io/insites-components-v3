# ins-breadcrumbs



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute    | Description | Type      | Default     |
| ------------- | ------------ | ----------- | --------- | ----------- |
| `breadcrumbs` | --           |             | `any[]`   | `[]`        |
| `checkLoad`   | `check-load` |             | `boolean` | `false`     |
| `hasLoad`     | `has-load`   |             | `string`  | `undefined` |
| `load`        | `load`       |             | `boolean` | `false`     |


## Events

| Event       | Description | Type                                                 |
| ----------- | ----------- | ---------------------------------------------------- |
| `didLoad`   |             | `CustomEvent<void>`                                  |
| `routePage` |             | `CustomEvent<{ crumbs: any[]; redirect: boolean; }>` |


## Methods

### `updateCrumbs(crumbs: any[], noRedirect?: boolean) => Promise<void>`



#### Parameters

| Name         | Type      | Description |
| ------------ | --------- | ----------- |
| `crumbs`     | `any[]`   |             |
| `noRedirect` | `boolean` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
