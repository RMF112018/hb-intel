/**
 * P3-E4-T02 identity resolution and budget import pipeline.
 * All functions are deterministic given the same inputs.
 */

import type {
  ExternalSourceSystem,
  IBudgetImportResult,
  IBudgetImportRow,
  IBudgetLineItem,
  IBudgetLineReconciliationCondition,
  IIdentityResolutionResult,
} from '../types/index.js';
import { computeAllDerivedFields, computeDefaultForecastToComplete, computeFallbackCompositeMatchKey } from '../computors/index.js';
import { parseCostTypeFromCsv, extractCostCodeFromCsvTier, validateBudgetImportBatch } from '../validation/index.js';

export const FINANCIAL_IMPORT_SCOPE = 'financial/import';

/**
 * Resolve the identity of an incoming import row against existing budget lines (T02 §2.3).
 * Returns matched (reuse canonical ID), new (caller assigns), or ambiguous (PM must resolve).
 */
export const resolveLineIdentity = (
  incoming: {
    readonly externalSourceSystem: ExternalSourceSystem;
    readonly externalSourceLineId: string | null;
    readonly fallbackCompositeMatchKey: string;
  },
  existingLines: readonly IBudgetLineItem[],
): IIdentityResolutionResult => {
  // Path 1: external source ID match (future Procore API path)
  if (incoming.externalSourceLineId !== null) {
    const match = existingLines.find(
      (line) =>
        line.externalSourceSystem === incoming.externalSourceSystem &&
        line.externalSourceLineId === incoming.externalSourceLineId,
    );
    if (match) {
      return { outcome: 'matched', canonicalBudgetLineId: match.canonicalBudgetLineId, candidateCanonicalLineIds: [] };
    }
    return { outcome: 'new', canonicalBudgetLineId: null, candidateCanonicalLineIds: [] };
  }

  // Path 2: fallback composite match key (current CSV path)
  const matches = existingLines.filter(
    (line) => line.fallbackCompositeMatchKey === incoming.fallbackCompositeMatchKey,
  );

  if (matches.length === 1) {
    return { outcome: 'matched', canonicalBudgetLineId: matches[0].canonicalBudgetLineId, candidateCanonicalLineIds: [] };
  }

  if (matches.length === 0) {
    return { outcome: 'new', canonicalBudgetLineId: null, candidateCanonicalLineIds: [] };
  }

  // Ambiguous: multiple existing lines share the same composite key
  return {
    outcome: 'ambiguous',
    canonicalBudgetLineId: null,
    candidateCanonicalLineIds: matches.map((m) => m.canonicalBudgetLineId),
  };
};

/** Create a reconciliation condition record for an ambiguous identity match (T02 §2.5). */
export const createReconciliationCondition = (
  projectId: string,
  importBatchId: string,
  fallbackKey: string,
  candidateCanonicalLineIds: readonly string[],
): IBudgetLineReconciliationCondition => ({
  conditionId: crypto.randomUUID(),
  projectId,
  importBatchId,
  importRowFallbackKey: fallbackKey,
  candidateCanonicalLineIds: [...candidateCanonicalLineIds],
  status: 'Pending',
  createdAt: new Date().toISOString(),
});

/** Parse a numeric string, returning 0 for empty/invalid values. */
const parseNumeric = (value: string | undefined): number => {
  if (!value || value.trim() === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/** Transform a raw CSV row into an IBudgetLineItem with all derived fields computed. */
export const transformCsvRowToBudgetLine = (
  csvRow: IBudgetImportRow,
  projectId: string,
  importBatchId: string,
  canonicalBudgetLineId: string,
  importedAt: string,
): IBudgetLineItem => {
  const costType = parseCostTypeFromCsv(csvRow.costType) ?? 'Other';
  const costCodeTier1 = extractCostCodeFromCsvTier(csvRow.costCodeTier1);

  const originalBudget = parseNumeric(csvRow.originalBudget);
  const budgetModifications = parseNumeric(csvRow.budgetModifications);
  const approvedCOs = parseNumeric(csvRow.approvedCOs);
  const pendingBudgetChanges = parseNumeric(csvRow.pendingBudgetChanges);
  const jobToDateActualCost = parseNumeric(csvRow.jobToDateActualCost);
  const committedCosts = parseNumeric(csvRow.committedCosts);
  const pendingCostChanges = parseNumeric(csvRow.pendingCostChanges);

  const fallbackCompositeMatchKey = computeFallbackCompositeMatchKey(
    costCodeTier1,
    costType,
    csvRow.budgetCode,
  );

  // Compute derived fields first to determine FTC default
  const baseFields = { originalBudget, budgetModifications, approvedCOs, pendingBudgetChanges, jobToDateActualCost, committedCosts, pendingCostChanges, forecastToComplete: 0 };
  const partialDerived = computeAllDerivedFields(baseFields);

  // Use CSV FTC if provided and valid, otherwise compute default
  const csvFtc = parseNumeric(csvRow.forecastToComplete);
  const forecastToComplete = csvFtc > 0 ? csvFtc : computeDefaultForecastToComplete(partialDerived.revisedBudget, partialDerived.costExposureToDate);

  // Recompute with final FTC
  const derived = computeAllDerivedFields({ ...baseFields, forecastToComplete });

  return {
    canonicalBudgetLineId,
    externalSourceSystem: 'procore',
    externalSourceLineId: null,
    fallbackCompositeMatchKey,
    budgetImportRowId: crypto.randomUUID(),
    projectId,
    importBatchId,
    importedAt,
    subJob: csvRow.subJob?.trim() || null,
    costCodeTier1,
    costCodeTier2: csvRow.costCodeTier2 ? extractCostCodeFromCsvTier(csvRow.costCodeTier2) : null,
    costCodeTier3: csvRow.costCodeTier3 ? extractCostCodeFromCsvTier(csvRow.costCodeTier3) : null,
    costType,
    budgetCode: csvRow.budgetCode.trim(),
    budgetCodeDescription: csvRow.budgetCodeDescription.trim(),
    originalBudget,
    budgetModifications,
    approvedCOs,
    revisedBudget: derived.revisedBudget,
    pendingBudgetChanges,
    projectedBudget: derived.projectedBudget,
    jobToDateActualCost,
    committedCosts,
    costExposureToDate: derived.costExposureToDate,
    pendingCostChanges,
    projectedCosts: derived.projectedCosts,
    forecastToComplete,
    estimatedCostAtCompletion: derived.estimatedCostAtCompletion,
    projectedOverUnder: derived.projectedOverUnder,
    lastEditedBy: null,
    lastEditedAt: null,
    priorForecastToComplete: null,
    notes: null,
  };
};

/**
 * Execute a full budget import: validate, resolve identities, transform rows (T02 §3.5).
 * Atomic: if any validation error occurs, no lines are produced.
 */
export const executeBudgetImport = (
  rows: readonly IBudgetImportRow[],
  existingLines: readonly IBudgetLineItem[],
  costCodeSet: ReadonlySet<string>,
  projectId: string,
): IBudgetImportResult => {
  const importBatchId = crypto.randomUUID();
  const importedAt = new Date().toISOString();

  // Step 1: Validate entire batch — atomic failure
  const validation = validateBudgetImportBatch(rows, costCodeSet);
  if (!validation.valid) {
    return {
      success: false,
      importBatchId,
      linesMatched: 0,
      linesCreated: 0,
      reconciliationConditionsCreated: 0,
      validationErrors: validation.errors,
      lines: [],
      reconciliationConditions: [],
    };
  }

  // Step 2: Process each row — resolve identity and transform
  const lines: IBudgetLineItem[] = [];
  const conditions: IBudgetLineReconciliationCondition[] = [];
  let linesMatched = 0;
  let linesCreated = 0;

  for (const row of rows) {
    const costType = parseCostTypeFromCsv(row.costType) ?? 'Other';
    const costCodeTier1 = extractCostCodeFromCsvTier(row.costCodeTier1);
    const fallbackKey = computeFallbackCompositeMatchKey(costCodeTier1, costType, row.budgetCode);

    const identity = resolveLineIdentity(
      { externalSourceSystem: 'procore', externalSourceLineId: null, fallbackCompositeMatchKey: fallbackKey },
      existingLines,
    );

    switch (identity.outcome) {
      case 'matched': {
        const line = transformCsvRowToBudgetLine(row, projectId, importBatchId, identity.canonicalBudgetLineId!, importedAt);
        lines.push(line);
        linesMatched++;
        break;
      }
      case 'new': {
        const newId = crypto.randomUUID();
        const line = transformCsvRowToBudgetLine(row, projectId, importBatchId, newId, importedAt);
        lines.push(line);
        linesCreated++;
        break;
      }
      case 'ambiguous': {
        const condition = createReconciliationCondition(projectId, importBatchId, fallbackKey, identity.candidateCanonicalLineIds);
        conditions.push(condition);
        break;
      }
    }
  }

  return {
    success: true,
    importBatchId,
    linesMatched,
    linesCreated,
    reconciliationConditionsCreated: conditions.length,
    validationErrors: [],
    lines,
    reconciliationConditions: conditions,
  };
};
