/**
 * Runtime GUID overlay for Safety list descriptors.
 *
 * The source descriptors hold zero-GUID fail-closed placeholders. Tenant ops
 * provide real GUIDs at deploy time via `configureSafetyListGuids()`, wired
 * from `apps/safety/src/App.tsx` before the repository is constructed.
 *
 * This seam keeps source files free of tenant-specific identifiers while
 * preserving the fail-closed posture: `getListDescriptor()` still throws if
 * neither the source default nor the overlay has a non-zero GUID.
 */

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

export type SafetyOverlayKey =
  | 'SafetyReportingPeriods'
  | 'SafetyProjectWeekRecords'
  | 'SafetyInspectionEvents'
  | 'SafetyFindings'
  | 'SafetyIngestionRuns'
  | 'SafetyChecklistUploads'
  | 'Projects'
  | 'LegacyProjectFallbackRegistry';

export type SafetyGuidOverlay = Partial<Record<SafetyOverlayKey, string>>;

let overlay: SafetyGuidOverlay = {};

export function configureSafetyListGuids(overrides: SafetyGuidOverlay): void {
  overlay = { ...overlay, ...overrides };
}

export function resetSafetyListGuidOverlay(): void {
  overlay = {};
}

export function getOverlayGuid(key: SafetyOverlayKey): string | undefined {
  const candidate = overlay[key];
  if (!candidate || candidate === ZERO_GUID) return undefined;
  return candidate;
}

export function currentSafetyGuidOverlay(): Readonly<SafetyGuidOverlay> {
  return { ...overlay };
}

export { ZERO_GUID };
