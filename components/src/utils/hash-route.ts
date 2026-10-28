/**
 * The route part of a location hash, before any query string: "#/settings/email-logs?range=x" gives
 * "#/settings/email-logs" (TW#26936697). Screens that keep their filters in the URL add a query string to the
 * hash, so ins-sidebar (rail and flyout) and ins-header (breadcrumb bar) fall back to this route when the whole
 * hash matches nothing. It only cuts at the "?": "#/crm-something" never becomes "#/crm".
 */
export const routeOf = (hash: string) => hash.split('?')[0];
