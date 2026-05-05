import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PCC_DIR = fileURLToPath(new URL('.', import.meta.url));

/**
 * Allowlisted exported helpers that are pure read-model functions. Any
 * additional `export function` introduced in the PCC domain must be added
 * here to remain inside the no-mutation guard.
 */
const ALLOWED_EXPORTED_FUNCTIONS: readonly string[] = [
  'mapPccPersonaToProjectRole',
  'personaHasCapability',
  'findForbiddenFixtureKeys',
  // Wave 12 Prompt 02 — pure scoring / band / override / transition helpers
  // for the Constraints Log model. All functions are deterministic, side-
  // effect-free, and read-only-by-design.
  'computeGoverningImpactScore',
  'computeRiskScore',
  'computeResidualRiskScore',
  'computeConstraintExposureScore',
  'mapSeverityBand',
  'applySeverityOverride',
  'assertResidualReductionAllowed',
  'isRiskTransitionAllowed',
  'isConstraintTransitionAllowed',
  // Wave 13 Prompt 02 — pure transition / completion-gate / waiver /
  // reconciliation / lineage / HBI / dedupe-key helpers for the Buyout
  // Log model. All functions are deterministic, side-effect-free, and
  // read-only-by-design.
  'isBuyoutPackageTransitionAllowed',
  'assertBuyoutPackageTransition',
  'evaluateBuyoutCompletionGate',
  'validateBuyoutWaiver',
  'reconcileBuyoutAmounts',
  'requireBuyoutSourceLineage',
  'isBuyoutHbiEligible',
  'buyoutPriorityActionDedupeKey',
  // Wave 13 Prompt 13B — pure transition / freshness-derivation /
  // legacy-procore-hint-boundary helpers for the HB Central Projects
  // Registry + Procore Mapping contract. All functions are deterministic,
  // side-effect-free, read-only-by-design, and clock-injected.
  'isPccProcoreProjectMappingTransitionAllowed',
  'assertPccProcoreProjectMappingTransition',
  'derivePccProcoreMappingFreshnessBand',
  'validatePccProcoreProjectMappingLegacyHintBoundary',
  // Wave 13 Prompt 13C — pure cross-cutting Procore data-layer helpers
  // (freshness-band wrapper, derived-signal actionable predicate,
  // object-link dedupe-key builder, source-status mapper, defense-in-
  // depth display/fixture-safety redactor). All functions are
  // deterministic, side-effect-free, read-only-by-design, and clock-
  // injected.
  'deriveProcoreFreshnessBand',
  'isProcoreSignalActionable',
  'buildProcoreObjectLinkDedupeKey',
  'mapProcoreSourceStatusToPccPreviewState',
  'redactProcoreSyncErrorMessage',
  // Wave 14 Prompt 02 — pure approval-state, decision-shape, role-action,
  // HBI-refusal, redaction, stale-source, and legacy-bridge helpers. All
  // functions are deterministic, side-effect-free, read-only-by-design,
  // and operate on Wave 14 contract types.
  'isTerminalApprovalRequestState',
  'isApprovalRequestTransitionAllowed',
  'isActionAllowedForRole',
  'validateDecisionShape',
  'isSupersededRequest',
  'requiresEvidenceForAction',
  'isHbiPrincipalKey',
  'assertNoHbiAuthorityOnDecision',
  'redactionContextPreservedFor',
  'isStaleSourceReference',
  'mapLegacyCheckpointToInstance',
  'legacyCheckpointKind',
  // Wave 15 Prompt 02 — pure URL-policy evaluator. Deterministic, side-
  // effect-free, no I/O. Returns a structured allow/deny result and never
  // throws — `invalid-url` is the failure shape for malformed input.
  'evaluateExternalUrlPolicy',
];

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      listSourceFiles(full, acc);
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

describe('PCC shared models are mutation-free', () => {
  it('no top-level mutable bindings (let/var) and only allowlisted exported functions', () => {
    const offenders: Array<{ file: string; reason: string; line: string }> = [];

    for (const file of listSourceFiles(PCC_DIR)) {
      const contents = readFileSync(file, 'utf8');
      for (const rawLine of contents.split('\n')) {
        const line = rawLine.replace(/\/\/.*$/, '').trim();

        if (/^export\s+(let|var)\b/.test(line)) {
          offenders.push({ file, reason: 'mutable export', line });
        }
        if (/^(let|var)\b/.test(line)) {
          offenders.push({ file, reason: 'top-level mutable binding', line });
        }

        const fnMatch = /^export\s+function\s+([A-Za-z0-9_]+)/.exec(line);
        if (fnMatch && !ALLOWED_EXPORTED_FUNCTIONS.includes(fnMatch[1])) {
          offenders.push({
            file,
            reason: 'unallowlisted exported function',
            line,
          });
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
