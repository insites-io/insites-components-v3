# Unreleased
- [TW#26371963](https://pm.cbo.me/#tasks/26371963) Add `variant="v6"`, the IIA v6 Admin Shell top bar from the v1.5 design: 56px dark chrome with rail toggle, logo, support pill, environment chip with a grouped instance switcher and production confirmation, view-frontend, theme toggle, help menu, account menu, the 40px breadcrumb bar (fed by `ins-renderer`'s `insRouteChange`; hidden on `#/`, drops the rail's leading Home entry and the leaf ins-renderer records twice) and the keyboard-shortcuts dialog. New props `logoSrc`, `environment`, `instanceName`, `instanceDomain`, `instanceId`, `instances`, `userName`, `userEmail`, `profileHref`, `logoutHref`, `docsHref`, `consoleHref`, `frontendHref`, `themeEndpoint`, `lockEndpoint`, `lockFormName`, `helpRestore`, `helpPanelsDismissed`, `supportPresence`; new events `insInstanceSwitch`, `insThemeChange`, `insLockScreen`, `insHelpRestore`, `insShortcutsOpen`, `insSupportOpen`. `toggleSidebar()` keeps its contract. Below 1280px the rail collapses to a 64px column and an expanded rail is a drawer; the desktop preference survives the crossing in both directions. After a side-by-side audit against the rendered prototype: the breadcrumb bar sits in the content column beside the rail (positioned from the header, `iia-shell--crumbs` stamped on the shell while it shows); tooltips take the DS Tooltip geometry (8px gap, 6px 10px padding, arrow, centred); the switcher opens 4px below the chip, docks with 12px side margins below 640px, and colours its group labels with the environment's text ink; the chrome inherits the DS leading (1.6) and buttons inherit it. The switcher is presentational this release: no Console instance-list endpoint exists yet, so Switch emits and navigates nowhere. The previous header's "Lock screen" row is not in the design and is not rendered; the action is exposed as the `lockScreen()` method instead, so a host can keep the feature on a trigger of its own. Two shell-layer fixes from the first use on real pages: the module SPAs' own page-title breadcrumbs are hidden under the v6 shell so the header bar is the one trail, and the content column scrolls (`overflow-y: auto`, the prototype's model) instead of clipping pages taller than the viewport. The bar now draws the page's own trail: it listens for `insBreadcrumbsChange` from `ins-breadcrumbs` (what every module SPA calls on each route) and falls back to the rail's `insRouteChange` chain until a page has mounted. Every crumb with a route is a link except the current page; a module heading with no route is plain text; the doubled leaf the v5 pages record is collapsed. The default render is unchanged; two null guards added on the legacy nav lookups.

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