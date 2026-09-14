# ins-action-menu

Kebab trigger with a `role="menu"` panel of `ins-action-menu-item` children. Light DOM. Closes on Escape,
outside click and item selection; ArrowDown on the trigger opens it, Arrow/Home/End move between items,
ArrowRight/ArrowLeft enter and leave submenus.

## Default rendering

Unchanged from the first release: 32px borderless trigger, 180px panel, nested items open on click and
fly out to the right.

## Record-page variant (IIA v6, opt-in)

`variant="record"` renders the CRM Contact v1.4 / Company v1.0 kebab: 36px trigger with a `--ins-main`
border on a `--ins-card` surface, 240px card panel (`top: calc(100% + 6px)`, `--ins-shadow-2`,
`ins-fade-in-up`), rows at `--ins-text-sm` with `--ins-ui-1` hover, danger rows in `--ins-alert-negative`,
dividers, and channel flyouts to the LEFT (`right: 100%`, `top: -4px`, 200px to `min(420px, 90vw)`).
Flyouts open on click or ArrowRight. There is deliberately no hover-to-open option: the Company v1.0
handover tested hover and rejected it as an accessibility failure, and hover combined with click is worse
than either, because entering the row opens the flyout so the click that follows toggles it shut
(TW#26673778). `trigger-tip` sets `data-tip` on the trigger for the shared tooltip rule. The `--ins-*` tokens and the `ins-fade-in-up` keyframe come from
the shared `insites.css`; nothing is duplicated here.

```html
<ins-action-menu variant="record" aria-label-text="Contact actions" trigger-tip="Contact actions">
  <ins-action-menu-item label="Email contact" icon="icon-email-1">
    <ins-action-menu-item label="shane@insites.io" slot-label="Email 1" value="email::0"></ins-action-menu-item>
    <ins-action-menu-item label="shane@combinate.me" slot-label="Email 2" value="email::1"></ins-action-menu-item>
  </ins-action-menu-item>
  <ins-action-menu-item label="Call contact" icon="icon-phone-call">
    <ins-action-menu-item label="+61 2 0054 6411" slot-label="Work" value="call::0"></ins-action-menu-item>
  </ins-action-menu-item>
  <ins-action-menu-item label="Add activity" icon="icon-activity" value="Add Activity"></ins-action-menu-item>
  <ins-action-menu-item divider></ins-action-menu-item>
  <ins-action-menu-item label="Add opportunity" icon="icon-briefcase"></ins-action-menu-item>
  <ins-action-menu-item label="Add order" icon="icon-shopping-cart"></ins-action-menu-item>
  <ins-action-menu-item label="Add task" icon="icon-task-list"></ins-action-menu-item>
  <ins-action-menu-item divider></ins-action-menu-item>
  <ins-action-menu-item label="Add relationship" icon="icon-users"></ins-action-menu-item>
  <ins-action-menu-item divider></ins-action-menu-item>
  <ins-action-menu-item label="Configure metrics" icon="icon-sliders"></ins-action-menu-item>
  <ins-action-menu-item divider></ins-action-menu-item>
  <ins-action-menu-item label="Archive contact" icon="icon-archive"></ins-action-menu-item>
  <ins-action-menu-item label="Delete contact" icon="icon-trash" danger></ins-action-menu-item>
</ins-action-menu>
```

Listen for `insSelect` (`detail.value`) on the menu; it closes itself after a selection.

<!-- Auto Generated Below -->


## Properties

| Property        | Attribute         | Description | Type      | Default                |
| --------------- | ----------------- | ----------- | --------- | ---------------------- |
| `ariaLabelText` | `aria-label-text` |             | `string`  | `'Actions'`            |
| `checkLoad`     | `check-load`      |             | `boolean` | `false`                |
| `hasLoad`       | `has-load`        |             | `string`  | `undefined`            |
| `load`          | `load`            |             | `boolean` | `false`                |
| `position`      | `position`        |             | `string`  | `'bottom-end'`         |
| `triggerIcon`   | `trigger-icon`    |             | `string`  | `'icon-more-vertical'` |
| `triggerLabel`  | `trigger-label`   |             | `string`  | `''`                   |
| `triggerTip`    | `trigger-tip`     |             | `string`  | `''`                   |
| `variant`       | `variant`         |             | `string`  | `''`                   |


## Events

| Event           | Description | Type                              |
| --------------- | ----------- | --------------------------------- |
| `didLoad`       |             | `CustomEvent<void>`               |
| `insOpenChange` |             | `CustomEvent<{ open: boolean; }>` |


## Methods

### `closeMenu() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
