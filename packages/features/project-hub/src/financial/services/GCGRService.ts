/**
 * GCGRService — domain service for GC/GR Forecast operations.
 *
 * Composes the Financial repository facade methods for GC/GR
 * into domain-level operations: load, edit lines, compute rollup,
 * evaluate posture, and expose the Forecast Summary rollup seam.
 *
 * Wave 3B.1: second repository-backed Financial domain service.
 * Division/category grouping informed by GC-GR Forecast.xlsm
 * worksheet structure; governed by T04 contracts.
 */

import type {
  IFinancialRepository,
  IFinancialGCGRLinePort,
  IFinancialGCGRRollupPort,
  IFinancialModulePosture,
  FinancialOperationResult,
} from '@hbc/data-access';
import type { GCGRCategory, GCGREditableField } from '../types/index.js';
import {
  computeGCGRLineVariance,
  computeGCGRLineVariancePercent,
} from '../computors/index.js';

// ── Service types ──────────────────────────────────────────────────────

export interface GCGRLoadResult {
  readonly lines: readonly IFinancialGCGRLinePort[];
  readonly rollup: IFinancialGCGRRollupPort;
  readonly posture: IFinancialModulePosture;
  readonly isEditable: boolean;
  readonly isStale: boolean;
  readonly blockers: readonly string[];
}

export interface GCGREditResult {
  readonly success: boolean;
  readonly line: IFinancialGCGRLinePort | null;
  readonly error: string | null;
  readonly updatedVariance: number;
  readonly rollupAffected: boolean;
}

/**
 * Worksheet-aligned division groups (informed by GC-GR Forecast.xlsm
 * row hierarchy).
 *
 * The worksheet organizes GC/GR lines into:
 * - General Conditions (GC): project management, temp facilities, safety, etc.
 * - General Requirements (GR): cleaning, equipment, tools, etc.
 * - Other: miscellaneous items not in GC or GR
 *
 * Each division within a group has budget (imported), forecast (PM-editable),
 * adjustment, and variance (derived) columns.
 */
export interface GCGRDivisionGroup {
  readonly category: GCGRCategory;
  readonly label: string;
  readonly lines: readonly IFinancialGCGRLinePort[];
  readonly subtotalBudget: number;
  readonly subtotalForecast: number;
  readonly subtotalVariance: number;
}

/**
 * GC/GR line field descriptor for the editing surface.
 */
export interface GCGRLineFieldDescriptor {
  readonly field: GCGREditableField;
  readonly label: string;
  readonly type: 'currency' | 'text';
}

export const GCGR_EDITABLE_FIELDS: readonly GCGRLineFieldDescriptor[] = [
  { field: 'forecastAmount', label: 'Forecast Amount', type: 'currency' },
  { field: 'adjustmentAmount', label: 'Adjustment', type: 'currency' },
  { field: 'adjustmentNotes', label: 'Adjustment Notes', type: 'text' },
];

// ── Category labels (worksheet-aligned) ────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  GeneralConditions: 'General Conditions (GC)',
  GeneralRequirements: 'General Requirements (GR)',
  Other: 'Other',
};

const CATEGORY_ORDER: readonly string[] = ['GeneralConditions', 'GeneralRequirements', 'Other'];

// ── Service ────────────────────────────────────────────────────────────

export class GCGRService {
  constructor(private readonly repo: IFinancialRepository) {}

  /**
   * Load the active GC/GR state for a project + reporting period.
   * Returns lines grouped by category, rollup totals, and posture.
   */
  async load(projectId: string, reportingPeriod: string): Promise<GCGRLoadResult> {
    const [posture, version] = await Promise.all([
      this.repo.getModulePosture(projectId, reportingPeriod),
      this.repo.getCurrentWorkingVersion(projectId),
    ]);

    const versionId = version?.forecastVersionId ?? posture.currentVersionId;
    const [lines, rollup] = await Promise.all([
      versionId ? this.repo.getGCGRLines(versionId) : Promise.resolve([]),
      versionId ? this.repo.getGCGRSummaryRollup(versionId) : Promise.resolve({ totalBudget: 0, totalForecast: 0, totalVariance: 0, lineCount: 0, overBudgetLineCount: 0 }),
    ]);

    const isEditable = posture.currentVersionState === 'Working';
    const isStale = posture.staleBudgetLineCount > 0;
    const blockers: string[] = [];
    if (isStale) blockers.push(`${posture.staleBudgetLineCount} unresolved reconciliation conditions`);

    return { lines, rollup, posture, isEditable, isStale, blockers };
  }

  /**
   * Edit a GC/GR line's forecast or adjustment values on the Working version.
   */
  async editLine(
    forecastVersionId: string,
    lineId: string,
    forecastAmount: number,
    adjustmentAmount: number,
    adjustmentNotes: string,
    editedBy: string,
  ): Promise<GCGREditResult> {
    const result = await this.repo.updateGCGRLine(
      forecastVersionId, lineId, forecastAmount, adjustmentAmount, adjustmentNotes, editedBy,
    );

    if (!result.success || !result.data) {
      return { success: false, line: null, error: result.error, updatedVariance: 0, rollupAffected: false };
    }

    return {
      success: true,
      line: result.data,
      error: null,
      updatedVariance: result.data.varianceAmount,
      rollupAffected: true, // Any line edit affects the rollup
    };
  }

  /**
   * Get lines grouped by worksheet-aligned division categories.
   * Returns GC, GR, and Other groups with subtotals.
   */
  groupByCategory(lines: readonly IFinancialGCGRLinePort[]): readonly GCGRDivisionGroup[] {
    return CATEGORY_ORDER
      .map((cat) => {
        // Port-level lines don't have category, so group by division code convention:
        // Divisions 01-09: GC, 10-19: GR, 20+: Other
        const groupLines = lines.filter((l) => {
          const code = parseInt(l.divisionCode, 10);
          if (cat === 'GeneralConditions') return code >= 1 && code <= 9;
          if (cat === 'GeneralRequirements') return code >= 10 && code <= 19;
          return code >= 20;
        });

        return {
          category: cat as GCGRCategory,
          label: CATEGORY_LABELS[cat] ?? cat,
          lines: groupLines,
          subtotalBudget: groupLines.reduce((sum, l) => sum + l.budgetAmount, 0),
          subtotalForecast: groupLines.reduce((sum, l) => sum + l.forecastAmount, 0),
          subtotalVariance: groupLines.reduce((sum, l) => sum + l.varianceAmount, 0),
        };
      })
      .filter((g) => g.lines.length > 0);
  }

  /**
   * Get the GC/GR total variance for Forecast Summary rollup.
   * This is the narrow seam that Forecast Summary consumes.
   */
  async getGCGRTotalVariance(forecastVersionId: string): Promise<number> {
    const rollup = await this.repo.getGCGRSummaryRollup(forecastVersionId);
    return rollup.totalVariance;
  }

  /**
   * Compute local variance for a line (used before persisting).
   */
  computeLineVariance(forecastAmount: number, budgetAmount: number): {
    varianceAmount: number;
    variancePercent: number;
    isOverBudget: boolean;
  } {
    const varianceAmount = computeGCGRLineVariance(forecastAmount, budgetAmount);
    const variancePercent = computeGCGRLineVariancePercent(varianceAmount, budgetAmount);
    return {
      varianceAmount,
      variancePercent,
      isOverBudget: varianceAmount > 0,
    };
  }
}
