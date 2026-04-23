import {
  PARSER_CONTRACT_VERSION_ACCEPTED,
  PARSER_TEMPLATE_MARKER_ACCEPTED,
} from '../../../../packages/features/safety/src/domain/templateContract.js';
import type {
  DuplicateSupersessionPreview,
  ParsedInspection,
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
    return {
      commitReadiness: false,
      template: templateStatus,
      projectResolution: {
        resolved: false,
        classification: 'unresolved',
      },
      warnings,
      blockingErrors: blockingErrors.concat([
        {
          code: 'WORKBOOK_READ_FAILED',
          message: error instanceof Error ? error.message : 'Workbook could not be read.',
          severity: 'error',
        },
      ]),
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
    return {
      commitReadiness: false,
      template: templateStatus,
      projectResolution: {
        resolved: false,
        classification: 'unresolved',
      },
      warnings,
      blockingErrors,
    };
  }

  const authoritativeInspectionDate =
    input.context.inspectionDate && input.context.inspectionDate.length > 0
      ? input.context.inspectionDate
      : parsed.metadata.inspectionDate;
  const authoritativeInspectionNumber =
    input.context.inspectionNumber && input.context.inspectionNumber.length > 0
      ? input.context.inspectionNumber
      : parsed.metadata.inspectionNumber;

  const checksum = await computeChecksum(input.fileBytes);

  let reportingPeriod: ReportingPeriodPreview | undefined;
  const period = await repository.getReportingPeriod(input.context.reportingPeriodId);
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

  return {
    commitReadiness: blockingErrors.length === 0,
    template: templateStatus,
    metadata: parsed.metadata,
    reportingPeriod,
    projectResolution,
    duplicateRisk,
    normalizedKeyFindingsPreview: parsed.metadata.keyFindingsFreeText,
    warnings,
    blockingErrors,
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
