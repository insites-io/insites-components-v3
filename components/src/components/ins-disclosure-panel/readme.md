# ins-disclosure-panel

A collapsible section with a header button and a slotted body.

## Default rendering (v2)

Unchanged: angle-down chevron, 16px header, `.ins-disclosure-panel_count` badge, stacked panels divided by a `border-top`.

```html
<ins-disclosure-panel heading="Addresses" count="2">
  <p>Head office · Billing</p>
</ins-disclosure-panel>
```

## IIA v6 reference section card (`v6`)

Opt in with the `v6` prop to render the CRM Contact v1.4 / Company v1.0 reference section card: a bordered card whose header button carries the icon (`--ins-text-md`, `--ins-text-3`), a semibold label (`--ins-text-sm`), a `.chip` count and an `icon-chevron-right` that rotates 90deg when open; hover paints `--ins-ui-1`. The body is a `.crm-refwrap` with the prototype's custom properties (`--crm-tblpad`, `--crm-grid-pad`, `--crm-grid-gap`), a `border-top`, `padding: 0 var(--ins-space-sm)` and the `ins-fade-in-up` entrance. Card, chip, refwrap and keyframe rules come from the "IIA v6 record-page layer" in `insites.css`; the v6 `--ins-*` tokens must be on the page (the CRM module ships them in `design-tokens.css`).

```html
<div style="display:flex;flex-direction:column;gap:var(--ins-space-sm)">
  <ins-disclosure-panel v6 id="custom-fields" heading="Custom fields" icon="icon-sliders" count="8" eager>
    ...
  </ins-disclosure-panel>
  <ins-disclosure-panel v6 id="profiles" heading="Profiles" icon="icon-user" count="5 profiles">
    ...
  </ins-disclosure-panel>
</div>
```

Stack v6 panels in a flex column with `gap: var(--ins-space-sm)`; the v2 divider between siblings is suppressed for v6 panels.

### Lazy mount

The panel tracks a `mounted` state that becomes true on the first open (header click, `openPanel()`, `toggle()`, or the `open` prop turning true) and never reverts on close. `eager` marks it mounted from the start, for panels whose content is read while closed (Custom fields, whose delete flow reads its child before the section is opened). The state is exposed three ways: the `insMount` event (fired once), the `isMounted()` method, and `data-mounted` on the body element (plus a `mounted` class on the wrapper).

A light DOM component cannot stop the consumer's children from being created, so the consumer gates its own content. In Vue:

```vue
<ins-disclosure-panel v6 heading="Relationships" icon="icon-users" :count="counts.rel" :open="initialOpen.rel"
  @insMount="mounted.rel = true">
  <Relationships v-if="mounted.rel" ... />
</ins-disclosure-panel>
```

### Programmatic control

`openPanel()`, `closePanel()` and `toggle()` change the state without emitting `insToggle` (unchanged). `isOpen()` returns the current state; reading the `open` property is the synchronous equivalent. Record pages use `openPanel()` then `el.scrollIntoView()` for kebab actions and deep links.

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                 | Type               | Default     |
| ----------- | ------------ | ------------------------------------------------------------------------------------------- | ------------------ | ----------- |
| `checkLoad` | `check-load` |                                                                                             | `boolean`          | `false`     |
| `count`     | `count`      | Number, or a string such as "5 profiles". Hidden when null, undefined or an empty string.   | `number \| string` | `undefined` |
| `disabled`  | `disabled`   |                                                                                             | `boolean`          | `false`     |
| `eager`     | `eager`      | Treat the body as mounted from the start, for panels whose content is read while closed.    | `boolean`          | `false`     |
| `hasLoad`   | `has-load`   |                                                                                             | `string`           | `undefined` |
| `heading`   | `heading`    |                                                                                             | `string`           | `undefined` |
| `icon`      | `icon`       |                                                                                             | `string`           | `undefined` |
| `load`      | `load`       |                                                                                             | `boolean`          | `false`     |
| `open`      | `open`       |                                                                                             | `boolean`          | `false`     |
| `v6`        | `v6`         | Opt in to the IIA v6 reference section card. Off by default so existing panels do not move. | `boolean`          | `false`     |


## Events

| Event       | Description                                                                                                | Type                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `didLoad`   |                                                                                                            | `CustomEvent<void>`                                |
| `insMount`  | Fired once, the first time the body is considered mounted (first open, or on load when `open` or `eager`). | `CustomEvent<{ heading: string; }>`                |
| `insToggle` |                                                                                                            | `CustomEvent<{ open: boolean; heading: string; }>` |


## Methods

### `closePanel() => Promise<void>`

Programmatic close. Does NOT emit insToggle. The body stays mounted.

#### Returns

Type: `Promise<void>`



### `isMounted() => Promise<boolean>`

Whether the body has been opened at least once (or was eager).

#### Returns

Type: `Promise<boolean>`



### `isOpen() => Promise<boolean>`

Current open state. The `open` prop is the synchronous equivalent.

#### Returns

Type: `Promise<boolean>`



### `openPanel() => Promise<void>`

Programmatic open. Does NOT emit insToggle. Mounts the body if it was not yet mounted.

#### Returns

Type: `Promise<void>`



### `toggle() => Promise<void>`

Programmatic toggle. Does NOT emit insToggle.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
