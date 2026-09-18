/**
 * Default tab icons for the IIA v6 tab strip (TW#26778152).
 *
 * The CRM record pages (ViewContact / ViewCompany) give every tab an icon. The other ten module
 * SPAs declare 292 <ins-tab-item> tabs with label only, so this map lets <ins-tab variant="v6">
 * pick the same glyph the CRM would use without any module needing a commit. An explicit
 * icon="…" on the item always wins; an unmapped label renders label-only rather than a generic
 * placeholder glyph, so a missing entry is visible and gets added here.
 *
 * Keys are the labels as they appear in the module SPAs on 2026-09-18 (102 distinct), normalised
 * by normaliseTabLabel(). Glyph names are the icon-font classes shipped in insites-font-icons.css;
 * the six CRM tabs keep the exact glyphs the CRM uses.
 */
const TAB_ICONS: Record<string, string> = {
  // CRM record pages (the reference)
  'event stream': 'icon-globe',
  'activities': 'icon-activity',
  'tasks': 'icon-task-list',
  'opportunities': 'icon-briefcase',
  'orders': 'icon-shopping-cart',
  'events': 'icon-calendar',
  'contacts': 'icon-users',

  // Generic record sections
  'details': 'icon-file-text',
  'contact details': 'icon-file-text',
  'company details': 'icon-file-text',
  'email details': 'icon-mail',
  'sms details': 'icon-message-square',
  'content': 'icon-edit-2',
  'body': 'icon-edit-2',
  'header': 'icon-layout',
  'metadata': 'icon-tag',
  'sitemap': 'icon-git-branch',
  'open graph': 'icon-share-2',
  'schema': 'icon-code',
  'items': 'icon-list',
  'notes': 'icon-message-square',
  'media': 'icon-image',
  'gallery': 'icon-image',
  'image versions': 'icon-image',
  'fields': 'icon-columns',
  'custom fields': 'icon-sliders',
  'system fields': 'icon-sliders',
  'display fields': 'icon-columns',
  'system info': 'icon-cpu',
  'preview': 'icon-eye',
  'history': 'icon-clock',
  'documents': 'icon-folder-1',
  'alerts': 'icon-bell',
  'security': 'icon-shield',
  'policies': 'icon-shield',
  'properties': 'icon-sliders',
  'cache': 'icon-server',
  'webhooks': 'icon-zap',
  'unique content': 'icon-star',
  'advanced': 'icon-settings-1',
  'settings': 'icon-settings-1',
  'configuration': 'icon-settings-1',
  'appearance': 'icon-layout',
  'list layout': 'icon-list',
  'details layout': 'icon-layout',
  'ticket layout': 'icon-layout',
  'faqs': 'icon-message-square',
  'social media': 'icon-globe',
  'social links': 'icon-share-2',
  'open hours': 'icon-clock',
  'emails': 'icon-mail',
  'form code': 'icon-code',
  'form submissions': 'icon-list',
  'email notifications': 'icon-mail',
  'autoresponder notifications': 'icon-send',
  'workflow notifications': 'icon-bell',
  'autoresponder': 'icon-send',
  'workflow': 'icon-git-branch',
  'email notification': 'icon-mail',
  'sms notification': 'icon-message-square',

  // People and companies
  'personal info': 'icon-user-1',
  'company info': 'icon-briefcase',
  'companies': 'icon-briefcase',
  'related contacts': 'icon-users',
  'relationships': 'icon-link-2',
  'profiles': 'icon-user-1',
  'contact category': 'icon-tag',
  'contact type': 'icon-tag',
  'company category': 'icon-tag',
  'company type': 'icon-tag',
  'industry': 'icon-briefcase',
  'division': 'icon-layers',
  'lead source': 'icon-flag',

  // Addresses and places
  'address': 'icon-map-pin',
  'addresses': 'icon-map-pin',
  'po boxes': 'icon-package',
  'locations': 'icon-map-pin',
  'areas': 'icon-map-pin',
  'venue': 'icon-map-pin',

  // Commerce
  'pricing': 'icon-dollar-sign',
  'discounts': 'icon-percent',
  'shipping': 'icon-truck',
  'billing': 'icon-credit-card',
  'payments': 'icon-credit-card',
  'products': 'icon-box',
  'variants': 'icon-layers',
  'brands': 'icon-award',
  'categories': 'icon-tag',
  'restrictions': 'icon-lock-1',
  'quotes and orders': 'icon-shopping-cart',
  'sales': 'icon-trending-up',
  'expenses': 'icon-dollar-sign',
  'tickets': 'icon-bookmark',

  // Events
  'speakers': 'icon-mic',
  'sponsors': 'icon-award',

  // Pipelines
  'stages': 'icon-git-branch',
  'all opportunities': 'icon-briefcase',
  'open opportunities': 'icon-briefcase',
  'won opportunities': 'icon-check-circle',
  'lost opportunities': 'icon-x-circle',
  'withdrawn opportunities': 'icon-refresh-cw',
  'won reason': 'icon-check-circle',
  'lost reason': 'icon-x-circle',
};

/** Lower-case, trimmed, single-spaced. "Email Details " and "email details" are the same tab. */
export function normaliseTabLabel(label: string): string {
  return (label || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Icon-font class for a tab label, or '' when the label has no default. Labels built at runtime
 * with a type prefix ("Order Email Notification") fall back to their suffix so the notification
 * tabs in Forms and Events still resolve.
 */
export function iconForTabLabel(label: string): string {
  const key = normaliseTabLabel(label);
  if (!key) return '';
  if (TAB_ICONS[key]) return TAB_ICONS[key];
  const suffix = Object.keys(TAB_ICONS).find((k) => key.endsWith(' ' + k));
  return suffix ? TAB_ICONS[suffix] : '';
}
