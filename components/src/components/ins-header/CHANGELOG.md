# Unreleased
- [TW#26955888](https://pm.cbo.me/#tasks/26955888) The keyboard-shortcuts dialog and the production switch warning cover the whole page: the header takes `--iia-z-modal` (10000) while one is open, so their scrim sits above the rail, an edit screen's fixed DELETE/SAVE bar and the modules' drawers and modals, and a click outside the dialog closes it instead of reaching what is behind. The instance switcher and account menu raise the header to `--iia-z-header-raised`, now 106 (was 80), so their scrim covers that bar too, including the docked switcher's last rows on a phone.
- [TW#26936697](https://pm.cbo.me/#tasks/26936697) Breadcrumb bar: the last crumb is the current page when its link matches the whole hash or the hash's route without its query string (`utils/hash-route`, as `ins-sidebar` matches). After a reload of `#/settings/email-logs?search=x`, "Email Logs" draws as the current crumb (`aria-current="page"`) instead of a link that dropped the filters. A leaf with another route stays a link (`#/crm` is not `#/crm-something`).
- [TW#26944935](https://pm.cbo.me/#tasks/26944935) Administrator preferences (`help_panels:dismissed`, `switcher:skip_production_warning`) are read from `window.__iiaBoot.administratorPreferences` when the shell provides it, and fetched from `preferencesEndpoint` only when it does not. A write also updates the payload, so a later read on the same page sees it.
- [TW#26936693](https://pm.cbo.me/#tasks/26936693) Production switch warning: "a live production instance" (was "the"), and "Don't show me again" is the dialog's own checkbox with a `<label for>`, on one centred line with its label and a visible keyboard focus ring. The dialog no longer renders `ins-checkbox`.
- [TW#26744156](https://pm.cbo.me/#tasks/26744156) Switching instance shows no toast: the host navigates away and the target is not open yet when the event fires.
- [TW#26744156](https://pm.cbo.me/#tasks/26744156) The instance switch toast reads "Switching to <instance>…" instead of "Now in <instance>.", because the host navigates after the event and the target is not open yet.
- [TW#26801633](https://pm.cbo.me/#tasks/26801633) The support pill and phone icon button label reads "Close support chat" while the Messenger is open, and uses "message" for a count of one.
- [TW#26801633](https://pm.cbo.me/#tasks/26801633) v6 support chat: the support pill and the phone-width icon button now toggle the Intercom Messenger (open, or `hide` when it is open), tracking the open state through `onShow`/`onHide` and exposing it as `aria-expanded`; `insSupportOpen` still fires on open, and the "Message support" menu rows always open. Intercom is subscribed to once, also when it loads after the header. The pill reads "Online" inside office hours and `supportReplyLine` with a muted dot (`iia-chat__dot--away`, `iia-chat__presence--away`) outside them, re-checked every minute while connected. New props `supportHours` (`support-hours`, default `1-5 08:00-18:00`) and `supportTimeZone` (`support-time-zone`, default the browser's zone). `supportPresence` no longer defaults to "Online": unset, the hours decide; a non-empty value pins the label and the online dot as before. The screen reader label stays "Open support chat, N unread messages".
- [TW#26371963](https://pm.cbo.me/#tasks/26371963) Add `variant="v6"`, the IIA v6 Admin Shell top bar from the v1.5 design: 56px dark chrome with rail toggle, logo, support pill, environment chip with a grouped instance switcher and production confirmation, view-frontend, theme toggle, help menu, account menu, the 40px breadcrumb bar (fed by `ins-renderer`'s `insRouteChange`; hidden on `#/`, drops the rail's leading Home entry and the leaf ins-renderer records twice) and the keyboard-shortcuts dialog. New props `logoSrc`, `environment`, `instanceName`, `instanceDomain`, `instanceId`, `instances`, `userName`, `userEmail`, `profileHref`, `logoutHref`, `docsHref`, `consoleHref`, `frontendHref`, `themeEndpoint`, `lockEndpoint`, `lockFormName`, `helpRestore`, `helpPanelsDismissed`, `supportPresence`; new events `insInstanceSwitch`, `insThemeChange`, `insLockScreen`, `insHelpRestore`, `insShortcutsOpen`, `insSupportOpen`. `toggleSidebar()` keeps its contract. Below 1280px the rail collapses to a 64px column and an expanded rail is a drawer; the desktop preference survives the crossing in both directions. After a side-by-side audit against the rendered prototype: the breadcrumb bar sits in the content column beside the rail (positioned from the header, `iia-shell--crumbs` stamped on the shell while it shows); tooltips take the DS Tooltip geometry (8px gap, 6px 10px padding, arrow, centred); the switcher opens 4px below the chip, docks with 12px side margins below 640px, and colours its group labels with the environment's text ink; the chrome inherits the DS leading (1.6) and buttons inherit it. The switcher is presentational this release: no Console instance-list endpoint exists yet, so Switch emits and navigates nowhere. The previous header's "Lock screen" row is not in the design and is not rendered; the action is exposed as the `lockScreen()` method instead, so a host can keep the feature on a trigger of its own. Two shell-layer fixes from the first use on real pages: the module SPAs' own page-title breadcrumbs are hidden under the v6 shell so the header bar is the one trail, and the content column scrolls (`overflow-y: auto`, the prototype's model) instead of clipping pages taller than the viewport. The bar now draws the page's own trail: it listens for `insBreadcrumbsChange` from `ins-breadcrumbs` (what every module SPA calls on each route) and falls back to the rail's `insRouteChange` chain until a page has mounted. Every crumb with a route is a link except the current page; a module heading with no route is plain text; the doubled leaf the v5 pages record is collapsed. Help panels and the production warning now persist per administrator through the administrator-preferences endpoint (new prop `preferencesEndpoint`): the "Show help panels" row lights when `ins-help-panel` reports a dismissal (`insHelpDismiss`), restore clears the stored list and emits `insHelpRestore`, and "Don't show me again" on the production switch survives across devices. The design's toast (green tick, message, 4s timer bar, docked to the bottom on phones) confirms a dismissal, a restore, and a switch once Console supplies instances. The default render is unchanged; two null guards added on the legacy nav lookups.

# v2.10.3
- [TW#18504517](https://pm.cbo.me/#tasks/18504517) Removed sidebar menu item 48px fixed height

# 1.0.10 (06-18-2018)
### Bug Fixes
- Added ins-sidebar-footer-menu in toggleSidebar

# 1.0.9 (06-16-2018)
### Bug Fixes
- Add animation icon when click

# 1.0.8 (06-29-2018)
### Bug Fixes
- Refactored document.getElementsByTagName to document.querySelector
- Updated element insSidebarEl

# 1.0.7 (06-28-2018)
### Bug Fixes
- Updated scss for dynamic style
- Updated class "back-nav.fl" to "icon-nav.fl"
- Updated class "back-nav" to "icon-nav"

# 1.0.6 (06-14-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.5 (06-13-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.4 (06-11-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.3 (06-07-2018)
### Bug Fixes
- Reworked code structure
- Updated scss for dynamic style

# 1.0.2 (05-31-2018)
### Bug Fixes
- Updated scss for dynamic style
- Added state decorator: sidebarMini, hasSidebar, insAdminEl, insNotificationsEl, insSidebarEl, & fullScreenState
- Added element decorator insHeaderEl

# 1.0.1 (05-29-2018)
### Bug Fixes
- Reworked code structure

# 1.0.0 (05-25-2018)
- create new component ins-header