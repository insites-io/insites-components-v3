# ins-record-header



<!-- Auto Generated Below -->


## Overview

IIA v6 record identity header (TW#26778152).

The card at the top of a record page: avatar (image, or initials on the brand colour),
the record's name as the page h1, a subtitle line, an optional website link, a row of
short facts, status/category pills, a metric strip and an actions area. It is the CRM
Contact v1.4 / Company v1.0 `section.crm-hdr` moved into the bundle so every module's
record page draws the same header from one place instead of each SPA carrying its own
SubHeader markup.

Content that differs per record type comes in through slots, all light DOM:
  - `pills`    extra chips after the status pill (category, type…)
  - `metrics`  an <ins-metric-tile-group variant="strip"> (or any strip); inline on wide
               headers, on its own full-width row from 1180px down
  - `actions`  buttons / <ins-action-menu>; pinned top-right below 600px
  - `extra`    anything that used to sit under the old SubHeader (toggles, mid display)

Styling is in insites.css ("IIA v6 record header layer"), tokens only. The host is an
inline-size container so the breakpoints follow the header's own width, not the viewport,
the same way the CRM record page does it.

## Properties

| Property      | Attribute      | Description                                                                                                                                                                                                                                                                                                            | Type      | Default  |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | -------- |
| `archived`    | `archived`     | Dim the header (archived / disabled record).                                                                                                                                                                                                                                                                           | `boolean` | `false`  |
| `facts`       | `facts`        | Short facts rendered as a separated row ("Sydney · 12 Oct · 240 capacity"). JSON array or comma-separated string.                                                                                                                                                                                                      | `any`     | `[]`     |
| `icon`        | `icon`         | Icon-font class shown in the avatar circle instead of initials (e.g. icon-calendar for an event).                                                                                                                                                                                                                      | `string`  | `''`     |
| `image`       | `image`        | Avatar image URL. When empty the initials of `name` render on the brand colour.                                                                                                                                                                                                                                        | `string`  | `''`     |
| `name`        | `name`         | Record name. Rendered as the page h1 and used for the initials.                                                                                                                                                                                                                                                        | `string`  | `''`     |
| `noAvatar`    | `no-avatar`    | Hide the avatar entirely (records with no natural portrait: an event, a product, a form).                                                                                                                                                                                                                              | `boolean` | `false`  |
| `status`      | `status`       | Status pill label (Active, Enabled, Draft…). Empty renders no pill.                                                                                                                                                                                                                                                    | `string`  | `''`     |
| `statusColor` | `status-color` | Status pill colour: green \| red \| orange \| yellow \| blue \| grey, or one of the status words the old <ins-tag> accepted (enabled, active, published, valid, positive, open, new → green; disabled, archived, error, invalid, negative, closed → red; pending, flagged → orange). Anything else falls back to grey. | `string`  | `'grey'` |
| `statusInfo`  | `status-info`  | Small muted text before the status pill (the old SubHeader `tagInfo`).                                                                                                                                                                                                                                                 | `string`  | `''`     |
| `subtitle`    | `subtitle`     | One line under the name: a role, a company, a date range. Plain text.                                                                                                                                                                                                                                                  | `string`  | `''`     |
| `website`     | `website`      | External link shown under the subtitle, opened in a new tab.                                                                                                                                                                                                                                                           | `string`  | `''`     |
| `websiteText` | `website-text` | Text for the website link; defaults to the URL.                                                                                                                                                                                                                                                                        | `string`  | `''`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
