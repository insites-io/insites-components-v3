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

| Event                  | Description                                                                                                                                                                                                                                                                                                            | Type                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `didLoad`              |                                                                                                                                                                                                                                                                                                                        | `CustomEvent<void>`                                  |
| `insBreadcrumbsChange` | Fires whenever a page hands this component a new trail (`updateCrumbs`). Bubbles to the document so the v6 shell header (`ins-header variant="v6"`) can draw the same trail in its breadcrumb bar: the page knows its real route (Home › CRM › Contacts › …), the rail only knows which item was clicked. TW#26371963. | `CustomEvent<{ crumbs: any[]; }>`                    |
| `routePage`            |                                                                                                                                                                                                                                                                                                                        | `CustomEvent<{ crumbs: any[]; redirect: boolean; }>` |


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
