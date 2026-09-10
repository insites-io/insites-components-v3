## Fork provenance

Forked from [insites-components-v2](https://github.com/insites-io/insites-components-v2)
at tag `v2.15.6` (commit `bb097e1`, 2026-03-31) on 2026-09-03, as part of IIA v6's
Build 0 (TW#26709029). Verified against the live `v2/latest` CDN before forking:
a fresh build of this exact commit matched 83 of 86 non-asset build files
byte-for-byte, with the remaining 3 explained by Stencil's known non-deterministic
lazy-chunk hashing (identical content, different hash-named file).

**Why a separate repo rather than a branch of v2:** `insites-components-v2` keeps
serving Combinate and old client websites from `components.insites.io/v2/latest`,
frozen indefinitely. This repo (`v3`) is where IIA v6 admin development happens
going forward — new table variants, promoted CRM patterns, the icon-font merge,
component consolidation — and it publishes only to a separate `v3/latest` CDN
path that no website ever loads. Same custom-element tag names (`ins-*`), same
Stencil setup; different codebase so the two lines can diverge safely.

v2 receives security/data-loss backports only, from this point forward.

## Development

## Dependencies
- NodeJS v14^

### Components
- Open terminal
- run `cd components && npm start`

#### Development Pages
Development pages are ready to use dev environments for developing and testing components
- [Dev Environment](http://localhost:3333/assets/styleguide/dev.html)
- [Vue Environment](http://localhost:3333/assets/styleguide/vue.html)
- [ins-table Environment](http://localhost:3333/assets/styleguide/table-dev.html)

### Adding/Updating Styles
Component styles are located in the styles folder, files are named with its component counterpart. When creating a new component its better to name it the same with the component to make it easier to find and maintain.

- Open terminal
- run `cd styles && npm run serve`

### Updating Font Icons
1. Open `insites-font-icons.css`
2. Update the [query string](https://cbo.d.pr/yF2MLh) from the source file
3. Copy the new icons or the updated icons
4. Update external documentation

## Building for Deployment
To build components or styles, go to its respective folders and run `npm run build`.

## Releasing (publishes to the `v3` CDN path only — never `v2`)

Every release is a **pinned version plus the `v3/latest` alias**. Instances load the alias; the pin is what
you roll back to. Pinned folders are immutable: never re-publish one.

1. Build: `cd components && npm run build`.
2. Bump `components/package.json` `version` (3.x.y) and add a section to `Release Notes` saying what changed
   since the previous pin.
3. Publish: `scripts/publish.sh 3.x.y`. It refuses to run if the build is missing, the version does not
   match package.json, or the pin already exists. It syncs the build and CSS to `v3/3.x.y/` and `v3/latest/`,
   bumps `dist/version-cache.txt` (the insites_core layouts append it as `?updated=` to every bundle URL, so
   browsers stop serving the previous loader from cache), invalidates CloudFront and byte-verifies the edge.
4. Tag: `git tag v3.x.y && git push --tags`.
5. Only if a module changed too: deploy it after the bundle, never before (the bundle is additive; a new
   page on an old bundle is what breaks).

**Rollback:** `scripts/rollback.sh 3.x.y` re-syncs a pinned folder onto `v3/latest` (with delete), bumps
the stamp and invalidates. Exercised on 2026-09-10 (3.1.0 → 3.0.0 → 3.1.0 on iia-staging). A per-request
check without touching the alias: append `?insites_component_version=v3/3.x.y` to any admin URL.

**Compatibility contract** (Build 0, TW#26709029): consumers of `v3/latest` are instances × installed module
versions, so every publish is additive-only — no removed props, events, tags or class names; default renders
unchanged; new behaviour behind new props or variants. Smoke the release on the oldest v6 instance as well
as the newest once a second v6 instance exists.

Infrastructure: bucket `insites-style-guide` (us-west-2), CloudFront `E35G635O6GR2HY`, Styleguide AWS
account 959727866136, SSO profile `insites`. Older docs naming `ins-styleguide` / `EKAHJ8SFS25OG` are wrong.

**Never repeat this process against `v2/*`.** `v2` is frozen for Combinate and
old client websites — it takes security/data-loss backports only, applied
directly in `insites-components-v2`, not from this repo.
