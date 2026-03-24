/**
 * P3-E7-T04 Inspection, Deficiency, and Compliance Control TypeScript contracts.
 */

import type { DeficiencyResolutionStatus, DeficiencySeverity, ExpirationRiskTier, PermitHealthTier, PermitType, RequiredInspectionResult } from '../records/enums.js';

// ── Checkpoint Template Library (§1.2) ──────────────────────────────

export interface ICheckpointTemplate {
  readonly templateId: string;
  readonly permitType: PermitType;
  readonly checkpointName: string;
  readonly codeReference: string | null;
  readonly sequence: number;
  readonly isBlockingCloseout: boolean;
  readonly blockedByCheckpointNames: readonly string[];
  readonly jurisdictionName: string | null;
  readonly notes: string | null;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Auto-Generation Result (§1.4) ───────────────────────────────────

export interface ICheckpointAutoGenerationResult {
  readonly generated: number;
  readonly skipped: number;
  readonly templateIds: readonly string[];
}

// ── Inspection Visit Validation (§2.3) ──────────────────────────────

export interface IInspectionVisitValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ── Deficiency Health Impact (§3.3) ─────────────────────────────────

export interface IDeficiencyHealthImpactRule {
  readonly severity: DeficiencySeverity;
  readonly resolutionStatus: DeficiencyResolutionStatus;
  readonly healthTierImpact: PermitHealthTier | null;
  readonly condition: string | null;
}

// ── Deficiency Work Queue Rules (§3.4) ──────────────────────────────

export interface IDeficiencyWorkQueueRule {
  readonly condition: string;
  readonly workQueueItem: string;
  readonly priority: string;
  readonly assignee: string;
}

// ── Compliance Close-Out Gate (§6) ──────────────────────────────────

export interface IComplianceCloseoutGateResult {
  readonly canClose: boolean;
  readonly unmetConditions: readonly string[];
}

// ── Template Import Validation (§5.2) ───────────────────────────────

export interface ITemplateImportRowValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly rowNumber: number;
}

export interface ITemplateImportResult {
  readonly valid: boolean;
  readonly rowResults: readonly ITemplateImportRowValidation[];
  readonly totalRows: number;
  readonly validRows: number;
  readonly invalidRows: number;
}

// ── Template Import Row (§5.1) ──────────────────────────────────────

export interface ITemplateImportRow {
  readonly inspection: string;
  readonly code: string | null;
  readonly dateCalledIn: string | null;
  readonly result: RequiredInspectionResult;
  readonly comment: string | null;
  readonly verifiedOnline: boolean;
}
