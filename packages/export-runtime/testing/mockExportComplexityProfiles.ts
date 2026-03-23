/**
 * SF24-T08 — Pre-built complexity tier profile configs.
 */

export const mockExportComplexityProfiles = {
  essential: {
    tier: 'essential' as const,
    formats: ['csv', 'xlsx'] as const,
    hasComposition: false,
    hasConfigure: false,
  },
  standard: {
    tier: 'standard' as const,
    formats: ['csv', 'xlsx', 'pdf', 'print'] as const,
    hasComposition: false,
    hasConfigure: false,
  },
  expert: {
    tier: 'expert' as const,
    formats: ['csv', 'xlsx', 'pdf', 'print'] as const,
    hasComposition: true,
    hasConfigure: true,
  },
} as const;
