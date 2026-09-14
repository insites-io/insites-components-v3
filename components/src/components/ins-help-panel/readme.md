# ins-help-panel



<!-- Auto Generated Below -->


## Overview

ins-help-panel — the IIA v6 shell's dismissible help panel (Admin Shell v1.5 design, TW#26371963).

A card that explains the screen it sits on, with a small graphic, a heading, a body and a
"Dismiss permanently" control. Dismissal is stored per administrator through the
administrator-preferences endpoint, so a panel dismissed once stays dismissed on every device.
The account menu's "Show help panels" row (ins-header) restores every dismissed panel at once.

Storage: one preference row, key `help_panels:dismissed`, value a JSON array of panel keys.
The header reads the same row to decide whether its restore row is live, and clears it on restore.

  <ins-help-panel panel-key="dashboard" heading="…" body="…"></ins-help-panel>

Copy comes from the page (`heading` / `body`, or the default slot for richer body content); the
shell owns the frame, the graphic, the persistence and the restore round trip.

## Properties

| Property              | Attribute              | Description                                                                                  | Type     | Default                                                                             |
| --------------------- | ---------------------- | -------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `body`                | `body`                 | Plain-text body. Use the default slot instead for markup.                                    | `string` | `''`                                                                                |
| `dismissedMessage`    | `dismissed-message`    | Toast copy shown by the header when the panel is dismissed.                                  | `string` | `'Help hidden for you. Restore it from your account menu, under Show help panels.'` |
| `graphic`             | `graphic`              | 'dashboard' draws the design's animated cards graphic; 'none' draws no graphic.              | `string` | `'dashboard'`                                                                       |
| `heading`             | `heading`              |                                                                                              | `string` | `''`                                                                                |
| `panelKey`            | `panel-key`            | Stable key for this panel, e.g. "dashboard". Required; without it nothing can be remembered. | `string` | `''`                                                                                |
| `preferencesEndpoint` | `preferences-endpoint` |                                                                                              | `string` | `'/insites/core/administrator-preferences'`                                         |


## Events

| Event            | Description                                                                                    | Type                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `insHelpDismiss` | Fired on dismiss, bubbling to the document, so ins-header can light its restore row and toast. | `CustomEvent<{ key: string; message: string; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
