# Unreleased
- [TW#26371963](https://pm.cbo.me/#tasks/26371963) Add `variant="v6"`, the IIA v6 Admin Shell rail from the v1.5 design: 216px expanded / 64px collapsed (56px below 768px), one shared hover pill that slides between rows, a 2px active marker, Phosphor outline-to-fill icons resolved centrally from each item's existing `icon` class, and hover flyouts for sub-menus (tap below 1024px). New methods `railItemEnter`, `railItemLeave`, `toggleFlyout`, `closeFlyout`, `isCollapsed`; new event `insFlyoutChange`. Additive: the default render, hash routing, `minimise()`/`maximise()` and the `routePage` listener are unchanged, so no module rail partial needs editing. Two null guards on the legacy tooltip lookup, which the v6 DOM does not contain.

# 1.0.11 (07-16-2018)
### Bug fixes
- add style height calc

# 1.0.11 (07-16-2018)
### Bug fixes
- remove scss for no-icon

# 1.0.10 (07-02-2018)
### Bug fixes
- add style scss
- add decorators event, eventemitter, and state

# 1.0.9 (06-29-2018)
### Bug fixes
- adjust scss style

# 1.0.8 (06-29-2018)
### Bug fixes
- adjust scss style

# 1.0.7 (06-13-2018)
### Bug fixes
- adjust the z-index in scss

# 1.0.6 (06-11-2018)
### Bug fixes
- add style if no icon

# 1.0.5 (06-07-2018)
### Bug fixes
- - remove background images and style fir p- adding

# 1.0.4 (06-05-2018)
### Bug fixes
- add scss style

# 1.0.3 (05-31-2018)
### Bug fixes
- add scss style
- add decorators prop, state, method

# 1.0.2 (05-30-2018)
### Bug fixes
- add scss style
- add transclude

# 1.0.1 (05-29-2018)
### Bug fixes
- remove decorator prop, method, element, event, eventemitter and listen
- add scss style

# 1.0.0 (05-25-2018)
create new component ins-sidebar