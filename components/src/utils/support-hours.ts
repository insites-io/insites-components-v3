/**
 * Support office hours for the v6 header's support pill (TW#26801633).
 *
 * Intercom has no public live-presence API, so the design shows "Online" during office hours and
 * the reply-time line otherwise. The hours are a short string a host can override:
 *
 *   "1-5 08:00-18:00"      Monday to Friday, 8am up to (not including) 6pm
 *   "1-3,5 09:00-17:30"    Monday to Wednesday and Friday
 *   "6-1 10:00-14:00"      Saturday, Sunday and Monday (a day range may wrap past Sunday)
 *
 * Days are ISO weekdays, 1 = Monday to 7 = Sunday. Times are 24-hour HH:MM in the chosen time
 * zone; the end is exclusive and must be after the start (24:00 is allowed as an end).
 */
export const DEFAULT_SUPPORT_HOURS = '1-5 08:00-18:00';

export interface SupportHours { days: number[]; start: number; end: number }

const SPEC = /^\s*([1-7](?:\s*-\s*[1-7])?(?:\s*,\s*[1-7](?:\s*-\s*[1-7])?)*)\s+(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/;

/** Parse an hours string, or null when it does not follow the format. */
export const parseSupportHours = (spec: string | null | undefined): SupportHours | null => {
  const m = SPEC.exec(spec || '');
  if (!m) return null;
  const days: number[] = [];
  m[1].split(',').forEach(part => {
    const [a, b] = part.split('-').map(x => parseInt(x, 10));
    const last = isNaN(b) ? a : b;
    for (let d = a, n = 0; n < 7; d = d % 7 + 1, n++) {
      if (days.indexOf(d) < 0) days.push(d);
      if (d === last) break;
    }
  });
  const [sh, sm, eh, em] = [m[2], m[3], m[4], m[5]].map(x => parseInt(x, 10));
  if (sm > 59 || em > 59 || sh > 23 || eh > 24 || (eh === 24 && em > 0)) return null;
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (end <= start) return null;
  return { days, start, end };
};

const WEEKDAY: { [k: string]: number } = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/**
 * ISO weekday and minutes past midnight of `date` in `timeZone` (an IANA name; empty means the
 * browser's zone). Throws RangeError for a time zone the browser does not know.
 */
export const zonedWeekdayMinutes = (date: Date, timeZone?: string): { weekday: number; minutes: number } => {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts: { [k: string]: string } = {};
  fmt.formatToParts(date).forEach(p => { parts[p.type] = p.value; });
  // hour12: false can print midnight as "24" in some engines; % 24 folds it back to 0.
  return { weekday: WEEKDAY[parts.weekday], minutes: (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10) };
};

/** Whether `date` falls inside `hours` in `timeZone`. */
export const withinSupportHours = (hours: SupportHours, date: Date, timeZone?: string): boolean => {
  const { weekday, minutes } = zonedWeekdayMinutes(date, timeZone);
  return hours.days.indexOf(weekday) >= 0 && minutes >= hours.start && minutes < hours.end;
};
