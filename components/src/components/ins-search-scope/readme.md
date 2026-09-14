# ins-search-scope

The IIA v6 record-page search pill with a "Search by:" field-scope dropdown. Ported from the Contacts tab header of the CRM Company record (`module-v6-crm` `Companies/sections/Contacts/Contacts.vue`, design CRM Company v1.0, handoff-company.md section 4) so every module SPA renders the same pill from one bundle release.

Light DOM. The root is `label.crm-search`, so the shared record-page CSS in `insites.css` (`.crm-search` hover / focus ring, `.crm-sbprefix` sr-only prefix at phone widths, `button[data-tip]` tooltips, the `ins-fade-in-up` keyframe) lands on it unchanged. The design's inline styles are carried in `ins-search-scope.scss`; the host element carries the pill's flex sizing (`flex:1 1 320px; min-width:260px; max-width:520px`) because the host, not the label, is the flex item inside `.crm-tabhd` / `.crm-toolbar`.

## Markup

```
label.ins-search-scope.crm-search
  span.ins-search-scope__scope            (only when scopeOptions has entries)
    button.ins-search-scope__trigger      aria-haspopup="menu" aria-expanded
      span.crm-sbprefix                   "Search by:"  (sr-only below 560px via the shared layer)
      strong.ins-search-scope__field      current field label
      i.icon-caret-down
    div.ins-search-scope__menu            role="menu", hidden until open
      button.ins-search-scope__option     role="menuitemradio" aria-checked
  input.ins-search-scope__input[type=search]
  button.ins-search-scope__clear          hidden until the input has a value
  button.ins-search-scope__submit         icon-search-1, or icon-refresh-cw spinning while `loading`
```

## Behaviour

- The search only applies on submit: Enter in the input, or the search button. This is the v5 behaviour the design keeps ("a search only applies on submit"). `insSearch` carries the trimmed value and the current scope.
- `insInput` fires on every keystroke with the raw value, for consumers that mirror the draft.
- Set `debounce` above 0 (milliseconds) to also fire `insSearch` while typing. Default `0` is off.
- Clear empties the input, fires `insClear`, and re-fires `insSearch` with an empty value only when a non-empty search is active (mirrors `clearSearch` in Contacts.vue).
- Picking a scope closes the menu and fires `insScopeChange`; if a search is active it re-runs against the new field (mirrors `selectSearchBy`). Picking the current scope does nothing.
- The menu closes on outside click and Escape (focus returns to the trigger). ArrowDown on the trigger opens it; ArrowUp / ArrowDown / Home / End move between options.
- `loading` swaps the submit icon for `icon-refresh-cw` with a 1s spin and sets `aria-busy`. `disabled` disables every control and dims the pill.
- The submit icon turns brand (`--ins-main`) once the input has a value, grey (`--ins-ui-2`) otherwise.
- The label carries `for` pointing at the input, so a click on empty pill space focuses the text box rather than the trigger button (a label's default control is its first labelable descendant, which would be the trigger). The input's accessible name is the placeholder.
- An initial `value` counts as an applied search, so clearing it fires `insSearch` with an empty value.

## Usage

```html
<ins-search-scope
  placeholder="Search contacts"
  scope="Name"
  scope-options='["Name","Job Title","Contact Category","Contact Type","Email","Phone"]'
></ins-search-scope>
```

`scope-options` accepts plain strings (label and value identical, as Contacts.vue lists its fields) or `{ label, value }` objects, as a JSON string attribute or a bound array. With no `scope` set, the first option is selected. With no options at all, the trigger is omitted and the pill is a plain search input.

Vue 3:

```vue
<ins-search-scope
  :scope-options="searchByOptions"
  :scope="searchField"
  :value="searchDraft"
  :loading="loading"
  placeholder="Search contacts"
  @insInput="searchDraft = $event.detail.value"
  @insScopeChange="searchField = $event.detail.scope"
  @insSearch="searchHandler({ field: $event.detail.scope, keyword: $event.detail.value })"
/>
```

Placeholder convention from the design: "Search contacts" on the Contacts tab, "Search by activity name" / "Search by task name" style elsewhere.

## Tokens

Colours, spacing and radius read the v6 design tokens the admin page supplies (`--ins-card`, `--ins-main`, `--ins-ui-1`, `--ins-ui-2`, `--ins-text-1`, `--ins-text-3`, `--ins-radius`, `--ins-shadow-2`, `--iia-glyph-sm`, ...). Each falls back to the bundle's legacy `--ins-*` token so the pill still renders on a page without them.

<!-- Auto Generated Below -->


## Overview

The IIA v6 record-page search pill with a field-scope dropdown.
Ported from module-v6-crm Companies/sections/Contacts/Contacts.vue (design: CRM Company v1.0, Contacts tab header).

Markup mirrors the design so the shared record-page CSS (.crm-search, .crm-sbprefix, button[data-tip]) lands on it:
  label.crm-search > span (trigger + role=menu) + input[type=search] + clear button + submit button
The search only applies on submit (Enter or the search button), matching v5 and the design prototype.
Set `debounce` above 0 to opt in to a live insSearch while typing.

## Properties

| Property       | Attribute       | Description | Type                                  | Default          |
| -------------- | --------------- | ----------- | ------------------------------------- | ---------------- |
| `checkLoad`    | `check-load`    |             | `boolean`                             | `false`          |
| `clearLabel`   | `clear-label`   |             | `string`                              | `"Clear search"` |
| `debounce`     | `debounce`      |             | `number`                              | `0`              |
| `disabled`     | `disabled`      |             | `boolean`                             | `false`          |
| `hasLoad`      | `has-load`      |             | `string`                              | `undefined`      |
| `load`         | `load`          |             | `boolean`                             | `false`          |
| `loading`      | `loading`       |             | `boolean`                             | `false`          |
| `menuLabel`    | `menu-label`    |             | `string`                              | `"Search field"` |
| `placeholder`  | `placeholder`   |             | `string`                              | `"Search"`       |
| `scope`        | `scope`         |             | `string`                              | `undefined`      |
| `scopeOptions` | `scope-options` |             | `(string \| ScopeOption)[] \| string` | `[]`             |
| `scopePrefix`  | `scope-prefix`  |             | `string`                              | `"Search by:"`   |
| `searchLabel`  | `search-label`  |             | `string`                              | `"Search"`       |
| `value`        | `value`         |             | `string`                              | `""`             |


## Events

| Event            | Description | Type                                             |
| ---------------- | ----------- | ------------------------------------------------ |
| `didLoad`        |             | `CustomEvent<void>`                              |
| `insClear`       |             | `CustomEvent<{ scope: string; }>`                |
| `insInput`       |             | `CustomEvent<{ value: string; scope: string; }>` |
| `insOpenChange`  |             | `CustomEvent<{ open: boolean; }>`                |
| `insScopeChange` |             | `CustomEvent<{ scope: string; label: string; }>` |
| `insSearch`      |             | `CustomEvent<{ value: string; scope: string; }>` |


## Methods

### `clear() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `closeMenu() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `focusInput() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
