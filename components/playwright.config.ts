import { expect } from '@playwright/test';
import { createConfig, matchers } from '@stencil/playwright';

// Stencil's event-spy matchers (toHaveReceivedEvent, toHaveReceivedEventDetail, ...) are opt-in.
expect.extend(matchers);

/**
 * Component tests for the v6 admin bundle (TW#26737045).
 *
 * @stencil/playwright builds the `www` output target, serves it, and gives every test a
 * `page.setContent()` that injects the bundle's script tags, so a spec can mount `<ins-x>` with
 * no HTML fixture and the component upgrades in a real Chromium. That matters here more than
 * usual: two of the defects this harness exists to catch (an action-menu flyout that closed on
 * the click that followed its hover, and two `var(--ins-*)` names that resolved to nothing) are
 * invisible to anything that does not run the real component in a real browser.
 *
 * The web server is the one @stencil/playwright wires up itself: `stencil build --dev --watch
 * --serve --testing` on the port from stencil.config (3333 by default). Do not override it here;
 * the plugin also patches page.goto/setContent to wait for the bundle, and that patch assumes its
 * own server.
 *
 * Runs with `npm test`. CI installs Chromium first; see .github/workflows/ci.yml.
 */
export default createConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
});
