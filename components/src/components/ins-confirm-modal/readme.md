# ins-confirm-modal

Type-to-confirm destructive dialog from the IIA v6 CRM record pages (CRM Contact v1.4 section 5,
CRM Company v1.0 delete confirmation; spec in handoff-confirm-delete.md).

480px centered card with a 72px warning triangle, the heading, lead copy from the default slot,
an optional kept-records note, the `Please enter "DELETE" to proceed.` prompt, a 48px input with
the brand focus ring, then CANCEL (outline brand) and the destructive action (negative), both 44px
uppercase with icons.

The confirm button is never `disabled`. It carries `aria-disabled`, dims to 0.45 with a
`not-allowed` cursor, and the handler returns early until the field reads the confirm word, so it
stays focusable. The typed word is compared trimmed and case-insensitively. Enter in the field
confirms, Escape and a backdrop click cancel. Focus moves to the input on open and returns to the
opener on close.

Light DOM. Relies on the shared `insites.css` for the `ins-zoom-in` keyframes and on
`insites-font-icons.css` for `icon-alert-triangle`, `icon-check-circle-1`, `icon-trash` and
`icon-x`. Every design token is used with its raw `--iia-*` or px fallback, so the dialog renders
the same in a module that does not load the semantic `--ins-*` aliases.

## Usage

```html
<ins-confirm-modal
  id="confirm"
  heading="Delete Stellar Solutions?"
  dialog-label="Delete company"
  confirm-button-label="Delete company"
  kept-note="Contacts, opportunities, orders, tickets, documents and event sponsorships are kept. Assigned contacts will be unassigned."
>
  <p>This permanently removes <strong>the company record</strong> and <strong>its alert messages</strong>.</p>
</ins-confirm-modal>

<script>
  const modal = document.getElementById('confirm');
  modal.addEventListener('insConfirm', () => { /* run the delete */ });
  modal.show();
</script>
```

Contact variant: two plain `<p>` lines in the slot ("Are you sure you want to delete {name}?",
"This action is permanent and cannot be undone."), no `kept-note`.

<!-- Auto Generated Below -->


## Overview

Type-to-confirm destructive dialog (IIA v6 CRM record pages).

Design: div[role="dialog"] > div[data-screen-label="Delete confirmation"] in
CRM Company v1.0 and CRM Contact v1.4 (handoff-confirm-delete.md, handoff.md section 5).
Reference implementation: module-v6-crm ConfirmDeleteModal.vue.

The confirm button is never `disabled`. It dims to 0.45 with aria-disabled and the
handler returns early until the field reads the confirm word, so it stays focusable
and screen readers can reach the requirement text. The typed word is compared trimmed
and case-insensitively, so "delete" passes for "DELETE".

Lead copy (the bold spans, the "are you sure" lines) comes in through the default slot.
The kept-records note can come through the slot too, or through the `keptNote` prop.

## Properties

| Property             | Attribute              | Description                                                                                         | Type      | Default        |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- | --------- | -------------- |
| `cancelButtonIcon`   | `cancel-button-icon`   | Icon-font class on the cancel button. Empty string hides the icon.                                  | `string`  | `"icon-x"`     |
| `cancelButtonLabel`  | `cancel-button-label`  |                                                                                                     | `string`  | `"Cancel"`     |
| `checkLoad`          | `check-load`           |                                                                                                     | `boolean` | `false`        |
| `confirmButtonIcon`  | `confirm-button-icon`  | Icon-font class on the confirm button. Empty string hides the icon.                                 | `string`  | `"icon-trash"` |
| `confirmButtonLabel` | `confirm-button-label` |                                                                                                     | `string`  | `"Delete"`     |
| `confirmPrompt`      | `confirm-prompt`       | Overrides the default prompt line: Please enter "{confirmWord}" to proceed.                         | `string`  | `undefined`    |
| `confirmWord`        | `confirm-word`         |                                                                                                     | `string`  | `"DELETE"`     |
| `dialogLabel`        | `dialog-label`         | aria-label for the dialog, e.g. "Delete company". When empty the dialog is labelled by its heading. | `string`  | `undefined`    |
| `hasLoad`            | `has-load`             |                                                                                                     | `string`  | `undefined`    |
| `heading`            | `heading`              |                                                                                                     | `string`  | `undefined`    |
| `keptNote`           | `kept-note`            | Optional "what is kept" note rendered below the lead copy with a positive check icon.               | `string`  | `undefined`    |
| `load`               | `load`                 |                                                                                                     | `boolean` | `false`        |
| `open`               | `open`                 |                                                                                                     | `boolean` | `false`        |


## Events

| Event        | Description | Type                |
| ------------ | ----------- | ------------------- |
| `didLoad`    |             | `CustomEvent<void>` |
| `insClose`   |             | `CustomEvent<void>` |
| `insConfirm` |             | `CustomEvent<void>` |


## Methods

### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
