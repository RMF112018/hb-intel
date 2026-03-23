import {
  SCHEDULE_ACCESS_ACTIONS,
} from '../constants/index.js';
import type {
  IBaselineApprovalValidation,
  IBaselineRecord,
  ICalendarDivergenceResult,
  ICalendarRule,
  ICanonicalScheduleSource,
  ICanonicalSourceValidation,
  IImportValidationResult,
  IImportValidationRule,
  IImportedActivitySnapshot,
  IScheduleAccessQuery,
  IScheduleAccessResult,
  IVersionActivationValidation,
  IScheduleVersionRecord,
  ScheduleAccessAction,
} from '../types/index.js';

/**
 * P3-E5-T01 governance functions.
 * Pure, deterministic, no external dependencies beyond types.
 */

// ── Layer Access Resolution ──────────────────────────────────────────

/**
 * Resolve which actions a role may perform on a given schedule layer.
 * Maps 6 roles × 4 layers per the P3-E5 operating model and P3-E2 §4.
 */
export const resolveScheduleLayerAccess = (
  query: IScheduleAccessQuery,
): IScheduleAccessResult => {
  const allowed: ScheduleAccessAction[] = [];
  const denied: ScheduleAccessAction[] = [];
  let hidden = false;

  const { role, layer } = query;

  switch (role) {
    case 'PM':
      switch (layer) {
        case 'master-schedule':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'operating':
          allowed.push('read', 'write', 'publish');
          denied.push('approve', 'configure');
          break;
        case 'field-execution':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'published-forecast':
          allowed.push('read', 'publish');
          denied.push('write', 'approve', 'configure');
          break;
      }
      break;

    case 'PE':
      switch (layer) {
        case 'master-schedule':
          allowed.push('read', 'approve');
          denied.push('write', 'configure', 'publish');
          break;
        case 'operating':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'field-execution':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'published-forecast':
          allowed.push('read', 'approve');
          denied.push('write', 'configure', 'publish');
          break;
      }
      break;

    case 'Scheduler':
      switch (layer) {
        case 'master-schedule':
          allowed.push('read', 'write');
          denied.push('approve', 'configure', 'publish');
          break;
        case 'operating':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'field-execution':
          hidden = true;
          break;
        case 'published-forecast':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
      }
      break;

    case 'Superintendent':
      switch (layer) {
        case 'master-schedule':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'operating':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
        case 'field-execution':
          allowed.push('read', 'write');
          denied.push('approve', 'configure', 'publish');
          break;
        case 'published-forecast':
          allowed.push('read');
          denied.push('write', 'approve', 'configure', 'publish');
          break;
      }
      break;

    case 'Foreman':
      switch (layer) {
        case 'master-schedule':
          hidden = true;
          break;
        case 'operating':
          hidden = true;
          break;
        case 'field-execution':
          allowed.push('read', 'write');
          denied.push('approve', 'configure', 'publish');
          break;
        case 'published-forecast':
          hidden = true;
          break;
      }
      break;

    case 'MOE':
      switch (layer) {
        case 'master-schedule':
          allowed.push('read', 'configure');
          denied.push('write', 'approve', 'publish');
          break;
        case 'operating':
          allowed.push('read', 'configure');
          denied.push('write', 'approve', 'publish');
          break;
        case 'field-execution':
          allowed.push('read', 'configure');
          denied.push('write', 'approve', 'publish');
          break;
        case 'published-forecast':
          allowed.push('read', 'configure');
          denied.push('write', 'approve', 'publish');
          break;
      }
      break;
  }

  if (hidden) {
    return {
      allowed: [],
      denied: [...SCHEDULE_ACCESS_ACTIONS],
      hidden: true,
    };
  }

  return { allowed, denied, hidden };
};

// ── Canonical Source Validation (§1.1) ────────────────────────────────

/**
 * Validate that at most one source per project carries isCanonical = true.
 */
export const validateCanonicalSourceDesignation = (
  sources: ReadonlyArray<ICanonicalScheduleSource>,
): ICanonicalSourceValidation => {
  const violations: string[] = [];

  const activeSources = sources.filter((s) => s.deregisteredAt === null);
  const canonicalSources = activeSources.filter((s) => s.isCanonical);

  if (canonicalSources.length > 1) {
    violations.push(
      `Multiple canonical sources found: ${canonicalSources.map((s) => s.sourceId).join(', ')}. Only one canonical source per project is permitted.`,
    );
  }

  return {
    valid: violations.length === 0,
    violations,
  };
};

// ── Version Activation Validation (§1.2) ─────────────────────────────

/**
 * Validate whether a version can be activated.
 * Enforces: only one Active per source; parentVersionId must be set.
 */
export const validateVersionActivation = (
  candidate: IScheduleVersionRecord,
  existingVersions: ReadonlyArray<IScheduleVersionRecord>,
): IVersionActivationValidation => {
  const blockers: string[] = [];

  if (candidate.status !== 'Parsed') {
    blockers.push(
      `Version ${candidate.versionId} has status '${candidate.status}'; only 'Parsed' versions can be activated.`,
    );
  }

  const activeForSource = existingVersions.filter(
    (v) => v.sourceId === candidate.sourceId && v.status === 'Active',
  );

  if (activeForSource.length > 0 && candidate.parentVersionId === null) {
    blockers.push(
      `Version ${candidate.versionId} must set parentVersionId to the current active version (${activeForSource[0].versionId}) to preserve lineage chain.`,
    );
  }

  return {
    canActivate: blockers.length === 0,
    blockers,
  };
};

// ── Baseline Approval Validation (§1.3) ──────────────────────────────

/**
 * Validate whether a baseline can be approved.
 * Enforces: PE approval required; only one isPrimary per project; causation code for supersession.
 */
export const validateBaselineApproval = (
  candidate: IBaselineRecord,
  existingBaselines: ReadonlyArray<IBaselineRecord>,
): IBaselineApprovalValidation => {
  const blockers: string[] = [];

  if (!candidate.approvedBy) {
    blockers.push('Baseline requires PE approval (approvedBy must be set).');
  }

  if (!candidate.approvalBasis) {
    blockers.push('Baseline requires an approval basis (e.g., "NTP issued", "CO-14 approved").');
  }

  if (candidate.isPrimary) {
    const existingPrimary = existingBaselines.find(
      (b) => b.isPrimary && b.projectId === candidate.projectId && b.supersededAt === null,
    );

    if (existingPrimary) {
      if (!candidate.causationCode) {
        blockers.push(
          `Superseding existing primary baseline ${existingPrimary.baselineId} requires a causation code.`,
        );
      }
    }
  }

  return {
    canApprove: blockers.length === 0,
    blockers,
  };
};

// ── Import Validation (§1.6) ─────────────────────────────────────────

/**
 * Run import validation rules against a parsed activity snapshot.
 * Returns results for each rule with pass/fail and messaging.
 */
export const runImportValidation = (
  snapshot: Partial<IImportedActivitySnapshot>,
  rules: ReadonlyArray<IImportValidationRule>,
): ReadonlyArray<IImportValidationResult> => {
  return rules.map((rule): IImportValidationResult => {
    switch (rule.check) {
      case 'File format recognized':
        return {
          passed: true,
          rule,
          message: 'File format check delegated to parser layer',
        };
      case 'Required columns present':
        return {
          passed: true,
          rule,
          message: 'Column presence check delegated to parser layer',
        };
      case 'Activity code unique within version':
        return {
          passed: snapshot.sourceActivityCode != null && snapshot.sourceActivityCode.length > 0,
          rule,
          message: snapshot.sourceActivityCode ? 'Activity code present' : 'Missing activity code',
        };
      case 'Data date present and valid':
        return {
          passed: true,
          rule,
          message: 'Data date check delegated to version-level validation',
        };
      case 'Baseline dates present': {
        const hasBaseline = snapshot.baselineStartDate != null && snapshot.baselineFinishDate != null;
        return {
          passed: true,
          rule,
          message: hasBaseline
            ? 'Baseline dates present'
            : 'Baseline dates missing; fields set to null (warning)',
        };
      }
      case 'Target dates valid': {
        const hasTarget = snapshot.targetStartDate != null && snapshot.targetFinishDate != null;
        return {
          passed: hasTarget,
          rule,
          message: hasTarget ? 'Target dates present' : 'Missing required target dates',
        };
      }
      case 'Float values present': {
        const hasFloat = snapshot.totalFloatHrs != null;
        return {
          passed: true,
          rule,
          message: hasFloat ? 'Float values present' : 'Float values missing; set to null (warning)',
        };
      }
      case 'Duration >= 0':
        return {
          passed: snapshot.targetDurationHrs == null || snapshot.targetDurationHrs >= 0,
          rule,
          message:
            snapshot.targetDurationHrs != null && snapshot.targetDurationHrs < 0
              ? 'Negative duration detected'
              : 'Duration valid',
        };
      case 'Activity code matches prior versions':
        return {
          passed: true,
          rule,
          message: 'Continuity link matching delegated to post-parse reconciliation',
        };
      case 'Constraint dates within project window':
        return {
          passed: true,
          rule,
          message: 'Constraint date window check delegated to project-level validation',
        };
      default:
        return {
          passed: false,
          rule,
          message: `Unknown validation check: ${rule.check}`,
        };
    }
  });
};

// ── External Activity Key Derivation (§1.5) ──────────────────────────

/**
 * Derive the durable external activity key from sourceId and activity code.
 * Format: `{sourceId}::{sourceActivityCode}` — immutable once assigned.
 */
export const deriveExternalActivityKey = (
  sourceId: string,
  sourceActivityCode: string,
): string => {
  if (!sourceId || !sourceActivityCode) {
    throw new Error('Both sourceId and sourceActivityCode are required to derive externalActivityKey.');
  }
  return `${sourceId}::${sourceActivityCode}`;
};

// ── Calendar Assumption Divergence (§17) ─────────────────────────────

/**
 * Detect divergence between source and operating calendar assumptions (§17 business rule).
 * When calendars differ, the system must flag CalendarAssumptionDivergence warning.
 */
export const detectCalendarAssumptionDivergence = (
  sourceCalendar: ICalendarRule,
  operatingCalendar: ICalendarRule,
): ICalendarDivergenceResult => {
  const deltas: string[] = [];

  if (sourceCalendar.hoursPerDay !== operatingCalendar.hoursPerDay) {
    deltas.push(
      `Hours per day: source=${sourceCalendar.hoursPerDay}, operating=${operatingCalendar.hoursPerDay}`,
    );
  }

  const sourceWorkDays = [...sourceCalendar.workDays].sort();
  const operatingWorkDays = [...operatingCalendar.workDays].sort();
  if (
    sourceWorkDays.length !== operatingWorkDays.length ||
    sourceWorkDays.some((d, i) => d !== operatingWorkDays[i])
  ) {
    deltas.push(
      `Work days: source=[${sourceWorkDays.join(',')}], operating=[${operatingWorkDays.join(',')}]`,
    );
  }

  const sourceExceptionDates = new Set(sourceCalendar.exceptions.map((e) => e.date));
  const operatingExceptionDates = new Set(operatingCalendar.exceptions.map((e) => e.date));

  const missingInOperating = [...sourceExceptionDates].filter((d) => !operatingExceptionDates.has(d));
  const extraInOperating = [...operatingExceptionDates].filter((d) => !sourceExceptionDates.has(d));

  if (missingInOperating.length > 0) {
    deltas.push(`Source exceptions not in operating: ${missingInOperating.join(', ')}`);
  }
  if (extraInOperating.length > 0) {
    deltas.push(`Operating exceptions not in source: ${extraInOperating.join(', ')}`);
  }

  return {
    diverges: deltas.length > 0,
    deltas,
  };
};
