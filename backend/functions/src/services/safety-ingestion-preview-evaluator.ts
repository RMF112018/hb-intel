import {
  PARSER_CONTRACT_VERSION_ACCEPTED,
  PARSER_TEMPLATE_MARKER_ACCEPTED,
} from '../../../../packages/features/safety/src/domain/templateContract.js';
import type {
  DuplicateSupersessionPreview,
  InspectionMetadata,
  MetadataAuthority,
  ParsedInspection,
  ParserValueSource,
  PreviewDiagnostic,
  ProjectResolutionPreview,
  ReportingPeriodPreview,
  SafetyIngestionPreviewResult,
  TemplateCompatibilityStatus,
  UploadContext,
} from '../../../../packages/features/safety/src/domain/types.js';
import { classifyDuplicateRisk } from '../../../../packages/features/safety/src/ingestion/runIngestionPipeline.js';
import { isDateInRange } from '../../../../packages/features/safety/src/ingestion/weekRangeForDate.js';
import { resolveContractMarkers } from '../../../../packages/features/safety/src/parser/contractWorkbookAccess.js';
import { parseChecklist } from '../../../../packages/features/safety/src/parser/parseChecklist.js';
import { validateTemplate } from '../../../../packages/features/safety/src/parser/validateTemplate.js';
import {
  computeChecksum,
  readWorkbookFromArrayBuffer,
} from '../../../../packages/features/safety/src/parser/xlsxWorkbookView.js';
import { derivePreviewDiagnosticSummary } from './safety-ingestion-failure-classifier.js';
import { SafetyIngestionGraphRepository } from './safety-ingestion-graph-repository.js';

export interface ISafetyIngestionPreviewRequest {
  readonly fileName: string;
  readonly fileBytes: ArrayBuffer;
  readonly context: UploadContext;
}

export async function evaluateSafetyIngestionPreview(
  repository: SafetyIngestionGraphRepository,
  input: ISafetyIngestionPreviewRequest,
): Promise<SafetyIngestionPreviewResult> {
  const warnings: PreviewDiagnostic[] = [];
  const blockingErrors: PreviewDiagnostic[] = [];
  let markersPresent = false;

  let parsed: ParsedInspection | undefined;
  let templateWarnings: ReadonlyArray<string> = [];
  let templateValidationPassed = false;
  let templateStatus: TemplateCompatibilityStatus = {
    templateVersion: null,
    parserContractVersion: null,
    valid: false,
  };

  try {
    const view = readWorkbookFromArrayBuffer(input.fileBytes);
    const markers = resolveContractMarkers(view);
    markersPresent = markers.markersPresent;
    templateStatus = buildTemplateStatus(markers);

    try {
      const validated = validateTemplate(view);
      templateValidationPassed = true;
      templateWarnings = validated.warnings;
    } catch (error) {
      blockingErrors.push({
        code: 'TEMPLATE_VALIDATION_FAILED',
        message: error instanceof Error ? error.message : 'Template validation failed.',
        severity: 'error',
      });
    }

    for (const warning of templateWarnings) {
      warnings.push({
        code: 'TEMPLATE_WARNING',
        message: warning,
        severity: 'warning',
      });
    }

    try {
      parsed = parseChecklist(view);
    } catch (error) {
      blockingErrors.push({
        code: 'PARSE_FAILED',
        message: error instanceof Error ? error.message : 'Workbook parse failed.',
        severity: 'error',
      });
    }
  } catch (error) {
    const readFailure = {
      commitReadiness: false,
      template: templateStatus,
      projectResolution: {
        resolved: false,
        classification: 'unresolved' as const,
      },
      warnings,
      blockingErrors: blockingErrors.concat([
        {
          code: 'WORKBOOK_READ_FAILED',
          message: error instanceof Error ? error.message : 'Workbook could not be read.',
          severity: 'error' as const,
        },
      ]),
    };
    return {
      ...readFailure,
      diagnosticSummary: derivePreviewDiagnosticSummary(readFailure),
    };
  }

  templateStatus = {
    ...templateStatus,
    valid: templateStatus.valid && templateValidationPassed,
  };

  if (!templateStatus.valid) {
    blockingErrors.push({
      code: 'TEMPLATE_INCOMPATIBLE',
      message: 'Template identity or parser contract compatibility check failed.',
      severity: 'error',
    });
  }

  if (!parsed) {
    const parseFailure = {
      commitReadiness: false,
      template: templateStatus,
      projectResolution: {
        resolved: false,
        classification: 'unresolved' as const,
      },
      warnings,
      blockingErrors,
    };
    return {
      ...parseFailure,
      diagnosticSummary: derivePreviewDiagnosticSummary(parseFailure),
    };
  }

  // Prompt 02 closure: parser-derived values are authoritative when the
  // parser resolved them from ParserMeta or a named range. Operator-entered
  // context values are compared against the parser value and surfaced as
  // advisory warnings when they disagree, but they do not displace parser
  // authority. When the parser source is `legacy` or `none` (markerless
  // template or unparseable field), the intake context may be used as the
  // authority — this preserves support for genuinely legacy workbooks.
  const dateAuthority = resolveFieldAuthority({
    parsedValue: parsed.metadata.inspectionDate,
    parserSource: parsed.metadata.sources.inspectionDate,
    contextValue: input.context.inspectionDate,
    markersPresent,
  });
  const inspectionNumberAuthority = resolveFieldAuthority({
    parsedValue: parsed.metadata.inspectionNumber,
    parserSource: parsed.metadata.sources.inspectionNumber,
    contextValue: input.context.inspectionNumber,
    markersPresent,
  });
  const authoritativeInspectionDate = dateAuthority.value;
  const authoritativeInspectionNumber = inspectionNumberAuthority.value;

  if (dateAuthority.contextMismatch) {
    warnings.push({
      code: 'INSPECTION_DATE_CONTEXT_MISMATCH',
      message:
        `Operator-entered inspection date ${JSON.stringify(input.context.inspectionDate ?? '')}` +
        ` differs from workbook-parsed value ${JSON.stringify(parsed.metadata.inspectionDate)}` +
        ` (source: ${parsed.metadata.sources.inspectionDate}); parser value retained.`,
      severity: 'warning',
    });
  }
  if (inspectionNumberAuthority.contextMismatch) {
    warnings.push({
      code: 'INSPECTION_NUMBER_CONTEXT_MISMATCH',
      message:
        `Operator-entered inspection number ${JSON.stringify(input.context.inspectionNumber ?? '')}` +
        ` differs from workbook-parsed value ${JSON.stringify(parsed.metadata.inspectionNumber)}` +
        ` (source: ${parsed.metadata.sources.inspectionNumber}); parser value retained.`,
      severity: 'warning',
    });
  }

  const metadataAuthority: MetadataAuthority = buildMetadataAuthority(
    parsed.metadata,
    dateAuthority.usedContext,
    inspectionNumberAuthority.usedContext,
  );
  for (const violation of buildParserAuthorityViolations(parsed, markersPresent)) {
    blockingErrors.push(violation);
  }

  const checksum = await computeChecksum(input.fileBytes);

  let reportingPeriod: ReportingPeriodPreview | undefined;
  const period = await repository.getReportingPeriod(
    input.context.reportingPeriodId,
    input.context.reportingPeriodSpItemId,
  );
  if (!period) {
    blockingErrors.push({
      code: 'REPORTING_PERIOD_NOT_FOUND',
      message: `Reporting period ${input.context.reportingPeriodId} was not found.`,
      severity: 'error',
    });
    reportingPeriod = {
      id: input.context.reportingPeriodId,
      spItemId: input.context.reportingPeriodSpItemId,
      title: '',
      weekStartDate: '',
      weekEndDate: '',
      resolved: false,
      dateInRange: false,
    };
  } else {
    const inRange = Boolean(
      authoritativeInspectionDate &&
      isDateInRange(authoritativeInspectionDate, {
        weekStartDate: period.weekStartDate,
        weekEndDate: period.weekEndDate,
      }),
    );
    reportingPeriod = {
      id: period.id,
      spItemId: period.spItemId,
      title: period.title,
      weekStartDate: period.weekStartDate,
      weekEndDate: period.weekEndDate,
      resolved: true,
      dateInRange: inRange,
    };
    if (!inRange) {
      blockingErrors.push({
        code: 'REPORTING_PERIOD_MISMATCH',
        message:
          `Inspection date ${authoritativeInspectionDate || '(empty)'} is outside selected reporting period ${period.weekStartDate} to ${period.weekEndDate}.`,
        severity: 'error',
      });
    }
  }

  const resolution = await repository.resolveProjectForPreview({
    context: input.context,
    projectSiteText: parsed.metadata.projectSiteText,
    projectNumberHint: parsed.metadata.projectNumberHint,
  });

  const projectResolution: ProjectResolutionPreview = resolution
    ? {
        resolved: true,
        classification: resolution.classification,
        projectNumber: resolution.projectNumber,
        projectNameSnapshot: resolution.projectNameSnapshot,
        projectLookupId: resolution.projectLookupId,
        legacyRegistryItemId: resolution.legacyRegistryItemId,
      }
    : {
        resolved: false,
        classification: 'unresolved',
      };

  if (!resolution) {
    blockingErrors.push({
      code: 'PROJECT_UNRESOLVED',
      message: `Could not resolve project from "${parsed.metadata.projectSiteText}".`,
      severity: 'error',
    });
  }

  let duplicateRisk: DuplicateSupersessionPreview | undefined;
  if (resolution && reportingPeriod?.resolved) {
    const prior = await repository.findInspectionsForProjectWeek({
      projectNumber: resolution.projectNumber,
      reportingPeriodId: reportingPeriod.id,
    });
    const duplicate = classifyDuplicateRisk(
      prior,
      authoritativeInspectionDate,
      authoritativeInspectionNumber,
      checksum,
    );
    const matched = duplicate.matchedId
      ? prior.find((item) => item.id === duplicate.matchedId)
      : undefined;

    duplicateRisk = {
      confidence: duplicate.confidence,
      matchedInspectionEventId: duplicate.matchedId,
      matchedInspectionStatus: matched?.ingestionStatus,
      supersessionRisk:
        duplicate.confidence === 'high-confidence-duplicate' &&
        matched?.ingestionStatus !== 'superseded',
    };

    if (duplicate.confidence === 'near-duplicate') {
      warnings.push({
        code: 'DUPLICATE_NEAR_MATCH',
        message: `Near-duplicate inspection detected (${duplicate.matchedId}).`,
        severity: 'warning',
      });
    }

    if (duplicateRisk.supersessionRisk) {
      blockingErrors.push({
        code: 'DUPLICATE_SUPERSESSION_RISK',
        message: `High-confidence duplicate inspection detected (${duplicate.matchedId}).`,
        severity: 'error',
      });
    }
  }

  const finalResult = {
    commitReadiness: blockingErrors.length === 0,
    template: templateStatus,
    metadata: parsed.metadata,
    reportingPeriod,
    projectResolution,
    duplicateRisk,
    normalizedKeyFindingsPreview: parsed.metadata.keyFindingsFreeText,
    warnings,
    blockingErrors,
    metadataAuthority,
  };
  return {
    ...finalResult,
    diagnosticSummary: derivePreviewDiagnosticSummary(finalResult),
  };
}

interface FieldAuthorityInput {
  readonly parsedValue: string;
  readonly parserSource: ParserValueSource;
  readonly contextValue: string | undefined;
  readonly markersPresent: boolean;
}

interface FieldAuthorityResult {
  readonly value: string;
  readonly usedContext: boolean;
  readonly contextMismatch: boolean;
}

/**
 * Prompt 02 closure: decides the authoritative value for a parser-critical
 * field and reports whether the operator-entered context diverged from the
 * parser value.
 *
 * Governed authority rule:
 *   - `parser-meta` | `named-range` (markered template): parser wins. The
 *     context is advisory; a mismatch warning is emitted when it was
 *     supplied and differs from the parser value. Context cannot displace
 *     parser authority on markered templates.
 *   - `legacy` | `none` (markerless / no-marker template): no parser
 *     authority exists to protect. Preserves the pre-existing G-03 rule
 *     that operator-entered intake values authoritatively drive list-field
 *     writes when supplied. No mismatch warning — the G-03 mismatch
 *     advisory (`metadataMismatch`) carries any divergence separately.
 */
function resolveFieldAuthority(input: FieldAuthorityInput): FieldAuthorityResult {
  const trimmedContext = (input.contextValue ?? '').trim();
  const hasContext = trimmedContext.length > 0;

  if (input.markersPresent) {
    const parserAuthoritative =
      input.parserSource === 'parser-meta' || input.parserSource === 'named-range';
    const mismatch = parserAuthoritative && hasContext && trimmedContext !== input.parsedValue;
    return { value: input.parsedValue, usedContext: false, contextMismatch: mismatch };
  }

  if (input.parserSource === 'parser-meta' || input.parserSource === 'named-range') {
    const mismatch = hasContext && trimmedContext !== input.parsedValue;
    return { value: input.parsedValue, usedContext: false, contextMismatch: mismatch };
  }

  if (hasContext) {
    return { value: trimmedContext, usedContext: true, contextMismatch: false };
  }
  return { value: input.parsedValue, usedContext: false, contextMismatch: false };
}

function buildParserAuthorityViolations(
  parsed: ParsedInspection,
  markersPresent: boolean,
): ReadonlyArray<PreviewDiagnostic> {
  if (!markersPresent) return [];
  const violations: PreviewDiagnostic[] = [];
  const fields: ReadonlyArray<{ label: string; source: ParserValueSource }> = [
    { label: 'inspectionDate', source: parsed.metadata.sources.inspectionDate },
    { label: 'inspectionNumber', source: parsed.metadata.sources.inspectionNumber },
    { label: 'projectSite', source: parsed.metadata.sources.projectSite },
    { label: 'keyFindings', source: parsed.metadata.sources.keyFindings },
  ];
  for (const field of fields) {
    if (field.source === 'parser-meta' || field.source === 'named-range') continue;
    violations.push({
      code: 'PARSER_AUTHORITY_VIOLATION',
      message:
        `Markered template requires parser-authoritative ${field.label}; ` +
        `resolved source was "${field.source}". Repair ParserMeta/named ranges.`,
      severity: 'error',
    });
  }
  return violations;
}

function buildMetadataAuthority(
  metadata: InspectionMetadata,
  dateUsedContext: boolean,
  inspectionNumberUsedContext: boolean,
): MetadataAuthority {
  return {
    inspectionDate: {
      source: metadata.sources.inspectionDate,
      usedContext: dateUsedContext,
    },
    inspectionNumber: {
      source: metadata.sources.inspectionNumber,
      usedContext: inspectionNumberUsedContext,
    },
    projectSite: metadata.sources.projectSite,
    keyFindings: metadata.sources.keyFindings,
    reportingWeekStart: metadata.sources.reportingWeekStart,
    reportingWeekEnd: metadata.sources.reportingWeekEnd,
    reportingPeriodLabel: metadata.sources.reportingPeriodLabel,
  };
}

function buildTemplateStatus(markers: {
  readonly templateVersion: string | null;
  readonly parserContractVersion: string | null;
  readonly markersPresent: boolean;
}): TemplateCompatibilityStatus {
  if (!markers.markersPresent) {
    return {
      templateVersion: null,
      parserContractVersion: null,
      valid: true,
    };
  }

  const templateOk = Boolean(
    markers.templateVersion &&
      PARSER_TEMPLATE_MARKER_ACCEPTED.includes(
        markers.templateVersion as (typeof PARSER_TEMPLATE_MARKER_ACCEPTED)[number],
      ),
  );
  const parserOk = Boolean(
    markers.parserContractVersion &&
      PARSER_CONTRACT_VERSION_ACCEPTED.includes(
        markers.parserContractVersion as (typeof PARSER_CONTRACT_VERSION_ACCEPTED)[number],
      ),
  );

  return {
    templateVersion: markers.templateVersion,
    parserContractVersion: markers.parserContractVersion,
    valid: templateOk && parserOk,
  };
}
