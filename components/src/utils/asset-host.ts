/**
 * Module admin screens pass images as paths on the instance host (`/assets/modules/<slug>/insites_admin/...`).
 * The prod01 stack does not serve assets from the instance host: they live on the asset CDN host that the
 * module scripts themselves load from (`https://files.prod01-insites.io/instances/<id>/assets/...`), so the
 * relative path 404s there. CRM read that host from its own script tag (TW#26896853); the other modules did
 * not, which left their loaders as broken images (TW#26951438). Resolving here covers every module at once.
 */
const MODULES_MARKER = '/assets/modules/';

/** The asset base the page's module scripts load from (for example `https://files.prod01-insites.io/instances/38`), or '' when none. */
export function assetBase(doc: Document = document): string {
  const scripts = Array.from(doc.querySelectorAll<HTMLScriptElement>(`script[src*="${MODULES_MARKER}"]`));
  for (const script of scripts) {
    let url: URL;
    try {
      url = new URL(script.src);
    } catch {
      continue;
    }
    // The marker must sit in the path: one that appears only in the query or hash says nothing about the host.
    const at = url.pathname.indexOf(MODULES_MARKER);
    if (at >= 0) return url.origin + url.pathname.slice(0, at);
  }
  return '';
}

/**
 * Resolves a root-relative `/assets/...` path against the module scripts' asset host when that host's origin
 * differs from the page's. Absolute URLs, other relative paths, empty values, pages without module scripts and
 * pages whose module scripts load from the page's own origin are returned unchanged. On iia-staging the scripts
 * load from files.staging-insites.io, so the path is rewritten there too; that host serves the same files.
 */
export function resolveAssetPath(src: string, doc: Document = document): string {
  if (!src || !src.startsWith('/assets/')) return src;
  const base = assetBase(doc);
  if (!base) return src;
  try {
    if (new URL(base).origin === doc.location.origin) return src;
  } catch {
    return src;
  }
  return base + src;
}
