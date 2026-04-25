/**
 * Browser-inspectable runtime proof object for Safety Field Excellence.
 *
 * Inspect via:
 *   JSON.stringify(window.__hbIntel_safetyFieldExcellenceRuntimeProof, null, 2)
 *
 * Never includes tokens, raw payload JSON, raw findings text, or raw
 * checklist content. Designed to give operators clear visibility into
 * which source mode is active, which data path rendered, and which
 * fallback (if any) was chosen.
 */

import type {
  SafetyFieldExcellenceDataSource,
  SafetyFieldExcellenceDynamicState,
  SafetyFieldExcellenceSourceMode,
} from '../../homepage/webparts/operationalAwarenessContracts.js';

export interface SafetyFieldExcellenceRuntimeProof {
  generatedAt: string;
  sourceMode: SafetyFieldExcellenceSourceMode;
  dataSource: SafetyFieldExcellenceDataSource;
  state: SafetyFieldExcellenceDynamicState;
  backendFunctionAppUrlConfigured: boolean;
  currentEndpointConfigured: boolean;
  currentEndpointUrl?: string;
  currentEndpointStatus?: number;
  publishedHighlightId?: number;
  reportingPeriodId?: string;
  reportingPeriodSpItemId?: number;
  periodLabel?: string;
  publishStatus?: 'published';
  freshUntil?: string;
  isStale?: boolean;
  dataConfidence?: 'high' | 'medium' | 'low';
  primaryProjectNumber?: string;
  secondaryCount: number;
  fallbackReason?: string;
  lastFetchStartedAt?: string;
  lastFetchCompletedAt?: string;
  packageVersion?: string;
  expectedPackageVersion?: string;
  /**
   * Wave 06: non-sensitive UI/UX proof fields. Set by the dynamic provider
   * based on the resolved render path. Useful for evidence docs and hosted
   * proof. Never includes tokens, raw payload content, or finding text.
   */
  previewFallbackRendered?: boolean;
  staleTreatment?: boolean;
}

declare global {
  interface Window {
    __hbIntel_safetyFieldExcellenceRuntimeProof?: SafetyFieldExcellenceRuntimeProof;
  }
}

const RUNTIME_PROOF_KEY = '__hbIntel_safetyFieldExcellenceRuntimeProof' as const;

export function publishSafetyFieldExcellenceRuntimeProof(
  proof: SafetyFieldExcellenceRuntimeProof,
): void {
  if (typeof globalThis === 'undefined') return;
  (globalThis as Record<string, unknown>)[RUNTIME_PROOF_KEY] = proof;
}

export function readSafetyFieldExcellenceRuntimeProof():
  | SafetyFieldExcellenceRuntimeProof
  | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  return (globalThis as Record<string, unknown>)[RUNTIME_PROOF_KEY] as
    | SafetyFieldExcellenceRuntimeProof
    | undefined;
}

export function clearSafetyFieldExcellenceRuntimeProof(): void {
  if (typeof globalThis === 'undefined') return;
  delete (globalThis as Record<string, unknown>)[RUNTIME_PROOF_KEY];
}
