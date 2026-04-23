import {
  SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
} from '../config/safety-record-keeping-list-definitions.js';
import {
  configureSafetyListGuids,
  type SafetyGuidOverlay,
} from '../../../../packages/features/safety/src/lists/guidConfig.js';
import type { SafetyIngestionPreviewResult } from '../../../../packages/features/safety/src/domain/types.js';
import {
  formatSharePointTokenAcquisitionDiagnostic,
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import { toProvisioningErrorCode } from './sharepoint-common.js';
import {
  resolveSafetyProvisioningTargets,
  validateReferenceLists,
  validateSafetyIngestionContracts,
} from './safety-readiness.js';
import {
  GraphListDiscoveryService,
  type IGraphListDiscoveryService,
} from './graph-list-discovery-service.js';
import { SafetyIngestionGraphRepository } from './safety-ingestion-graph-repository.js';
import {
  evaluateSafetyIngestionPreview,
  type ISafetyIngestionPreviewRequest,
} from './safety-ingestion-preview-evaluator.js';
import {
  SAFETY_INGESTION_BACKEND_VERSION,
  emitSafetyIngestionEvent,
  emitSafetyIngestionMetric,
} from './safety-ingestion-telemetry.js';
import { classifyGraphThrown } from './safety-ingestion-graph-data-plane.js';
import {
  classifyIngestionFailure,
} from './safety-ingestion-failure-classifier.js';
import type {
  ISafetyIngestionOperationResult,
  ISafetyIngestionPreviewOperationResult,
  ISafetyIngestionRequest,
  ISafetyProvisionDiagnostic,
  ISafetyReferenceListValidationResult,
  ISafetyReplayRequest,
} from './safety-provisioning-types.js';

type RepositoryFactory = (tokenService: IManagedIdentityTokenService) => SafetyIngestionGraphRepository;

/**
 * Seam: Safety ingestion application service.
 *
 * Orchestrates Safety workbook preview, ingest, and replay flows: readiness
 * checks, GUID overlay resolution, preview gating, repository coordination,
 * telemetry, and failure classification.
 *
 * Does NOT talk to SharePoint or PnP directly — all Graph I/O is delegated to
 * `SafetyIngestionGraphRepository` (built from the token service) and list
 * discovery is delegated to the Graph discovery seam.
 */
export interface ISafetyIngestionApplicationService {
  ingestSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult>;
  replaySafetyWorkbook(
    input: ISafetyReplayRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult>;
  previewSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionPreviewOperationResult>;
}

export class SafetyIngestionApplicationService implements ISafetyIngestionApplicationService {
  private readonly tokenService: IManagedIdentityTokenService;
  private readonly graphDiscovery: IGraphListDiscoveryService;
  private readonly repositoryFactory: RepositoryFactory;

  constructor(
    tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService(),
    graphDiscovery: IGraphListDiscoveryService = new GraphListDiscoveryService(),
    repositoryFactory: RepositoryFactory = (ts) => new SafetyIngestionGraphRepository(ts),
  ) {
    this.tokenService = tokenService;
    this.graphDiscovery = graphDiscovery;
    this.repositoryFactory = repositoryFactory;
  }

  async ingestSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const startedAtMs = Date.now();
    emitSafetyIngestionEvent('safety.ingestion.entry', {
      operation: 'ingest',
      requestId,
    }, {
      codePath: 'graph-only',
      backendVersion: SAFETY_INGESTION_BACKEND_VERSION,
    });
    emitSafetyIngestionEvent('safety.ingestion.request.received', {
      operation: 'ingest',
      requestId,
    }, {
      fileName: input.fileName,
      reportingPeriodId: input.context.reportingPeriodId,
      uploadedByUpn: input.context.uploadedByUpn,
    });

    const targets = resolveSafetyProvisioningTargets(diagnostics);
    if (!targets) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_TARGET_RESOLUTION_FAILED',
            message: 'Safety/HBCentral site targets could not be resolved safely.',
            failureClass: 'target-resolution-error',
          },
        ]),
      };
    }

    const referenceValidation: ISafetyReferenceListValidationResult[] = [];
    const referenceFailed = await validateReferenceLists(
      this.graphDiscovery,
      targets.hbCentralSiteUrl,
      referenceValidation,
      diagnostics,
    );
    if (referenceFailed) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_REFERENCE_VALIDATION_FAILED',
            message: 'Required Safety reference lists are missing or inaccessible.',
            failureClass: 'reference-validation-error',
          },
        ]),
      };
    }

    const contractErrors = await validateSafetyIngestionContracts(this.graphDiscovery);
    if (contractErrors.length > 0) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat(contractErrors),
      };
    }

    const overlay = await this.resolveSafetyGuidOverlay();
    configureSafetyListGuids(overlay);

    try {
      const repo = this.repositoryFactory(this.tokenService);

      const bytes = Buffer.from(input.fileContentBase64, 'base64');
      if (bytes.length === 0) {
        return {
          success: false,
          requestAccepted: false,
          requestId,
          diagnostics: diagnostics.concat([
            {
              code: 'SAFETY_INGESTION_EMPTY_PAYLOAD',
              message: 'Workbook payload is empty after base64 decoding.',
              failureClass: 'payload-error',
            },
          ]),
        };
      }

      const preview = await this.evaluatePreviewAndLog(
        repo,
        {
          fileName: input.fileName,
          fileBytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
          context: input.context,
        },
        requestId,
      );
      if (!preview.commitReadiness) {
        emitSafetyIngestionEvent('safety.ingestion.commit.gate.blocked', {
          operation: 'ingest',
          requestId,
        }, {
          fileName: input.fileName,
          readiness: preview.commitReadiness,
          blockingCodes: preview.blockingErrors.map((item) => item.code),
          duplicateRisk: preview.duplicateRisk?.confidence ?? 'none',
        });
        return {
          success: false,
          requestAccepted: false,
          requestId,
          preview,
          previewPassed: false,
          diagnostics: diagnostics.concat([
            {
              code: 'SAFETY_INGESTION_COMMIT_NOT_READY',
              message: 'Commit blocked by preview readiness gate.',
              failureClass:
                preview.diagnosticSummary.failureClass === 'parser-authority-violation'
                  ? 'parser-authority-violation'
                  : 'preview-gate-blocked',
            },
          ]),
        };
      }

      emitSafetyIngestionEvent('safety.ingestion.commit.gate.allowed', {
        operation: 'ingest',
        requestId,
      }, {
        fileName: input.fileName,
        readiness: preview.commitReadiness,
        duplicateRisk: preview.duplicateRisk?.confidence ?? 'none',
      });

      const period = await repo.getReportingPeriod(
        input.context.reportingPeriodId,
        input.context.reportingPeriodSpItemId,
      );
      if (!period) {
        return {
          success: false,
          requestAccepted: false,
          requestId,
          preview,
          previewPassed: true,
          diagnostics: diagnostics.concat([
            {
              code: 'SAFETY_INGESTION_REPORTING_PERIOD_NOT_FOUND',
              message: `Reporting period ${input.context.reportingPeriodId} was not found.`,
              failureClass: 'item-binding-error',
            },
          ]),
        };
      }

      const result = await repo.ingestWorkbook({
        fileName: input.fileName,
        fileBytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
        context: {
          ...input.context,
          fileName: input.fileName,
          reportingPeriodId: period.id,
          reportingPeriodSpItemId: period.spItemId,
        },
        requestId,
      });

      emitSafetyIngestionEvent('safety.ingestion.request.completed', {
        operation: 'ingest',
        requestId,
        runId: result.run.id,
        attemptNumber: result.run.attemptNumber,
      }, {
        state: result.state,
        runSpItemId: result.run.spItemId,
        reportingPeriodId: period.id,
      });
      emitSafetyIngestionMetric(
        'safety.ingestion.duration.ms',
        Date.now() - startedAtMs,
        { operation: 'ingest', requestId, runId: result.run.id, attemptNumber: result.run.attemptNumber },
      );

      return {
        success: true,
        requestAccepted: true,
        requestId,
        preview,
        previewPassed: true,
        result,
        diagnostics,
      };
    } catch (err) {
      const message = formatSharePointTokenAcquisitionDiagnostic(err);
      const classification = classifyIngestionFailure(err, 'SAFETY_INGESTION_FAILED');
      emitSafetyIngestionEvent('safety.ingestion.request.failed', {
        operation: 'ingest',
        requestId,
      }, {
        message,
        failureClass: classification.failureClass,
        errorCode: classification.errorCode,
        graphOperation: classification.graphContext?.operation,
        graphPath: classification.graphContext?.pathSummary,
        graphStatus: classification.graphContext?.statusCode,
        graphErrorCode: classification.graphContext?.graphErrorCode,
        authLane: classification.graphContext?.authLane,
      });
      return {
        success: false,
        requestAccepted: false,
        requestId,
        previewPassed: false,
        diagnostics: diagnostics.concat([
          {
            code: toProvisioningErrorCode(err, classification.errorCode),
            message,
            failureClass: classification.failureClass,
            graphContext: classification.graphContext,
          },
        ]),
      };
    }
  }

  async replaySafetyWorkbook(
    input: ISafetyReplayRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const startedAtMs = Date.now();
    emitSafetyIngestionEvent('safety.ingestion.entry', {
      operation: 'replay',
      requestId,
      parentRunId: input.parentRunId,
    }, {
      codePath: 'graph-only',
      backendVersion: SAFETY_INGESTION_BACKEND_VERSION,
    });
    emitSafetyIngestionEvent('safety.ingestion.replay.request.received', {
      operation: 'replay',
      requestId,
      parentRunId: input.parentRunId,
    }, {
      supersedePrior: input.supersedePrior === true,
    });

    const targets = resolveSafetyProvisioningTargets(diagnostics);
    if (!targets) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_TARGET_RESOLUTION_FAILED',
            message: 'Safety/HBCentral site targets could not be resolved safely.',
            failureClass: 'target-resolution-error',
          },
        ]),
      };
    }

    const referenceValidation: ISafetyReferenceListValidationResult[] = [];
    const referenceFailed = await validateReferenceLists(
      this.graphDiscovery,
      targets.hbCentralSiteUrl,
      referenceValidation,
      diagnostics,
    );
    if (referenceFailed) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_REFERENCE_VALIDATION_FAILED',
            message: 'Required Safety reference lists are missing or inaccessible.',
            failureClass: 'reference-validation-error',
          },
        ]),
      };
    }

    const contractErrors = await validateSafetyIngestionContracts(this.graphDiscovery);
    if (contractErrors.length > 0) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat(contractErrors),
      };
    }

    const overlay = await this.resolveSafetyGuidOverlay();
    configureSafetyListGuids(overlay);

    try {
      const repo = this.repositoryFactory(this.tokenService);
      const result = await repo.replayIngestion({
        parentRunId: input.parentRunId,
        supersedePrior: input.supersedePrior ?? false,
        requestId,
      });

      emitSafetyIngestionEvent('safety.ingestion.replay.request.completed', {
        operation: 'replay',
        requestId,
        parentRunId: input.parentRunId,
        runId: result.run.id,
        attemptNumber: result.run.attemptNumber,
      }, {
        state: result.state,
        runSpItemId: result.run.spItemId,
      });
      emitSafetyIngestionMetric(
        'safety.ingestion.duration.ms',
        Date.now() - startedAtMs,
        {
          operation: 'replay',
          requestId,
          parentRunId: input.parentRunId,
          runId: result.run.id,
          attemptNumber: result.run.attemptNumber,
        },
      );

      return {
        success: true,
        requestAccepted: true,
        requestId,
        result,
        previewPassed: true,
        diagnostics,
      };
    } catch (err) {
      const message = formatSharePointTokenAcquisitionDiagnostic(err);
      const classification = classifyIngestionFailure(err, 'SAFETY_INGESTION_REPLAY_FAILED');
      emitSafetyIngestionEvent('safety.ingestion.replay.request.failed', {
        operation: 'replay',
        requestId,
        parentRunId: input.parentRunId,
      }, {
        message,
        failureClass: classification.failureClass,
        errorCode: classification.errorCode,
        graphOperation: classification.graphContext?.operation,
        graphPath: classification.graphContext?.pathSummary,
        graphStatus: classification.graphContext?.statusCode,
        graphErrorCode: classification.graphContext?.graphErrorCode,
        authLane: classification.graphContext?.authLane,
      });
      return {
        success: false,
        requestAccepted: false,
        requestId,
        previewPassed: false,
        diagnostics: diagnostics.concat([
          {
            code: toProvisioningErrorCode(err, classification.errorCode),
            message,
            failureClass: classification.failureClass,
            graphContext: classification.graphContext,
          },
        ]),
      };
    }
  }

  async previewSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionPreviewOperationResult> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const startedAtMs = Date.now();
    emitSafetyIngestionEvent('safety.ingestion.entry', {
      operation: 'preview',
      requestId,
    }, {
      codePath: 'graph-only',
      backendVersion: SAFETY_INGESTION_BACKEND_VERSION,
    });
    emitSafetyIngestionEvent('safety.ingestion.preview.request.received', {
      operation: 'preview',
      requestId,
    }, {
      fileName: input.fileName,
      reportingPeriodId: input.context.reportingPeriodId,
      uploadedByUpn: input.context.uploadedByUpn,
    });

    const targets = resolveSafetyProvisioningTargets(diagnostics);
    if (!targets) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_TARGET_RESOLUTION_FAILED',
            message: 'Safety/HBCentral site targets could not be resolved safely.',
            failureClass: 'target-resolution-error',
          },
        ]),
      };
    }

    const referenceValidation: ISafetyReferenceListValidationResult[] = [];
    const referenceFailed = await validateReferenceLists(
      this.graphDiscovery,
      targets.hbCentralSiteUrl,
      referenceValidation,
      diagnostics,
    );
    if (referenceFailed) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_REFERENCE_VALIDATION_FAILED',
            message: 'Required Safety reference lists are missing or inaccessible.',
            failureClass: 'reference-validation-error',
          },
        ]),
      };
    }

    const contractErrors = await validateSafetyIngestionContracts(this.graphDiscovery);
    if (contractErrors.length > 0) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat(contractErrors),
      };
    }

    const overlay = await this.resolveSafetyGuidOverlay();
    configureSafetyListGuids(overlay);

    const bytes = Buffer.from(input.fileContentBase64, 'base64');
    if (bytes.length === 0) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_EMPTY_PAYLOAD',
            message: 'Workbook payload is empty after base64 decoding.',
            failureClass: 'payload-error',
          },
        ]),
      };
    }

    try {
      const repo = this.repositoryFactory(this.tokenService);
      const preview = await this.evaluatePreviewAndLog(
        repo,
        {
          fileName: input.fileName,
          fileBytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
          context: input.context,
        },
        requestId,
      );

      emitSafetyIngestionEvent('safety.ingestion.preview.request.completed', {
        operation: 'preview',
        requestId,
      }, {
        fileName: input.fileName,
        commitReadiness: preview.commitReadiness,
        blockingCodes: preview.blockingErrors.map((item) => item.code),
        duplicateRisk: preview.duplicateRisk?.confidence ?? 'none',
      });
      emitSafetyIngestionMetric(
        'safety.ingestion.duration.ms',
        Date.now() - startedAtMs,
        { operation: 'preview', requestId },
      );

      return {
        success: true,
        requestAccepted: true,
        requestId,
        preview,
        diagnostics,
      };
    } catch (err) {
      const message = formatSharePointTokenAcquisitionDiagnostic(err);
      const classification = classifyIngestionFailure(err, 'SAFETY_INGESTION_PREVIEW_FAILED');
      emitSafetyIngestionEvent('safety.ingestion.preview.request.failed', {
        operation: 'preview',
        requestId,
      }, {
        message,
        failureClass: classification.failureClass,
        errorCode: classification.errorCode,
        graphOperation: classification.graphContext?.operation,
        graphPath: classification.graphContext?.pathSummary,
        graphStatus: classification.graphContext?.statusCode,
        graphErrorCode: classification.graphContext?.graphErrorCode,
        authLane: classification.graphContext?.authLane,
      });
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: toProvisioningErrorCode(err, classification.errorCode),
            message,
            failureClass: classification.failureClass,
            graphContext: classification.graphContext,
          },
        ]),
      };
    }
  }

  private async evaluatePreviewAndLog(
    repository: SafetyIngestionGraphRepository,
    input: ISafetyIngestionPreviewRequest,
    requestId?: string,
  ): Promise<SafetyIngestionPreviewResult> {
    emitSafetyIngestionEvent('safety.ingestion.preview.parse.start', {
      operation: 'preview',
      requestId,
    }, {
      fileName: input.fileName,
      reportingPeriodId: input.context.reportingPeriodId,
    });
    const preview = await evaluateSafetyIngestionPreview(repository, input);
    emitSafetyIngestionEvent('safety.ingestion.preview.evaluated', {
      operation: 'preview',
      requestId,
    }, {
      fileName: input.fileName,
      commitReadiness: preview.commitReadiness,
      blockingCodes: preview.blockingErrors.map((item) => item.code),
      warningCodes: preview.warnings.map((item) => item.code),
      duplicateRisk: preview.duplicateRisk?.confidence ?? 'none',
    });
    emitSafetyIngestionEvent('safety.ingestion.contract.validation.result', {
      operation: 'preview',
      requestId,
    }, {
      valid: preview.template.valid,
      templateVersion: preview.template.templateVersion,
      parserContractVersion: preview.template.parserContractVersion,
    });
    emitSafetyIngestionEvent('safety.ingestion.reporting-period.resolution.result', {
      operation: 'preview',
      requestId,
    }, {
      resolved: preview.reportingPeriod?.resolved ?? false,
      dateInRange: preview.reportingPeriod?.dateInRange ?? false,
      reportingPeriodId: preview.reportingPeriod?.id,
    });
    emitSafetyIngestionEvent('safety.ingestion.project-resolution.result', {
      operation: 'preview',
      requestId,
    }, {
      resolved: preview.projectResolution.resolved,
      classification: preview.projectResolution.classification,
      projectNumber: preview.projectResolution.projectNumber,
    });
    emitSafetyIngestionEvent('safety.ingestion.duplicate.classification', {
      operation: 'preview',
      requestId,
    }, {
      confidence: preview.duplicateRisk?.confidence ?? 'none',
      matchedInspectionEventId: preview.duplicateRisk?.matchedInspectionEventId,
      supersessionRisk: preview.duplicateRisk?.supersessionRisk ?? false,
    });
    return preview;
  }

  private async resolveSafetyGuidOverlay(): Promise<SafetyGuidOverlay> {
    try {
      const [
        uploads,
        periods,
        weeks,
        inspections,
        findings,
        runs,
        projects,
        legacy,
      ] = await Promise.all([
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.safetySiteUrl, 'Safety Checklist Uploads'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Reporting Periods'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Project Week Records'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Inspection Events'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Findings'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Ingestion Runs'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Projects'),
        this.graphDiscovery.resolveListId(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Legacy Project Fallback Registry'),
      ]);

      return {
        SafetyChecklistUploads: uploads,
        SafetyReportingPeriods: periods,
        SafetyProjectWeekRecords: weeks,
        SafetyInspectionEvents: inspections,
        SafetyFindings: findings,
        SafetyIngestionRuns: runs,
        Projects: projects,
        LegacyProjectFallbackRegistry: legacy,
      };
    } catch (err) {
      const failureClass = classifyGraphThrown(err);
      emitSafetyIngestionEvent('safety.ingestion.graph.overlay.failed', {
        operation: 'ingest',
      }, {
        failureClass,
        hbCentralSiteUrl: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl,
        safetySiteUrl: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.safetySiteUrl,
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }
}
