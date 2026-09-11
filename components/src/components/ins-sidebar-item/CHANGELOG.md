# Unreleased
- [TW#26371963](https://pm.cbo.me/#tasks/26371963) Render the IIA v6 rail row when the closest `ins-sidebar` carries `variant="v6"`. No new props: the existing `icon` class is mapped to a Phosphor glyph through `utils/phosphor-shell-icons` (unmapped classes keep the font icon), nested items stay in the DOM for routing but are drawn by the parent's flyout, a click on a plain item lets the anchor navigate (the rail's hash matcher then routes it; only `href="#"` and a re-click on the current page route directly), and `routePageHandler()`/`activate()` behave exactly as before. `toggleMenuNav()` now tolerates a header without `.full-width-navs`, and `showSubMenu()` no longer un-collapses the rail in v6.

# 1.0.22 (07-17-2018)
### Bug Fixes
- Updated scss for dynamic style
- Updated ripple button

# 1.0.21 (07-16-2018)
### Bug Fixes
- Updated scss for dynamic style
- added no-icon feature
- Updated ripple feature

# 1.0.20 (07-13-2018)
### Bug Fixes
- Updated scss style hover sidemenu

# 1.0.19 (07-13-2018)
### Bug Fixes
- Updated componentDidLoad function 


# 1.0.18 (07-13-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.17 (07-13-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.16 (07-04-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.15 (07-04-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.14 (07-03-2018)
### Bug Fixes
- Updated attribute in parentlabel

# 1.0.13 (07-02-2018)
### Bug Fixes
- Updated scss for dynamic style
- Updated and finished Ripple feature

# 1.0.12 (06-29-2018)
### Bug Fixes
- Updated insAdminEl function

# 1.0.11 (06-29-2018)
### Bug Fixes
- Updated scss for dynamic style
- changed class="fas fa-chevron-right" to "fas icon-chevron-right"

# 1.0.10 (06-29-2018)
### Bug Fixes
- Updated scss for dynamic style
- Added state decorator isActive

# 1.0.9 (06-29-2018)
### Bug Fixes
- Updated scss for dynamic style
- Added element decorator insSidebarItemEl
- Added mouseLeaveHandler function
- Updated submenu-wrap for mouseLeaveHandler

# 1.0.8 (06-29-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.7 (06-13-2018)
### Bug Fixes
- Updated onclick feature

# 1.0.6 (06-11-2018)
### Bug Fixes
- Added no-icon feature

# 1.0.5 (06-07-2018)
### Bug Fixes
- Updated scss for dynamic style
- added method decorator

# 1.0.4 (06-05-2018)
### Bug Fixes
- added prop decorator landingPage


# 1.0.3 (05-31-2018)
### Bug Fixes
- Updated scss for dynamic style
- added class "with-ripple" on onClick

# 1.0.2 (05-31-2018)
### Bug Fixes
- Updated scss for dynamic style

# 1.0.1 (05-30-2018)
### Bug Fixes
- Updated scss for dynamic style
- Added state decorator submenuVisible
- Added prop decorator app, withSubmenu, label, submenuVisible
- updated routePageHandler

# 1.0.0 (05-29-2018)
- create new component ins-sidebar-item