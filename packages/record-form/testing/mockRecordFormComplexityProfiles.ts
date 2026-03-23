/**
 * SF23-T08 — Pre-built complexity tier profiles.
 */
export const mockRecordFormComplexityProfiles = {
  essential: { tier: 'essential' as const, hasPreview: false, hasConfigure: false },
  standard: { tier: 'standard' as const, hasPreview: true, hasConfigure: false },
  expert: { tier: 'expert' as const, hasPreview: true, hasConfigure: true },
} as const;
