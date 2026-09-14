# ins-kanban-column



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute               | Description | Type      | Default      |
| -------------------- | ----------------------- | ----------- | --------- | ------------ |
| `addItemButton`      | `add-item-button`       |             | `boolean` | `false`      |
| `addItemButtonLabel` | `add-item-button-label` |             | `string`  | `'Add Item'` |
| `disableDrop`        | `disable-drop`          |             | `boolean` | `false`      |
| `disableSort`        | `disable-sort`          |             | `boolean` | `false`      |
| `heading`            | `heading`               |             | `string`  | `"Heading"`  |
| `headingColor`       | `heading-color`         |             | `string`  | `'#fff'`     |
| `headingSubDetail`   | `heading-sub-detail`    |             | `string`  | `''`         |
| `headingTextColor`   | `heading-text-color`    |             | `string`  | `''`         |
| `noItems`            | `no-items`              |             | `boolean` | `false`      |
| `noItemsDetail`      | `no-items-detail`       |             | `string`  | `''`         |
| `noItemsHeading`     | `no-items-heading`      |             | `string`  | `'No Items'` |
| `sortableItems`      | --                      |             | `[]`      | `undefined`  |
| `totalCount`         | `total-count`           |             | `string`  | `''`         |


## Events

| Event                | Description | Type                  |
| -------------------- | ----------- | --------------------- |
| `insAdd`             |             | `CustomEvent<Object>` |
| `insChoose`          |             | `CustomEvent<Object>` |
| `insColumnAdd`       |             | `CustomEvent<any>`    |
| `insDragEnd`         |             | `CustomEvent<Object>` |
| `insDragStart`       |             | `CustomEvent<Object>` |
| `insDrop`            |             | `CustomEvent<Object>` |
| `insMove`            |             | `CustomEvent<Object>` |
| `insPositionChanged` |             | `CustomEvent<Object>` |
| `insRemove`          |             | `CustomEvent<Object>` |
| `insSort`            |             | `CustomEvent<Object>` |
| `insUpdate`          |             | `CustomEvent<Object>` |


## Methods

### `getColumnCardsOrder() => Promise<Record<number, string>>`



#### Returns

Type: `Promise<Record<number, string>>`



### `reorderCards(sortable: string | any[]) => Promise<void>`



#### Parameters

| Name       | Type              | Description |
| ---------- | ----------------- | ----------- |
| `sortable` | `string \| any[]` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
