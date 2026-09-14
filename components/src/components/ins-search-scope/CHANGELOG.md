# Unreleased (TW#26717377)

## Design port
- Rendering replaced with the IIA v6 record-page search pill (CRM Company v1.0, Contacts tab header): `label.crm-search` 34px, "Search by:" trigger with `role="menu"` / `menuitemradio` options, clear button shown with a value, submit button whose icon spins while `loading`.
- The draft `<select>` scope picker (never released, no consumers) is gone. Classes `.ins-search-scope-icon`, `.ins-search-scope-select-wrap` and `.ins-search-scope-select` no longer render. `.ins-search-scope` (root) and `.ins-search-scope-input` (input) stay.
- `insSearch` now fires on submit only (Enter or the search button), the v5 behaviour the design keeps. `debounce` default changed from `300` to `0`; set it above 0 to restore a live search while typing.
- `clear()` now fires `insClear`, and `insSearch` only when a non-empty search is active.

## Added
- Props: `loading`, `disabled`, `scopePrefix`, `menuLabel`, `searchLabel`, `clearLabel`.
- Events: `insInput`, `insClear`, `insOpenChange`. `insScopeChange` detail gains `label`.
- Methods: `closeMenu()`, `focusInput()`.
- `scopeOptions` accepts plain strings as well as `{ label, value }` objects.
- Menu keyboard support: ArrowDown opens from the trigger, ArrowUp / ArrowDown / Home / End move between options, Escape closes and returns focus to the trigger; outside click closes.
