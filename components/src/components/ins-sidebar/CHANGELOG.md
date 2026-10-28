# Unreleased
- [TW#26946871](https://pm.cbo.me/#tasks/26946871) v6 rail: a flyout now draws above the page's fixed and sticky bars. The flyout is `position: fixed` inside the rail, and the rail is a stacking context (`position: relative` plus `--iia-z-rail`), so the flyout's own z-index only ordered it inside the rail. On every module edit screen the action bar with DELETE (`.footer-buttons-wrapper`, `position: fixed; z-index: 100` in legacy app.min.css) covered the lower rows of the Configure flyouts, such as Instance Configuration and Insites Modules under Settings. While a flyout is open the rail takes `--iia-z-flyout`, now 105 (was 80): above the page's bars at 100, under the shell's toast region (110) and the modules' modals, drawers and tooltips (1000 and up). On close the rail drops back to 40 (70 overlaying below 1280px), so the header's raised menus still cover it. CSS only (`insites.css`); spec: `ins-sidebar-flyout-layer.e2e.ts`.
- [TW#26936697](https://pm.cbo.me/#tasks/26936697) A hash with a query string (`#/settings/email-logs?range=last_7_days`) matches its rail item by route alone once the exact and `?reroute=` matches find nothing, so a reload with filters in the URL lights the right item and keeps the trail. Matching stays exact (`#/crm` never matches `#/crm-something`). The flyout marks its current row the same way, exact first: a row whose link is the whole hash wins over a sibling that matches only the route. The route helper lives in `utils/hash-route`, shared with `ins-header`.
- [TW#26868377](https://pm.cbo.me/#tasks/26868377) v6 rail: a top-level item's `rail-group` (`work`, `build`, `sell`, `configure`; trimmed, any case) places it in that group ahead of the icon lookup, after the group's icon-ranked items in emit order. Any other value, including `primary` and `''`, logs one `console.warn` naming the item and the value and falls back to the icon lookup. `hide-for-medium` items stay in the hidden mobile-only group; items without the attribute and non-v6 rails are unchanged. `utils/phosphor-shell-icons` is unchanged.
- [TW#26371963](https://pm.cbo.me/#tasks/26371963) Add `variant="v6"`, the IIA v6 Admin Shell rail from the v1.5 design: 216px expanded / 64px collapsed (56px below 768px), one shared hover pill that slides between rows, a 2px active marker, Phosphor outline-to-fill icons resolved centrally from each item's existing `icon` class, and hover flyouts for sub-menus (tap below 1024px). Top-level items are arranged into the design's groups before the first render (Dashboard, then Work / Build / Sell / Configure, each under a rule and a 12px label that the collapsed rail drops), keyed by each item's existing `icon` class in `utils/phosphor-shell-icons`; modules the design does not place fall into an unlabelled trailing group. Flyout rows and plain items navigate through their own href, as the default render does, so the hash matcher routes them. On the root route with no landing-page item the Dashboard row takes the marker, as in the design; the rail inherits the DS leading (1.6). New methods `railItemEnter`, `railItemLeave`, `toggleFlyout`, `closeFlyout`, `isCollapsed`; new event `insFlyoutChange`. Additive: the default render, hash routing, `minimise()`/`maximise()` and the `routePage` listener are unchanged, so no module rail partial needs editing. Two null guards on the legacy tooltip lookup, which the v6 DOM does not contain.

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