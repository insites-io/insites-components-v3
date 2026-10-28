/**
 * Administrator preferences the v6 shell hands over at load (TW#26944935).
 *
 * CRM renders every preference row of the signed-in administrator into
 * window.__iiaBoot.administratorPreferences (insites_crm insites_admin/insites_boot_data, TW#26784952).
 * The value is the body the administrator-preferences endpoint serves, { items: { results: [{ key, value }] } },
 * newest row first, holding every key instead of one. ins-header and ins-help-panel read from it, so the
 * dashboard reads help_panels:dismissed once, server-side, where both components used to fetch it.
 *
 * No payload means undefined, and the caller fetches as before: an older CRM pin, another shell, or a page
 * rendered without a session. Writes still POST to the endpoint; rememberBootPreference keeps the handed-over
 * rows in step, as CRM's AdministratorPreferencesServices does, so a panel mounted later on the same page
 * reads the value just saved.
 */
type PreferenceRow = { key?: string; value?: unknown };

const bootRows = (): PreferenceRow[] | null => {
  const boot = typeof window !== 'undefined' ? (window as any).__iiaBoot : null;
  const payload = boot && boot.administratorPreferences;
  const rows = payload && payload.items && payload.items.results;
  return Array.isArray(rows) ? rows : null;
};

/** The handed-over value for `key`: a string, null when no row holds it, undefined when there is no payload. */
export const readBootPreference = (key: string): string | null | undefined => {
  const rows = bootRows();
  if (!rows) return undefined;
  const row = rows.find(r => r && r.key === key);
  return row && row.value != null ? String(row.value) : null;
};

/** Record a value just written, so later reads on this page see it. A no-op without a payload. */
export const rememberBootPreference = (key: string, value: string): void => {
  const rows = bootRows();
  if (!rows) return;
  const row = rows.find(r => r && r.key === key);
  if (row) row.value = value;
  else rows.push({ key, value });
};
