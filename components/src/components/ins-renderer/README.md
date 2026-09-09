# ins-renderer

The content column. Receives the crumb trail from the rail via `updateRoute()`, stores it in
`localStorage.ins_breadcrumbs`, drives the app iframe for `app` routes, and renders the page title.

`insRouteChange` fires on every `updateRoute()` with `{ crumbs, route }`. The IIA v6 shell header
listens for it to draw the breadcrumb bar (TW#26371963); in that shell the crumbs this component
draws inside the column are hidden by CSS, and the legacy 240px/75px offsets are zeroed because the
rail is a flex sibling rather than a fixed strip.

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

| Event            | Description                                                                                                                                                                                                  | Type                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `didLoad`        |                                                                                                                                                                                                              | `CustomEvent<void>`                           |
| `insRouteChange` | Fires on every route change with the current crumb trail. Additive (TW#26371963): the v6 shell header renders the breadcrumb bar from this instead of the renderer drawing crumbs inside the content column. | `CustomEvent<{ crumbs: any[]; route: any; }>` |


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
