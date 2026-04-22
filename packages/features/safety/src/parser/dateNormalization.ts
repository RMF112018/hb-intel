/**
 * Timezone-stable date normalization.
 *
 * Wave 2 audit remediation (P2-11): replaces `Date.parse()` fallbacks and
 * `toISOString().slice(0, 10)` of locally-parsed Date objects that could
 * drift by a day across locales / timezones.
 *
 * Accepts:
 *   - Date object (interpreted as UTC Y-M-D)
 *   - Excel serial number (days since 1899-12-30 epoch, with Feb-29-1900 skip)
 *   - ISO `YYYY-MM-DD` (or `YYYY-MM-DDTHH:MM:SS...`)
 *   - US short date `M/D/YYYY` or `MM/DD/YYYY`
 *   - `YYYY/MM/DD`
 *
 * Returns `YYYY-MM-DD` using UTC components, or `null` when unparseable.
 */

export function normalizeInspectionDate(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) return null;
    return toUtcYmd(raw);
  }

  if (typeof raw === 'number') {
    return excelSerialToYmd(raw);
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return null;

    // ISO date with optional time / timezone suffix.
    const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/);
    if (iso) {
      const [, y, m, d] = iso;
      return assembleYmd(+y, +m, +d);
    }

    // YYYY/MM/DD.
    const slash = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (slash) {
      const [, y, m, d] = slash;
      return assembleYmd(+y, +m, +d);
    }

    // US short M/D/YYYY or MM/DD/YYYY.
    const us = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (us) {
      const [, m, d, y] = us;
      return assembleYmd(+y, +m, +d);
    }

    // Numeric Excel serial serialized as string.
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return excelSerialToYmd(Number(trimmed));
    }
  }

  return null;
}

export function excelSerialToYmd(serial: number): string | null {
  if (!Number.isFinite(serial) || serial <= 0) return null;
  // Excel's serial 1 = 1900-01-01; serial 60 is the phantom Feb 29 1900 that
  // does not exist in the real calendar. Subtract 1 day for any serial >= 60
  // so post-phantom serials map to the correct real calendar date.
  const base = Date.UTC(1899, 11, 31); // Dec 31 1899
  const adjusted = serial >= 60 ? serial - 1 : serial;
  const ms = base + Math.round(adjusted * 86_400_000);
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return null;
  return toUtcYmd(d);
}

function toUtcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return (
    assembleYmd(y, m, day) ??
    `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  );
}

function assembleYmd(y: number, m: number, d: number): string | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
