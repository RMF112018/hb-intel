/**
 * ForecastVersioningService — domain service for Forecast Versioning
 * and Checklist operations.
 *
 * Composes the Financial repository facade methods for version lifecycle
 * and checklist gating into domain-level operations: load version ledger,
 * manage checklist items, evaluate confirmation gate, execute governed
 * version transitions.
 *
 * Wave 3D.1: fourth repository-backed Financial domain service.
 * Checklist grouping informed by Financial Forecast Summary & Checklist.xlsx;
 * governed by T03 contracts and Financial-LMG §2-§3.
 */

import type {
  IFinancialRepository,
  IFinancialVersionPort,
  IFinancialChecklistItemPort,
  IFinancialConfirmationGateResultPort,
  IFinancialModulePosture,
  FinancialOperationResult,
} from '@hbc/data-access';
import type { ForecastDerivationReason } from '../types/index.js';

// ── Service types ──────────────────────────────────────────────────────

export interface VersionLedgerLoadResult {
  readonly currentVersion: IFinancialVersionPort | null;
  readonly versionHistory: readonly IFinancialVersionPort[];
  readonly checklist: readonly IFinancialChecklistItemPort[];
  readonly gateResult: IFinancialConfirmationGateResultPort;
  readonly posture: IFinancialModulePosture;
  readonly isEditable: boolean;
  readonly canConfirm: boolean;
  readonly canDerive: boolean;
  readonly canDesignate: boolean;
}

export interface ChecklistGroupSummary {
  readonly group: string;
  readonly label: string;
  readonly items: readonly IFinancialChecklistItemPort[];
  readonly total: number;
  readonly completed: number;
  readonly requiredTotal: number;
  readonly requiredCompleted: number;
  readonly isGroupComplete: boolean;
}

export interface VersionTransitionResult {
  readonly success: boolean;
  readonly version: IFinancialVersionPort | null;
  readonly error: string | null;
}

/**
 * Worksheet-aligned checklist group labels.
 * Informed by Financial Forecast Summary & Checklist.xlsx checklist tab.
 */
const CHECKLIST_GROUP_LABELS: Record<string, string> = {
  RequiredDocuments: 'Required Documents',
  ProfitForecast: 'Profit Forecast',
  Schedule: 'Schedule',
  Additional: 'Additional Items',
};

const CHECKLIST_GROUP_ORDER: readonly string[] = [
  'RequiredDocuments', 'ProfitForecast', 'Schedule', 'Additional',
];

// ── Service ────────────────────────────────────────────────────────────

export class ForecastVersioningService {
  constructor(private readonly repo: IFinancialRepository) {}

  /**
   * Load the version ledger, current version, checklist, and gate posture.
   */
  async load(projectId: string, reportingPeriod: string): Promise<VersionLedgerLoadResult> {
    const [posture, currentVersion, versionHistory] = await Promise.all([
      this.repo.getModulePosture(projectId, reportingPeriod),
      this.repo.getCurrentWorkingVersion(projectId),
      this.repo.getVersionHistory(projectId),
    ]);

    const versionId = currentVersion?.forecastVersionId ?? posture.currentVersionId;
    const [checklist, gateResult] = await Promise.all([
      versionId ? this.repo.getChecklist(versionId) : Promise.resolve([]),
      versionId ? this.repo.evaluateConfirmationGate(versionId) : Promise.resolve({ canConfirm: false, blockers: ['No active version'] }),
    ]);

    const isWorking = posture.currentVersionState === 'Working';
    const isConfirmed = posture.currentVersionState === 'ConfirmedInternal';

    return {
      currentVersion,
      versionHistory,
      checklist,
      gateResult,
      posture,
      isEditable: isWorking,
      canConfirm: isWorking && gateResult.canConfirm,
      canDerive: isConfirmed || posture.currentVersionState === 'PublishedMonthly',
      canDesignate: isConfirmed && !posture.isReportCandidate,
    };
  }

  /**
   * Toggle a checklist item's completion state.
   */
  async toggleChecklistItem(
    forecastVersionId: string,
    itemId: string,
    completed: boolean,
    completedBy: string,
  ): Promise<FinancialOperationResult<IFinancialChecklistItemPort>> {
    return this.repo.toggleChecklistItem(forecastVersionId, itemId, completed, completedBy);
  }

  /**
   * Confirm the current Working version (Working → ConfirmedInternal).
   * Gate must pass for this to succeed.
   */
  async confirmVersion(
    forecastVersionId: string,
    confirmedBy: string,
  ): Promise<VersionTransitionResult> {
    const result = await this.repo.confirmVersion(forecastVersionId, confirmedBy);
    return {
      success: result.success,
      version: result.data,
      error: result.error,
    };
  }

  /**
   * Derive a new Working version from a Confirmed or Published version.
   */
  async deriveVersion(
    projectId: string,
    sourceVersionId: string,
    reason: ForecastDerivationReason,
    derivedBy: string,
  ): Promise<VersionTransitionResult> {
    const result = await this.repo.deriveWorkingVersion(projectId, sourceVersionId, reason, derivedBy);
    return {
      success: result.success,
      version: result.data,
      error: result.error,
    };
  }

  /**
   * Designate a ConfirmedInternal version as the report candidate.
   */
  async designateReportCandidate(
    forecastVersionId: string,
  ): Promise<FinancialOperationResult<{ designated: IFinancialVersionPort; cleared: IFinancialVersionPort | null }>> {
    return this.repo.designateReportCandidate(forecastVersionId);
  }

  /**
   * Group checklist items by worksheet-aligned categories.
   * Returns groups in the order they appear on the worksheet checklist tab.
   */
  groupChecklistByCategory(items: readonly IFinancialChecklistItemPort[]): readonly ChecklistGroupSummary[] {
    return CHECKLIST_GROUP_ORDER
      .map((group) => {
        const groupItems = items.filter((i) => i.group === group);
        const requiredItems = groupItems.filter((i) => i.required);
        return {
          group,
          label: CHECKLIST_GROUP_LABELS[group] ?? group,
          items: groupItems,
          total: groupItems.length,
          completed: groupItems.filter((i) => i.completed).length,
          requiredTotal: requiredItems.length,
          requiredCompleted: requiredItems.filter((i) => i.completed).length,
          isGroupComplete: requiredItems.every((i) => i.completed),
        };
      })
      .filter((g) => g.total > 0);
  }

  /**
   * Compute the overall checklist completion summary.
   */
  getChecklistSummary(items: readonly IFinancialChecklistItemPort[]): {
    total: number;
    completed: number;
    requiredTotal: number;
    requiredCompleted: number;
    allRequiredComplete: boolean;
  } {
    const required = items.filter((i) => i.required);
    return {
      total: items.length,
      completed: items.filter((i) => i.completed).length,
      requiredTotal: required.length,
      requiredCompleted: required.filter((i) => i.completed).length,
      allRequiredComplete: required.every((i) => i.completed),
    };
  }
}
