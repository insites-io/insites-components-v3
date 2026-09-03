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
component consolidation — and it publishes only to a separate `v6/latest` CDN
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

## Releasing (publishes to the `v6` CDN path only — never `v2`)
1. Build components and styles

2. Go to release folder and rename the current version to its release version. eg v6.0.0 rename to v6.0.1

3. Delete all `.js` files inside it

4. Copy all files in `components/www/build` and paste it in the version folder (point 2).

5. Copy all insites css in `components/assets/css` and replace the files in the css folder in the version folder (point 2).

6. Delete all files in `release/v6/latest` folder

7. Copy all files in the version folder you are going to release (point 2)

8. Get access to the AWS account holding the `ins-styleguide` bucket (not any of the `insites-*` SSO profiles — see Build 0 notes) and go to [ins-styleguide](https://s3.console.aws.amazon.com/s3/buckets/ins-styleguide?region=us-west-2&tab=objects) bucket

9. First upload the new version folder, under `v6/`

10. Then delete all files in the `v6/latest` folder

11. Upload the latest release files inside the `v6/latest` folder

12. Go to [AWS CloudFront](https://console.aws.amazon.com/cloudfront/v3/home?region=us-west-1#/distributions/EKAHJ8SFS25OG/invalidations)

13. Create invalidation with this object path `/v6/latest/*`

**Never repeat this process against `v2/*`.** `v2` is frozen for Combinate and
old client websites — it takes security/data-loss backports only, applied
directly in `insites-components-v2`, not from this repo.
