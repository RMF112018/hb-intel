import type { MetadataAuthority, SafetyIngestionPreviewResult } from '@hbc/features-safety';

export function formatMarkerState(
  state: SafetyIngestionPreviewResult['diagnosticSummary']['checks']['parserContractMarkerState'],
): string {
  switch (state) {
    case 'markered-valid':
      return 'markered-valid';
    case 'markered-invalid':
      return 'markered-invalid';
    case 'markerless':
      return 'markerless';
    default:
      return state;
  }
}

export function formatAuthoritySource(source: MetadataAuthority['projectSite']): string {
  switch (source) {
    case 'parser-meta':
      return 'parser-meta';
    case 'named-range':
      return 'named-range';
    case 'legacy':
      return 'legacy fallback';
    case 'none':
      return 'none';
    default:
      return source;
  }
}
