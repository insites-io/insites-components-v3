# ins-renderer



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute             | Description | Type      | Default     |
| -------------------- | --------------------- | ----------- | --------- | ----------- |
| `app`                | `app`                 |             | `boolean` | `false`     |
| `checkLoad`          | `check-load`          |             | `boolean` | `false`     |
| `disableBreadcrumbs` | `disable-breadcrumbs` |             | `boolean` | `false`     |
| `hasLoad`            | `has-load`            |             | `string`  | `undefined` |
| `label`              | `label`               |             | `string`  | `undefined` |
| `link`               | `link`                |             | `string`  | `undefined` |
| `load`               | `load`                |             | `boolean` | `false`     |


## Events

| Event     | Description | Type                |
| --------- | ----------- | ------------------- |
| `didLoad` |             | `CustomEvent<void>` |


## Methods

### `resizeIframe() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `updateRoute(newRoutes: any[], noRedirect: boolean, iframe: boolean) => Promise<void>`



#### Parameters

| Name         | Type      | Description |
| ------------ | --------- | ----------- |
| `newRoutes`  | `any[]`   |             |
| `noRedirect` | `boolean` |             |
| `iframe`     | `boolean` |             |

#### Returns

Type: `Promise<void>`



### `updateRouteLabel(value: string) => Promise<void>`



#### Parameters

| Name    | Type     | Description |
| ------- | -------- | ----------- |
| `value` | `string` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
