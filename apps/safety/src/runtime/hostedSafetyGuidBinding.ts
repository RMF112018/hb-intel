import {
  configureSafetyListGuids,
  currentSafetyGuidOverlay,
  type SafetyGuidOverlay,
} from '@hbc/features-safety';

const REQUIRED_HOSTED_KEYS = [
  'SafetyReportingPeriods',
  'SafetyProjectWeekRecords',
  'SafetyInspectionEvents',
  'SafetyFindings',
  'SafetyIngestionRuns',
  'SafetyChecklistUploads',
  'Projects',
  'LegacyProjectFallbackRegistry',
] as const;
export const HOSTED_SAFETY_GUID_REQUIRED_KEYS = REQUIRED_HOSTED_KEYS;

type HostedRequiredKey = (typeof REQUIRED_HOSTED_KEYS)[number];

const HBCENTRAL_HOSTED_GUID_OVERLAY: Readonly<Record<HostedRequiredKey, string>> = {
  SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
  SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
  SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
  SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
  SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
  SafetyChecklistUploads: 'ad498f9c-d0dd-4dd5-ba85-fe36d585adc6',
  Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
  LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
};
export const HBCENTRAL_HOSTED_GUID_OVERLAY_FINGERPRINT = fingerprintOverlay(HBCENTRAL_HOSTED_GUID_OVERLAY);

export function hostedSafetyGuidOverlay(): SafetyGuidOverlay {
  return { ...HBCENTRAL_HOSTED_GUID_OVERLAY };
}

export function hostedSafetyGuidOverlayFingerprint(): string {
  return HBCENTRAL_HOSTED_GUID_OVERLAY_FINGERPRINT;
}

export function bindHostedSafetyGuidOverlay(): void {
  configureSafetyListGuids(hostedSafetyGuidOverlay());
}

export function findMissingHostedSafetyGuidBindings(
  overlay: SafetyGuidOverlay = currentSafetyGuidOverlay(),
): HostedRequiredKey[] {
  return REQUIRED_HOSTED_KEYS.filter((key) => !overlay[key]);
}

function fingerprintOverlay(overlay: Readonly<Record<HostedRequiredKey, string>>): string {
  const canonical = REQUIRED_HOSTED_KEYS.map((key) => `${key}:${overlay[key]}`).join('|');
  let hash = 2166136261;
  for (let i = 0; i < canonical.length; i += 1) {
    hash ^= canonical.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
