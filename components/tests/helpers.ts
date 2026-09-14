/**
 * Shared bits for the component specs.
 *
 * `mount` wraps page.setContent so every spec also loads the bundle's two global stylesheets:
 * insites.css (tokens and layout) and insites-font-icons.css. The www build serves both under
 * /assets/insites/css/, the same files publish.sh ships to the CDN, so computed styles here are
 * the ones an instance gets. The icon font is not optional: several controls are a bare <i>
 * glyph inside a padding-less button, so without it they have no width and Playwright treats
 * them as invisible.
 */
import type { E2EPage } from '@stencil/playwright';

export const STYLESHEETS = [
  '/assets/insites/css/insites-font-icons.css',
  '/assets/insites/css/insites.css',
];

export async function mount(page: E2EPage, html: string): Promise<void> {
  const links = STYLESHEETS.map((href) => `<link rel="stylesheet" href="${href}" />`).join('');
  await page.setContent(`${links}${html}`);
  await page.waitForChanges();
}
