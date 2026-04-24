import type { IProvisioningAuditRecord } from '@hbc/models';
import {
  SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
} from '../config/safety-record-keeping-list-definitions.js';
import {
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import {
  SharePointProvisioningService,
  type ISharePointProvisioningService,
} from './sharepoint-provisioning-service.js';
import {
  GraphListDiscoveryService,
  type IGraphListDiscoveryService,
} from './graph-list-discovery-service.js';
import {
  SafetyProvisioningService,
  type ISafetyProvisioningService,
} from './safety-provisioning-service.js';
import {
  SafetyIngestionApplicationService,
  type ISafetyIngestionApplicationService,
} from './safety-ingestion-application-service.js';
import type {
  ISafetyIngestionOperationResult,
  ISafetyIngestionPreviewOperationResult,
  ISafetyIngestionRequest,
  ISafetyRecordKeepingProvisionResult,
  ISafetyReplayRequest,
  ISafetyReportingPeriodSeedResult,
  ISafetyReportingPeriodProbeResult,
} from './safety-provisioning-types.js';

export type {
  IListDefinition,
  IFieldDefinition,
} from './sharepoint-provisioning-service.js';
export type {
  SafetyProvisionOutcome,
  ISafetyProvisionDiagnostic,
  ISafetyFieldProvisionResult,
  ISafetyContainerProvisionResult,
  ISafetyReferenceListValidationResult,
  ISafetyRecordKeepingProvisionResult,
  SafetyReportingPeriodSeedOutcome,
  ISafetyReportingPeriodSeedResult,
  ISafetyIngestionRequest,
  ISafetyReplayRequest,
  ISafetyIngestionOperationResult,
  ISafetyIngestionPreviewOperationResult,
} from './safety-provisioning-types.js';

export interface ISharePointService {
  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string>;
  siteExists(projectId: string): Promise<string | null>;
  deleteSite(siteUrl: string): Promise<void>;
  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void>;
  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean>;
  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void>;
  createDataLists(
    siteUrl: string,
    listDefinitions: import('./sharepoint-provisioning-service.js').IListDefinition[],
    context?: { projectNumber?: string },
  ): Promise<void>;
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;
  installWebParts(siteUrl: string): Promise<void>;
  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void>;
  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void>;
  isHubAssociated(siteUrl: string): Promise<boolean>;
  disassociateHubSite(siteUrl: string): Promise<void>;
  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void>;

  createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void>;
  uploadTemplateFile(
    siteUrl: string,
    entry: { fileName: string; targetLibrary: string; assetPath: string },
  ): Promise<boolean>;
  fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean>;

  assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string,
  ): Promise<void>;

  provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean },
  ): Promise<ISafetyRecordKeepingProvisionResult>;
  ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult>;

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
  probeSafetyReportingPeriodRead(
    input: { reportingPeriodId: string; reportingPeriodSpItemId?: number },
    requestId?: string,
  ): Promise<ISafetyReportingPeriodProbeResult>;

  // Backward-compatible methods retained for transition compatibility.
  applyWebParts(siteUrl: string): Promise<void>;
  setPermissions(siteUrl: string, projectId: string): Promise<void>;
  associateHub(siteUrl: string, hubSiteUrl: string): Promise<void>;
  removeHubAssociation(siteUrl: string): Promise<void>;
}

/**
 * Facade over the decomposed backend service seams:
 *   - SharePointProvisioningService       (site/library/list/file/permission/hub/audit)
 *   - GraphListDiscoveryService           (Graph data-plane list discovery)
 *   - SafetyProvisioningService           (Safety control-plane provisioning + reporting-period seed)
 *   - SafetyIngestionApplicationService   (Safety workbook preview / ingest / replay)
 *
 * External consumers (provisioning saga steps, admin routes, factories, tests)
 * continue to depend on `SharePointService` — its public surface is preserved
 * and zero-argument construction still works. Inside, every method delegates
 * to the appropriate seam so ownership is clear and the facade stays thin.
 */
export class SharePointService implements ISharePointService {
  private readonly sharePoint: ISharePointProvisioningService;
  private readonly safetyProvisioning: ISafetyProvisioningService;
  private readonly ingestion: ISafetyIngestionApplicationService;

  constructor(
    tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService(),
    collaborators?: {
      sharePoint?: ISharePointProvisioningService;
      graphDiscovery?: IGraphListDiscoveryService;
      safetyProvisioning?: ISafetyProvisioningService;
      ingestion?: ISafetyIngestionApplicationService;
    },
  ) {
    const sharePoint = collaborators?.sharePoint ?? new SharePointProvisioningService(tokenService);
    const graphDiscovery = collaborators?.graphDiscovery ?? new GraphListDiscoveryService();
    this.sharePoint = sharePoint;
    this.safetyProvisioning =
      collaborators?.safetyProvisioning
      ?? new SafetyProvisioningService(tokenService, sharePoint, graphDiscovery);
    this.ingestion =
      collaborators?.ingestion
      ?? new SafetyIngestionApplicationService(
        tokenService,
        graphDiscovery,
        undefined,
        { allowNonGraphCodePathForTests: false },
      );
  }

  // --- SharePoint provisioning delegation ---

  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string> {
    return this.sharePoint.createSite(projectId, projectNumber, projectName);
  }

  siteExists(projectId: string): Promise<string | null> {
    return this.sharePoint.siteExists(projectId);
  }

  deleteSite(siteUrl: string): Promise<void> {
    return this.sharePoint.deleteSite(siteUrl);
  }

  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void> {
    return this.sharePoint.createDocumentLibrary(siteUrl, libraryName);
  }

  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean> {
    return this.sharePoint.documentLibraryExists(siteUrl, libraryName);
  }

  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void> {
    return this.sharePoint.uploadTemplateFiles(siteUrl, libraryName);
  }

  createDataLists(
    siteUrl: string,
    listDefinitions: import('./sharepoint-provisioning-service.js').IListDefinition[],
    context?: { projectNumber?: string },
  ): Promise<void> {
    return this.sharePoint.createDataLists(siteUrl, listDefinitions, context);
  }

  listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    return this.sharePoint.listExists(siteUrl, listTitle);
  }

  installWebParts(siteUrl: string): Promise<void> {
    return this.sharePoint.installWebParts(siteUrl);
  }

  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void> {
    return this.sharePoint.setGroupPermissions(siteUrl, memberUpns, opexUpn);
  }

  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void> {
    return this.sharePoint.associateHubSite(siteUrl, hubSiteId);
  }

  isHubAssociated(siteUrl: string): Promise<boolean> {
    return this.sharePoint.isHubAssociated(siteUrl);
  }

  disassociateHubSite(siteUrl: string): Promise<void> {
    return this.sharePoint.disassociateHubSite(siteUrl);
  }

  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void> {
    return this.sharePoint.writeAuditRecord(record);
  }

  createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void> {
    return this.sharePoint.createFolderIfNotExists(siteUrl, libraryName, folderPath);
  }

  uploadTemplateFile(
    siteUrl: string,
    entry: { fileName: string; targetLibrary: string; assetPath: string },
  ): Promise<boolean> {
    return this.sharePoint.uploadTemplateFile(siteUrl, entry);
  }

  fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean> {
    return this.sharePoint.fileExists(siteUrl, libraryName, fileName);
  }

  assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string,
  ): Promise<void> {
    return this.sharePoint.assignGroupToPermissionLevel(siteUrl, entraGroupId, permissionLevel);
  }

  // --- Safety provisioning delegation ---

  provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean },
  ): Promise<ISafetyRecordKeepingProvisionResult> {
    return this.safetyProvisioning.provisionSafetyRecordKeepingSharePoint(input);
  }

  ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult> {
    return this.safetyProvisioning.ensureCurrentWeekSafetyReportingPeriod();
  }

  // --- Safety ingestion delegation ---

  ingestSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    return this.ingestion.ingestSafetyWorkbook(input, requestId);
  }

  replaySafetyWorkbook(
    input: ISafetyReplayRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    return this.ingestion.replaySafetyWorkbook(input, requestId);
  }

  previewSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionPreviewOperationResult> {
    return this.ingestion.previewSafetyWorkbook(input, requestId);
  }

  probeSafetyReportingPeriodRead(
    input: { reportingPeriodId: string; reportingPeriodSpItemId?: number },
    requestId?: string,
  ): Promise<ISafetyReportingPeriodProbeResult> {
    return this.ingestion.probeSafetyReportingPeriodRead(input, requestId);
  }

  // --- Backward-compatible wrappers ---

  applyWebParts(siteUrl: string): Promise<void> {
    return this.sharePoint.installWebParts(siteUrl);
  }

  async setPermissions(_siteUrl: string, _projectId: string): Promise<void> {
    return;
  }

  associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    return this.sharePoint.associateHubSite(siteUrl, hubSiteUrl);
  }

  removeHubAssociation(siteUrl: string): Promise<void> {
    return this.sharePoint.disassociateHubSite(siteUrl);
  }
}

/**
 * Mock adapter used for tests and local mock mode where real SharePoint access
 * is disabled. Unchanged in behavior from the pre-decomposition implementation.
 */
export class MockSharePointService implements ISharePointService {
  async createSite(_projectId: string, projectNumber: string, _projectName: string): Promise<string> {
    return `https://contoso.sharepoint.com/sites/${projectNumber}`;
  }

  async siteExists(_projectId: string): Promise<string | null> {
    return null;
  }

  async deleteSite(_siteUrl: string): Promise<void> {}

  async createDocumentLibrary(_siteUrl: string, _libraryName: string): Promise<void> {}

  async documentLibraryExists(_siteUrl: string, _libraryName: string): Promise<boolean> {
    return false;
  }

  async uploadTemplateFiles(_siteUrl: string, _libraryName: string): Promise<void> {}

  async createDataLists(
    _siteUrl: string,
    _listDefinitions: import('./sharepoint-provisioning-service.js').IListDefinition[],
    _context?: { projectNumber?: string },
  ): Promise<void> {}

  async listExists(_siteUrl: string, _listTitle: string): Promise<boolean> {
    return false;
  }

  async installWebParts(_siteUrl: string): Promise<void> {}

  async setGroupPermissions(_siteUrl: string, _memberUpns: string[], _opexUpn: string): Promise<void> {}

  async associateHubSite(_siteUrl: string, _hubSiteId: string): Promise<void> {}

  async isHubAssociated(_siteUrl: string): Promise<boolean> {
    return false;
  }

  async disassociateHubSite(_siteUrl: string): Promise<void> {}

  async writeAuditRecord(_record: IProvisioningAuditRecord): Promise<void> {}

  async applyWebParts(siteUrl: string): Promise<void> {
    await this.installWebParts(siteUrl);
  }

  async setPermissions(siteUrl: string, _projectId: string): Promise<void> {
    await this.setGroupPermissions(siteUrl, [], '');
  }

  async associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    await this.associateHubSite(siteUrl, hubSiteUrl);
  }

  async removeHubAssociation(siteUrl: string): Promise<void> {
    await this.disassociateHubSite(siteUrl);
  }

  async createFolderIfNotExists(_siteUrl: string, _libraryName: string, _folderPath: string): Promise<void> {}

  async uploadTemplateFile(
    _siteUrl: string,
    _entry: { fileName: string; targetLibrary: string; assetPath: string },
  ): Promise<boolean> {
    return true;
  }

  async fileExists(_siteUrl: string, _libraryName: string, _fileName: string): Promise<boolean> {
    return false;
  }

  async assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string,
  ): Promise<void> {
    console.log(
      `[MockSharePoint] Assigned group ${entraGroupId} → ${permissionLevel} on ${siteUrl}`,
    );
  }

  async provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean },
  ): Promise<ISafetyRecordKeepingProvisionResult> {
    return {
      dryRun: input?.dryRun === true,
      success: true,
      siteTargets: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
      counts: {
        created: 0,
        alreadyExisted: 0,
        updatedOrRepaired: 0,
        failed: 0,
        skipped: 0,
      },
      referenceLists: [],
      containers: [],
      diagnostics: [],
    };
  }

  async ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult> {
    return {
      success: true,
      outcome: 'alreadyExisted',
      matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
      targetSiteUrl: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl,
      targetListTitle: 'Safety Reporting Periods',
      duplicateCount: 0,
      item: {
        Title: 'Week of 2026-04-20',
        WeekStartDate: '2026-04-20',
        WeekEndDate: '2026-04-24',
        PeriodLabel: 'Apr 20 – Apr 24, 2026',
        Status: 'open',
      },
      diagnostics: [],
    };
  }

  async ingestSafetyWorkbook(
    _input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    return {
      success: true,
      requestAccepted: true,
      requestId,
      previewPassed: true,
      diagnostics: [],
    };
  }

  async replaySafetyWorkbook(
    _input: ISafetyReplayRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    return {
      success: true,
      requestAccepted: true,
      requestId,
      previewPassed: true,
      diagnostics: [],
    };
  }

  async previewSafetyWorkbook(
    _input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionPreviewOperationResult> {
    return {
      success: true,
      requestAccepted: true,
      requestId,
      preview: {
        commitReadiness: true,
        template: {
          templateVersion: 'SafetyChecklist_v1',
          parserContractVersion: 'parse-first-2026-04',
          valid: true,
        },
        projectResolution: {
          resolved: true,
          classification: 'project',
          projectNumber: '2026-001',
          projectNameSnapshot: 'Mock Project',
        },
        duplicateRisk: {
          confidence: 'none',
          supersessionRisk: false,
        },
        warnings: [],
        blockingErrors: [],
        diagnosticSummary: {
          commitReady: true,
          failureClass: 'none',
          blockingCodes: [],
          warningCodes: [],
          checks: {
            templateValid: true,
            parserContractMarkerState: 'markered-valid',
            parseSucceeded: true,
            reportingPeriodResolved: true,
            reportingPeriodDateInRange: true,
            projectResolved: true,
            duplicateConfidence: 'none',
          },
        },
      },
      diagnostics: [],
    };
  }

  async probeSafetyReportingPeriodRead(
    input: { reportingPeriodId: string; reportingPeriodSpItemId?: number },
    requestId?: string,
  ): Promise<ISafetyReportingPeriodProbeResult> {
    return {
      success: true,
      requestId,
      codePath: 'graph-only',
      identityLane: 'managed-identity-app-only',
      requestedId: input.reportingPeriodId,
      requestedSpItemId: input.reportingPeriodSpItemId,
      parsedItemId: input.reportingPeriodSpItemId,
      siteUrl: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl,
      siteId: 'mock-site-id',
      listId: 'mock-list-id',
      graphOperation: 'get-item',
      graphPathSummary: '/sites/mock-site/lists/mock-list/items/mock-item',
      status: 'ok',
      causeBucket: 'unknown',
      period: {
        id: input.reportingPeriodId,
        spItemId: input.reportingPeriodSpItemId ?? 1,
        title: 'Mock Reporting Period',
        weekStartDate: '2026-01-01',
        weekEndDate: '2026-01-07',
        periodLabel: 'Mock Week',
        status: 'open',
      },
    };
  }
}
