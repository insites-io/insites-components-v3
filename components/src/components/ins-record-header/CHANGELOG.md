# v3.3.1 (TW#26778152)

- `status-color` accepts the status words the old `<ins-tag>` did (enabled/active/published → green, disabled/archived/error → red, pending/flagged → orange), so a module passing its record status through gets the design colour instead of grey.
- The card sits above the tab strip that follows it (z-index 5), so a kebab menu opened from the actions area paints over the tabs. Seen on Manage Product on staging.

# v3.3.0 (TW#26778152)

- New. The IIA v6 record identity header: the CRM Contact v1.4 / Company v1.0 `section.crm-hdr` as a bundle component so every module's record page draws the same header. Avatar (image, initials on the brand colour, or an icon), name as the page h1, subtitle, website link, facts row, status pill (`green | red | orange | yellow | blue | grey`), status-info text, `archived` dim.
- Slots (light DOM): `pills` (extra chips), `metrics` (an `ins-metric-tile-group variant="strip"`; inline on wide headers, its own full-width row from 1180px down), `actions` (buttons or `ins-action-menu`; pinned top-right below 600px), `extra` / default (content under the card).
- The host is an inline-size container, so the breakpoints follow the header's own width like the CRM record page does.
- Styling lives in `insites.css` ("IIA v6 record header layer"), tokens only.
