# Unreleased
- [TW#26807060](https://pm.cbo.me/#tasks/26807060) On phones the calendar icon is hidden while flatpickr's native date input is showing, so a tap reaches the phone's own picker button instead of the icon on top of it. Desktop unchanged.

# v2.0.0

## Changes from V1
- Updated event `onpick` to `insInput` to avoid conflict with the native DOM event name
- Updated event `valueChange` to `insValueChange` to avoid conflict with the native DOM event name
- Added support for date and time only with `mode` attribute