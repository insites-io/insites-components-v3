#!/usr/bin/env node
// Retry failed component downloads inside the page (TW#26896897). Runs before every build (npm prebuild).
//
// Stencil loads each component's code the first time a page uses it, with one import() of
// ./p-<hash>.entry.js. If that download fails, Stencil logs the error and gives up: the component never
// registers ("Constructor for "ins-table#undefined" was not found") and the browser remembers the failed
// URL until the page reloads. On a weak connection that leaves the admin without its tables and editors.
//
// This rewrites Stencil's loadModule in node_modules so a failed download retries three times, with a short
// wait each time, at ./p-<hash>.entry.js?retry=<n>. The new URL is a fresh entry in the browser's module map,
// and CloudFront keys on the query string, so each retry fetches again rather than replaying the failure.
// Only the last failure reaches console.error, which is what CRM's component_load_guard listens for, so the
// guard's reload stays the fallback after the retries, not the first response.
//
// Idempotent. Fails the build if Stencil's source no longer matches, so an upgrade cannot drop the retry
// silently: re-check loadModule in @stencil/core/internal/client/index.js and update ORIGINAL below.
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../components/node_modules/@stencil/core/internal/client/index.js");
const MARKER = "TW#26896897 lazy retry";

const ORIGINAL = `    return importedModule[exportName];
  }, consoleError);
};`;

const PATCHED = `    return importedModule[exportName];
  }, (e) => retryLoadModule(bundleId, exportName, e, 1));
};
// ${MARKER}: see insites-components-v3 scripts/stencil-lazy-retry.js
var LAZY_RETRY_DELAYS = [400, 1500, 4000];
var retryLoadModule = (bundleId, exportName, error, attempt) => {
  if (attempt > LAZY_RETRY_DELAYS.length) {
    consoleError(error);
    return void 0;
  }
  return new Promise((resolve) => setTimeout(resolve, LAZY_RETRY_DELAYS[attempt - 1])).then(() => import(
    /* @vite-ignore */
    \`./\${bundleId}.entry.js?retry=\${attempt}\`
  )).then((importedModule) => {
    if (!BUILD4.hotModuleReplacement) {
      cmpModules.set(bundleId, importedModule);
    }
    return importedModule[exportName];
  }, (e) => retryLoadModule(bundleId, exportName, e, attempt + 1));
};`;

const source = fs.readFileSync(FILE, "utf8");
if (source.includes(MARKER)) {
  console.log("stencil-lazy-retry: already patched");
  process.exit(0);
}
const count = source.split(ORIGINAL).length - 1;
if (count !== 1) {
  console.error(`stencil-lazy-retry: expected loadModule's import handler once in ${FILE}, found it ${count} times. Stencil changed; update ORIGINAL in this script.`);
  process.exit(1);
}
fs.writeFileSync(FILE, source.replace(ORIGINAL, PATCHED));
console.log("stencil-lazy-retry: patched loadModule");
