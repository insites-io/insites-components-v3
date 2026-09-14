# ins-carousel



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description | Type      | Default     |
| ------------------ | -------------------- | ----------- | --------- | ----------- |
| `autoplay`         | `autoplay`           |             | `boolean` | `false`     |
| `autostop`         | `autostop`           |             | `boolean` | `false`     |
| `bindTo`           | `bind-to`            |             | `string`  | `""`        |
| `bodyText`         | `body-text`          |             | `string`  | `""`        |
| `checkLoad`        | `check-load`         |             | `boolean` | `false`     |
| `ctaColor`         | `cta-color`          |             | `string`  | `"blue"`    |
| `ctaDisabled`      | `cta-disabled`       |             | `boolean` | `false`     |
| `ctaLabel`         | `cta-label`          |             | `string`  | `""`        |
| `ctaLink`          | `cta-link`           |             | `string`  | `""`        |
| `ctaLinkTarget`    | `cta-link-target`    |             | `string`  | `"_blank"`  |
| `dragDisabled`     | `drag-disabled`      |             | `boolean` | `false`     |
| `duration`         | `duration`           |             | `number`  | `3000`      |
| `hasLoad`          | `has-load`           |             | `string`  | `undefined` |
| `heading`          | `heading`            |             | `string`  | `""`        |
| `height`           | `height`             |             | `string`  | `"auto"`    |
| `layout`           | `layout`             |             | `number`  | `1`         |
| `load`             | `load`               |             | `boolean` | `false`     |
| `loop`             | `loop`               |             | `boolean` | `false`     |
| `noCarouselButton` | `no-carousel-button` |             | `boolean` | `false`     |
| `noPagination`     | `no-pagination`      |             | `boolean` | `false`     |
| `perPage`          | `per-page`           |             | `number`  | `1`         |
| `startIndex`       | `start-index`        |             | `number`  | `0`         |
| `subHeading`       | `sub-heading`        |             | `string`  | `""`        |
| `transition`       | `transition`         |             | `number`  | `350`       |
| `width`            | `width`              |             | `string`  | `"100%"`    |


## Events

| Event      | Description | Type               |
| ---------- | ----------- | ------------------ |
| `didLoad`  |             | `CustomEvent<any>` |
| `insSlide` |             | `CustomEvent<any>` |


## Methods

### `goTo(slide: string | number) => Promise<void>`



#### Parameters

| Name    | Type               | Description |
| ------- | ------------------ | ----------- |
| `slide` | `string \| number` |             |

#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- [ins-button](../ins-button)

### Graph
```mermaid
graph TD;
  ins-carousel --> ins-button
  style ins-carousel fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
