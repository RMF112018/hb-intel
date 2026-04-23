import * as fs from 'node:fs';
import * as path from 'node:path';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/appcatalog/index.js';
import '@pnp/sp/files/index.js';
import '@pnp/sp/folders/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/site-groups/index.js';
import '@pnp/sp/site-users/index.js';
import '@pnp/sp/security/index.js';
import '@pnp/sp/sites/index.js';
import '@pnp/sp/webs/index.js';
import type { IProvisioningAuditRecord } from '@hbc/models';
import {
  createSharePointBearerTokenBehavior,
  formatSharePointTokenAcquisitionDiagnostic,
  ManagedIdentityTokenService,
  SharePointTokenAcquisitionError,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import {
  SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS,
  SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
  SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES,
  type ISafetyProvisionContainerDefinition,
  type SafetyProvisionContainerKind,
} from '../config/safety-record-keeping-list-definitions.js';
import { configureSafetyListGuids } from '../../../../packages/features/safety/src/lists/guidConfig.js';
import type { SafetyGuidOverlay } from '../../../../packages/features/safety/src/lists/guidConfig.js';
import type { IngestionRunResult, UploadContext } from '../../../../packages/features/safety/src/domain/types.js';
import { GraphListClient } from './legacy-fallback/graph-list-client.js';
import { SafetyIngestionGraphRepository } from './safety-ingestion-graph-repository.js';

export interface ISharePointService {
  createSite(projectId: string, projectNumber: string, projectName: string): Promise<string>;
  siteExists(projectId: string): Promise<string | null>;
  deleteSite(siteUrl: string): Promise<void>;
  createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void>;
  documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean>;
  uploadTemplateFiles(siteUrl: string, libraryName: string): Promise<void>;
  createDataLists(siteUrl: string, listDefinitions: IListDefinition[], context?: { projectNumber?: string }): Promise<void>;
  listExists(siteUrl: string, listTitle: string): Promise<boolean>;
  installWebParts(siteUrl: string): Promise<void>;
  setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void>;
  associateHubSite(siteUrl: string, hubSiteId: string): Promise<void>;
  isHubAssociated(siteUrl: string): Promise<boolean>;
  disassociateHubSite(siteUrl: string): Promise<void>;
  writeAuditRecord(record: IProvisioningAuditRecord): Promise<void>;

  /** W0-G2-T07: Creates a folder inside a document library if it does not already exist. */
  createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void>;

  /** W0-G2-T07: Uploads a single template file to a document library. Returns false if asset is missing. */
  uploadTemplateFile(siteUrl: string, entry: { fileName: string; targetLibrary: string; assetPath: string }): Promise<boolean>;

  /** T08 §3.4: Check if a file exists in a document library. */
  fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean>;

  /**
   * W0-G1-T02: Assigns an Entra ID security group to a SharePoint permission level on the site.
   */
  assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string
  ): Promise<void>;

  /** Provisions bounded Safety Record Keeping SharePoint containers. */
  provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean }
  ): Promise<ISafetyRecordKeepingProvisionResult>;

  /** Ensures one current-week Safety Reporting Period item exists (bounded idempotent seed). */
  ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult>;

  /** Runs authoritative Safety workbook ingestion using app-only backend writes. */
  ingestSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult>;

  // Backward-compatible methods retained for transition compatibility.
  applyWebParts(siteUrl: string): Promise<void>;
  setPermissions(siteUrl: string, projectId: string): Promise<void>;
  associateHub(siteUrl: string, hubSiteUrl: string): Promise<void>;
  removeHubAssociation(siteUrl: string): Promise<void>;
}

export interface IListDefinition {
  title: string;
  description: string;
  template: number;
  fields: IFieldDefinition[];
  provisioningOrder?: number;
  parentListTitle?: string;
  listFamily?: string;
}

export interface IFieldDefinition {
  internalName: string;
  displayName: string;
  type: 'Text' | 'Number' | 'DateTime' | 'Boolean' | 'Choice' | 'User' | 'URL' | 'Lookup' | 'MultiLineText';
  required?: boolean;
  choices?: string[];
  defaultValue?: string;
  indexed?: boolean;
  lookupListTitle?: string;
  lookupFieldName?: string;
}

export type SafetyProvisionOutcome =
  | 'created'
  | 'alreadyExisted'
  | 'updatedOrRepaired'
  | 'failed'
  | 'skipped';

export interface ISafetyProvisionDiagnostic {
  code: string;
  message: string;
}

export interface ISafetyFieldProvisionResult {
  internalName: string;
  outcome: SafetyProvisionOutcome;
  message?: string;
}

export interface ISafetyContainerProvisionResult {
  key: string;
  title: string;
  kind: SafetyProvisionContainerKind;
  siteUrl: string;
  outcome: SafetyProvisionOutcome;
  fields: ISafetyFieldProvisionResult[];
  message?: string;
}

export interface ISafetyReferenceListValidationResult {
  title: string;
  outcome: SafetyProvisionOutcome;
  exists: boolean;
  message?: string;
}

export interface ISafetyRecordKeepingProvisionResult {
  dryRun: boolean;
  success: boolean;
  siteTargets: {
    safetySiteUrl: string;
    hbCentralSiteUrl: string;
  };
  counts: {
    created: number;
    alreadyExisted: number;
    updatedOrRepaired: number;
    failed: number;
    skipped: number;
  };
  referenceLists: ISafetyReferenceListValidationResult[];
  containers: ISafetyContainerProvisionResult[];
  diagnostics: ISafetyProvisionDiagnostic[];
}

export type SafetyReportingPeriodSeedOutcome =
  | 'created'
  | 'alreadyExisted'
  | 'duplicateDetected'
  | 'failed';

export interface ISafetyReportingPeriodSeedResult {
  success: boolean;
  outcome: SafetyReportingPeriodSeedOutcome;
  matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20';
  targetSiteUrl: string;
  targetListTitle: 'Safety Reporting Periods';
  duplicateCount: number;
  createdItemId?: number;
  item: {
    Title: string;
    WeekStartDate: string;
    WeekEndDate: string;
    PeriodLabel: string;
    Status: 'open';
  };
  diagnostics: ISafetyProvisionDiagnostic[];
}

export interface ISafetyIngestionRequest {
  fileName: string;
  fileContentBase64: string;
  context: UploadContext;
}

export interface ISafetyIngestionOperationResult {
  success: boolean;
  requestAccepted: boolean;
  requestId?: string;
  result?: IngestionRunResult;
  diagnostics: ISafetyProvisionDiagnostic[];
}

/**
 * D-PH6-05: Real SharePoint adapter for provisioning saga idempotency + compensation contracts.
 * Uses Managed Identity tokens with PnPjs and centralizes list/site operations for Steps 1-7.
 */
export class SharePointService implements ISharePointService {
  private readonly tenantUrl: string;
  private readonly tokenService: IManagedIdentityTokenService;
  private readonly graphListClients = new Map<string, GraphListClient>();

  constructor(tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService()) {
    this.tenantUrl = process.env.SHAREPOINT_TENANT_URL!;
    this.tokenService = tokenService;
    if (!this.tenantUrl) throw new Error('SHAREPOINT_TENANT_URL env var is required');
  }

  /** Derives a deterministic site URL from project metadata for idempotent retries. */
  private getSiteUrl(projectNumber: string, projectName: string): string {
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
    return `${this.tenantUrl}/sites/${projectNumber}-${slug}`;
  }

  async siteExists(projectId: string): Promise<string | null> {
    // D-PH6-05 idempotency guard: audit log lookup avoids duplicating site creation.
    const sp: any = await this.getSP(this.tenantUrl);
    try {
      const items = await sp.web.lists
        .getByTitle('ProvisioningAuditLog')
        .items.filter(`ProjectId eq '${projectId}' and Event eq 'Completed'`)
        .select('SiteUrl')();
      if (items.length > 0 && items[0].SiteUrl) {
        return items[0].SiteUrl as string;
      }
    } catch {
      // First runs may not have the audit list yet.
    }
    return null;
  }

  async createSite(projectId: string, projectNumber: string, projectName: string): Promise<string> {
    void projectId;
    const siteUrl = this.getSiteUrl(projectNumber, projectName);
    const sp: any = await this.getSP(this.tenantUrl);

    await sp.sites.createCommunicationSite({
      Title: `${projectNumber} — ${projectName}`,
      Url: siteUrl,
      Description: `HB Intel project site for ${projectNumber} — ${projectName}`,
      Lcid: 1033,
    });

    // D-PH6-05: poll readiness to avoid race conditions in downstream steps.
    await this.waitForSite(siteUrl, 60_000);
    return siteUrl;
  }

  async deleteSite(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.delete();
  }

  async createDocumentLibrary(siteUrl: string, libraryName: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.web.lists.add(libraryName, '', 101, true);
  }

  async documentLibraryExists(siteUrl: string, libraryName: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(libraryName).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  async uploadTemplateFiles(siteUrl: string, _libraryName: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    const folder = sp.web.getFolderByServerRelativePath(
      `/${new URL(siteUrl).pathname.slice(1)}/Shared Documents`
    );
    await folder.files.addUsingPath(
      'README.txt',
      Buffer.from(`HB Intel Project Site — ${siteUrl}\nCreated by provisioning saga.`),
      {
        Overwrite: true,
      }
    );
  }

  async createDataLists(siteUrl: string, listDefinitions: IListDefinition[], context?: { projectNumber?: string }): Promise<void> {
    const sp: any = await this.getSP(siteUrl);

    // Sort by provisioningOrder so parent lists are created before child lists with Lookup columns.
    const sorted = [...listDefinitions].sort(
      (a, b) => (a.provisioningOrder ?? 0) - (b.provisioningOrder ?? 0)
    );

    for (const def of sorted) {
      const alreadyExists = await this.listExists(siteUrl, def.title);
      if (alreadyExists) continue;

      const { list } = await sp.web.lists.add(def.title, def.description, def.template, true);
      for (const field of def.fields) {
        // Resolve {{projectNumber}} placeholder in defaultValue when context is provided.
        const resolvedDefault =
          field.defaultValue !== undefined && context?.projectNumber
            ? field.defaultValue.replace(/\{\{projectNumber\}\}/g, context.projectNumber)
            : field.defaultValue;

        switch (field.type) {
          case 'Number':
            await list.fields.addNumber(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'DateTime':
            await list.fields.addDateTime(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Boolean':
            await list.fields.addBoolean(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Choice':
            await list.fields.addChoice(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              Choices: field.choices ?? [],
            });
            break;
          case 'User':
            await list.fields.addUser(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'URL':
            await list.fields.addUrl(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
          case 'Lookup': {
            // Resolve the target list GUID by title, then create the lookup column.
            const targetList = sp.web.lists.getByTitle(field.lookupListTitle ?? '');
            const targetInfo = await targetList.select('Id')();
            await list.fields.addLookup(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              LookupListId: targetInfo.Id,
              LookupFieldName: field.lookupFieldName ?? 'ID',
            });
            break;
          }
          case 'MultiLineText':
            await list.fields.addMultilineText(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
              RichText: false,
            });
            break;
          case 'Text':
          default:
            await list.fields.addText(field.internalName, {
              Required: field.required ?? false,
              Title: field.displayName,
            });
            break;
        }

        // Post-processing: apply indexing and default value if specified.
        if (field.indexed === true) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ Indexed: true });
        }
        if (resolvedDefault !== undefined) {
          await list.fields.getByInternalNameOrTitle(field.internalName).update({ DefaultValue: resolvedDefault });
        }
      }
    }
  }

  async provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean }
  ): Promise<ISafetyRecordKeepingProvisionResult> {
    const dryRun = input?.dryRun === true;
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const containers: ISafetyContainerProvisionResult[] = [];
    const referenceLists: ISafetyReferenceListValidationResult[] = [];
    const targets = this.resolveSafetyProvisioningTargets(diagnostics);
    const counts = {
      created: 0,
      alreadyExisted: 0,
      updatedOrRepaired: 0,
      failed: 0,
      skipped: 0,
    };

    if (!targets) {
      return {
        dryRun,
        success: false,
        siteTargets: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
        counts,
        referenceLists,
        containers,
        diagnostics,
      };
    }

    const referenceValidationFailed = await this.validateReferenceLists(
      targets.hbCentralSiteUrl,
      referenceLists,
      diagnostics,
    );
    this.bumpCounts(referenceLists.map((ref) => ref.outcome), counts);
    if (referenceValidationFailed) {
      return {
        dryRun,
        success: false,
        siteTargets: targets,
        counts,
        referenceLists,
        containers,
        diagnostics,
      };
    }

    const definitions = [...SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS].sort(
      (a, b) => a.provisioningOrder - b.provisioningOrder
    );

    if (dryRun) {
      const dryRunContainers = await this.dryRunSafetyContainersViaApi(definitions, diagnostics);
      containers.push(...dryRunContainers);
      this.bumpCounts(containers.map((container) => container.outcome), counts);
      const success = counts.failed === 0 && diagnostics.length === 0;
      return {
        dryRun,
        success,
        siteTargets: targets,
        counts,
        referenceLists,
        containers,
        diagnostics,
      };
    }

    for (const definition of definitions) {
      const result = await this.provisionSafetyContainer(definition, dryRun, diagnostics);
      containers.push(result);
    }

    this.bumpCounts(containers.map((container) => container.outcome), counts);
    const success = counts.failed === 0 && diagnostics.length === 0;
    return {
      dryRun,
      success,
      siteTargets: targets,
      counts,
      referenceLists,
      containers,
      diagnostics,
    };
  }

  async ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const targets = this.resolveSafetyProvisioningTargets(diagnostics);
    const seedItem = {
      Title: 'Week of 2026-04-20',
      WeekStartDate: '2026-04-20',
      WeekEndDate: '2026-04-24',
      PeriodLabel: 'Apr 20 – Apr 24, 2026',
      Status: 'open' as const,
    };

    if (!targets) {
      return {
        success: false,
        outcome: 'failed',
        matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
        targetSiteUrl: SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl,
        targetListTitle: 'Safety Reporting Periods',
        duplicateCount: 0,
        item: seedItem,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_REPORTING_PERIOD_SEED_FAILED',
            message: 'Authoritative site targets could not be resolved safely.',
          },
        ]),
      };
    }

    try {
      const sp: any = await this.getSP(targets.hbCentralSiteUrl);
      const list = sp.web.lists.getByTitle('Safety Reporting Periods');
      const existingItems: any[] = await list.items
        .select('Id', 'Title', 'WeekStartDate', 'WeekEndDate', 'PeriodLabel', 'Status')();

      const matches = existingItems.filter((entry) => {
        const weekStart = this.normalizeSeedDate(entry?.WeekStartDate);
        const title = String(entry?.Title ?? '');
        return weekStart === seedItem.WeekStartDate || title === seedItem.Title;
      });

      if (matches.length > 1) {
        return {
          success: false,
          outcome: 'duplicateDetected',
          matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
          targetSiteUrl: targets.hbCentralSiteUrl,
          targetListTitle: 'Safety Reporting Periods',
          duplicateCount: matches.length,
          item: seedItem,
          diagnostics: [
            {
              code: 'SAFETY_REPORTING_PERIOD_DUPLICATES',
              message:
                'Multiple current-week Safety Reporting Period records matched identity rule; no mutation performed.',
            },
          ],
        };
      }

      if (matches.length === 1) {
        return {
          success: true,
          outcome: 'alreadyExisted',
          matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
          targetSiteUrl: targets.hbCentralSiteUrl,
          targetListTitle: 'Safety Reporting Periods',
          duplicateCount: 0,
          item: seedItem,
          diagnostics,
        };
      }

      const created = await list.items.add(seedItem);
      const createdId = Number(created?.data?.Id);
      return {
        success: true,
        outcome: 'created',
        matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
        targetSiteUrl: targets.hbCentralSiteUrl,
        targetListTitle: 'Safety Reporting Periods',
        duplicateCount: 0,
        createdItemId: Number.isFinite(createdId) ? createdId : undefined,
        item: seedItem,
        diagnostics,
      };
    } catch (err) {
      return {
        success: false,
        outcome: 'failed',
        matchingRule: 'WeekStartDate == 2026-04-20 OR Title == Week of 2026-04-20',
        targetSiteUrl: targets.hbCentralSiteUrl,
        targetListTitle: 'Safety Reporting Periods',
        duplicateCount: 0,
        item: seedItem,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_REPORTING_PERIOD_SEED_FAILED',
            message: formatSharePointTokenAcquisitionDiagnostic(err),
          },
        ]),
      };
    }
  }

  async ingestSafetyWorkbook(
    input: ISafetyIngestionRequest,
    requestId?: string,
  ): Promise<ISafetyIngestionOperationResult> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    console.log(JSON.stringify({
      level: 'info',
      event: 'safety.ingestion.request.received',
      requestId,
      fileName: input.fileName,
      reportingPeriodId: input.context.reportingPeriodId,
      uploadedByUpn: input.context.uploadedByUpn,
      timestamp: new Date().toISOString(),
    }));

    const targets = this.resolveSafetyProvisioningTargets(diagnostics);
    if (!targets) {
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: 'SAFETY_INGESTION_TARGET_RESOLUTION_FAILED',
            message: 'Safety/HBCentral site targets could not be resolved safely.',
          },
        ]),
      };
    }

    const referenceValidation: ISafetyReferenceListValidationResult[] = [];
    const referenceFailed = await this.validateReferenceLists(
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
          },
        ]),
      };
    }

    const contractErrors = await this.validateSafetyIngestionContracts();
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
      const repo = new SafetyIngestionGraphRepository(this.tokenService);

      const period = await repo.getReportingPeriod(input.context.reportingPeriodId);
      if (!period) {
        return {
          success: false,
          requestAccepted: false,
          requestId,
          diagnostics: diagnostics.concat([
            {
              code: 'SAFETY_INGESTION_REPORTING_PERIOD_NOT_FOUND',
              message: `Reporting period ${input.context.reportingPeriodId} was not found.`,
            },
          ]),
        };
      }

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
      });

      console.log(JSON.stringify({
        level: 'info',
        event: 'safety.ingestion.request.completed',
        requestId,
        state: result.state,
        runId: result.run.id,
        runSpItemId: result.run.spItemId,
        reportingPeriodId: period.id,
        timestamp: new Date().toISOString(),
      }));

      return {
        success: true,
        requestAccepted: true,
        requestId,
        result,
        diagnostics,
      };
    } catch (err) {
      const message = formatSharePointTokenAcquisitionDiagnostic(err);
      console.error(JSON.stringify({
        level: 'error',
        event: 'safety.ingestion.request.failed',
        requestId,
        message,
        timestamp: new Date().toISOString(),
      }));
      return {
        success: false,
        requestAccepted: false,
        requestId,
        diagnostics: diagnostics.concat([
          {
            code: this.toProvisioningErrorCode(err, 'SAFETY_INGESTION_FAILED'),
            message,
          },
        ]),
      };
    }
  }

  async listExists(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch {
      return false;
    }
  }

  private async resolveSafetyGuidOverlay(): Promise<SafetyGuidOverlay> {
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
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.safetySiteUrl, 'Safety Checklist Uploads'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Reporting Periods'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Project Week Records'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Inspection Events'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Findings'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Safety Ingestion Runs'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Projects'),
      this.fetchListIdViaApi(SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS.hbCentralSiteUrl, 'Legacy Project Fallback Registry'),
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
  }

  private async validateSafetyIngestionContracts(): Promise<ISafetyProvisionDiagnostic[]> {
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    for (const definition of SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS) {
      if (definition.fields.length === 0 || definition.kind !== 'list') continue;
      try {
        const present = await this.fetchListFieldInternalNamesViaApi(definition.siteUrl, definition.title);
        const missing = definition.fields
          .map((field) => field.internalName)
          .filter((name) => name !== 'Title' && !present.has(name));
        if (missing.length > 0) {
          diagnostics.push({
            code: 'SAFETY_INGESTION_FIELD_CONTRACT_MISSING',
            message: `${definition.title} missing fields: ${missing.join(', ')}`,
          });
        }
      } catch (err) {
        diagnostics.push({
          code: this.toProvisioningErrorCode(err, 'SAFETY_INGESTION_FIELD_CONTRACT_FAILED'),
          message: `${definition.title} contract check failed: ${formatSharePointTokenAcquisitionDiagnostic(err)}`,
        });
      }
    }
    return diagnostics;
  }

  private resolveSafetyProvisioningTargets(
    diagnostics: ISafetyProvisionDiagnostic[]
  ): { safetySiteUrl: string; hbCentralSiteUrl: string } | null {
    const expected = SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS;
    const expectedSafety = this.normalizeSiteUrl(expected.safetySiteUrl);
    const expectedHbCentral = this.normalizeSiteUrl(expected.hbCentralSiteUrl);

    if (expectedSafety.pathname !== '/sites/safety') {
      diagnostics.push({
        code: 'INVALID_SAFETY_SITE_CONSTANT',
        message: `Expected Safety site path to be /sites/Safety, found ${expected.safetySiteUrl}`,
      });
    }
    if (expectedHbCentral.pathname !== '/sites/hbcentral') {
      diagnostics.push({
        code: 'INVALID_HBCENTRAL_SITE_CONSTANT',
        message: `Expected HBCentral site path to be /sites/HBCentral, found ${expected.hbCentralSiteUrl}`,
      });
    }
    if (expectedSafety.origin !== expectedHbCentral.origin) {
      diagnostics.push({
        code: 'SITE_ORIGIN_MISMATCH',
        message:
          'Safety and HBCentral site constants do not share the same SharePoint tenant origin.',
      });
    }

    const configuredProjectsSite = process.env.SHAREPOINT_PROJECTS_SITE_URL?.trim();
    if (configuredProjectsSite) {
      const configured = this.normalizeSiteUrl(configuredProjectsSite);
      if (configured.href !== expectedHbCentral.href) {
        diagnostics.push({
          code: 'SHAREPOINT_PROJECTS_SITE_URL_CONFLICT',
          message:
            `SHAREPOINT_PROJECTS_SITE_URL is ${configuredProjectsSite}, expected ${expected.hbCentralSiteUrl} for bounded Safety provisioning.`,
        });
      }
    }

    const configuredTenantUrl = process.env.SHAREPOINT_TENANT_URL?.trim();
    if (configuredTenantUrl) {
      const configuredTenant = this.normalizeSiteUrl(configuredTenantUrl);
      if (configuredTenant.origin !== expectedSafety.origin) {
        diagnostics.push({
          code: 'SHAREPOINT_TENANT_URL_CONFLICT',
          message:
            `SHAREPOINT_TENANT_URL origin ${configuredTenant.origin} does not match authoritative safety origin ${expectedSafety.origin}.`,
        });
      }
    }

    if (diagnostics.length > 0) {
      return null;
    }

    return {
      safetySiteUrl: expected.safetySiteUrl,
      hbCentralSiteUrl: expected.hbCentralSiteUrl,
    };
  }

  private normalizeSiteUrl(urlValue: string): URL {
    const url = new URL(urlValue);
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';
    return new URL(`${url.origin}${normalizedPath.toLowerCase()}`);
  }

  private async validateReferenceLists(
    siteUrl: string,
    results: ISafetyReferenceListValidationResult[],
    diagnostics: ISafetyProvisionDiagnostic[],
  ): Promise<boolean> {
    let failed = false;
    for (const title of SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES) {
      let exists = false;
      try {
        exists = await this.fetchListExistsViaApi(siteUrl, title);
      } catch (err) {
        failed = true;
        const errorMessage = formatSharePointTokenAcquisitionDiagnostic(err);
        results.push({
          title,
          exists: false,
          outcome: 'failed',
          message: errorMessage,
        });
        diagnostics.push({
          code: this.toProvisioningErrorCode(err, 'REFERENCE_LIST_VALIDATION_ERROR'),
          message: `${title} validation failed on ${siteUrl}: ${errorMessage}`,
        });
        continue;
      }
      if (exists) {
        results.push({ title, exists: true, outcome: 'alreadyExisted' });
        continue;
      }
      failed = true;
      const message = `Required reference list "${title}" was not found on ${siteUrl}.`;
      results.push({ title, exists: false, outcome: 'failed', message });
      diagnostics.push({
        code: 'MISSING_REFERENCE_LIST',
        message,
      });
    }
    return failed;
  }

  private async provisionSafetyContainer(
    definition: ISafetyProvisionContainerDefinition,
    dryRun: boolean,
    diagnostics: ISafetyProvisionDiagnostic[],
  ): Promise<ISafetyContainerProvisionResult> {
    const fieldOutcomes: ISafetyFieldProvisionResult[] = [];
    const sp: any = await this.getSP(definition.siteUrl);
    let exists = false;
    try {
      exists =
        definition.kind === 'library'
          ? await this.ensureLibraryExistsDetailed(definition.siteUrl, definition.title)
          : await this.ensureListExistsDetailed(definition.siteUrl, definition.title);
    } catch (err) {
      const errorMessage = formatSharePointTokenAcquisitionDiagnostic(err);
      diagnostics.push({
        code: this.toProvisioningErrorCode(err, 'CONTAINER_ACCESS_ERROR'),
        message: `${definition.title} on ${definition.siteUrl}: ${errorMessage}`,
      });
      return {
        key: definition.key,
        title: definition.title,
        kind: definition.kind,
        siteUrl: definition.siteUrl,
        outcome: 'failed',
        fields: [],
        message: errorMessage,
      };
    }

    let list: any = sp.web.lists.getByTitle(definition.title);
    let outcome: SafetyProvisionOutcome = exists ? 'alreadyExisted' : 'created';
    let message: string | undefined;

    if (!exists && !dryRun) {
      const created = await sp.web.lists.add(definition.title, '', definition.template, true);
      list = created.list;
    } else if (!exists && dryRun) {
      message = 'Dry-run: container would be created.';
    }

    let existingFieldsByInternalName = new Map<string, any>();
    if (exists || (!dryRun && definition.fields.length > 0)) {
      const existingFields: any[] = await list.fields
        .select('InternalName', 'TypeAsString', 'Required', 'LookupField', 'LookupList')();
      existingFieldsByInternalName = new Map(
        existingFields.map((field) => [String(field.InternalName), field]),
      );
    }

    const lookupListIdCache = new Map<string, string>();

    for (const field of definition.fields) {
      if (field.internalName === 'Title' && definition.kind === 'list') {
        // SharePoint creates Title automatically for custom lists.
        continue;
      }

      const existing = existingFieldsByInternalName.get(field.internalName);
      if (!existing) {
        if (dryRun) {
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'created',
            message: 'Dry-run: field would be created.',
          });
          continue;
        }

        try {
          await this.addListField(list, field, definition.siteUrl);
          fieldOutcomes.push({ internalName: field.internalName, outcome: 'created' });
          if (exists) outcome = 'updatedOrRepaired';
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'failed',
            message: errorMessage,
          });
          diagnostics.push({
            code: 'FIELD_CREATE_FAILED',
            message: `${definition.title}.${field.internalName}: ${errorMessage}`,
          });
          outcome = 'failed';
        }
        continue;
      }

      const compatibilityError = await this.getFieldCompatibilityError(
        field,
        existing,
        definition.siteUrl,
        lookupListIdCache,
      );
      if (compatibilityError) {
        fieldOutcomes.push({
          internalName: field.internalName,
          outcome: 'failed',
          message: compatibilityError,
        });
        diagnostics.push({
          code: 'FIELD_SCHEMA_DRIFT',
          message: `${definition.title}.${field.internalName}: ${compatibilityError}`,
        });
        outcome = 'failed';
        continue;
      }

      if (field.required !== undefined && Boolean(existing.Required) !== field.required) {
        if (dryRun) {
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'updatedOrRepaired',
            message: `Dry-run: Required would be set to ${field.required}.`,
          });
          if (outcome === 'alreadyExisted') outcome = 'updatedOrRepaired';
          continue;
        }
        try {
          await list.fields
            .getByInternalNameOrTitle(field.internalName)
            .update({ Required: field.required });
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'updatedOrRepaired',
          });
          if (outcome === 'alreadyExisted') outcome = 'updatedOrRepaired';
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'failed',
            message: errorMessage,
          });
          diagnostics.push({
            code: 'FIELD_UPDATE_FAILED',
            message: `${definition.title}.${field.internalName}: ${errorMessage}`,
          });
          outcome = 'failed';
        }
        continue;
      }

      fieldOutcomes.push({
        internalName: field.internalName,
        outcome: 'alreadyExisted',
      });
    }

    if (outcome !== 'failed' && fieldOutcomes.some((field) => field.outcome === 'failed')) {
      outcome = 'failed';
    }
    if (
      outcome === 'alreadyExisted' &&
      fieldOutcomes.some((field) => field.outcome === 'created' || field.outcome === 'updatedOrRepaired')
    ) {
      outcome = 'updatedOrRepaired';
    }

    return {
      key: definition.key,
      title: definition.title,
      kind: definition.kind,
      siteUrl: definition.siteUrl,
      outcome,
      fields: fieldOutcomes,
      message,
    };
  }

  private async addListField(list: any, field: IFieldDefinition, siteUrl: string): Promise<void> {
    switch (field.type) {
      case 'Number':
        await list.fields.addNumber(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'DateTime':
        await list.fields.addDateTime(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Boolean':
        await list.fields.addBoolean(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Choice':
        await list.fields.addChoice(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          Choices: field.choices ?? [],
        });
        break;
      case 'User':
        await list.fields.addUser(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'URL':
        await list.fields.addUrl(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
      case 'Lookup': {
        const sp: any = await this.getSP(siteUrl);
        const targetList = sp.web.lists.getByTitle(field.lookupListTitle ?? '');
        const targetInfo = await targetList.select('Id')();
        await list.fields.addLookup(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          LookupListId: targetInfo.Id,
          LookupFieldName: field.lookupFieldName ?? 'ID',
        });
        break;
      }
      case 'MultiLineText':
        await list.fields.addMultilineText(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
          RichText: false,
        });
        break;
      case 'Text':
      default:
        await list.fields.addText(field.internalName, {
          Required: field.required ?? false,
          Title: field.displayName,
        });
        break;
    }
  }

  private async getFieldCompatibilityError(
    expected: IFieldDefinition,
    actual: any,
    siteUrl: string,
    lookupListIdCache: Map<string, string>,
  ): Promise<string | null> {
    const typeValue = String(actual.TypeAsString ?? '');
    const compatibleTypes = this.compatibleSharePointTypes(expected.type);
    if (!compatibleTypes.includes(typeValue)) {
      return `Expected type ${expected.type}, found ${typeValue}.`;
    }

    if (expected.type === 'Lookup' && expected.lookupListTitle) {
      const expectedLookupListId = await this.getLookupListId(
        siteUrl,
        expected.lookupListTitle,
        lookupListIdCache,
      );
      const actualLookupListId = this.normalizeGuid(String(actual.LookupList ?? ''));
      if (!actualLookupListId) {
        return 'Lookup column is missing LookupList binding.';
      }
      if (actualLookupListId !== expectedLookupListId) {
        return `Expected lookup list ${expected.lookupListTitle}, found ${actualLookupListId}.`;
      }
    }

    return null;
  }

  private compatibleSharePointTypes(type: IFieldDefinition['type']): string[] {
    switch (type) {
      case 'MultiLineText':
        return ['Note'];
      case 'User':
        return ['User', 'UserMulti'];
      case 'Lookup':
        return ['Lookup', 'LookupMulti'];
      case 'URL':
        return ['URL'];
      case 'DateTime':
        return ['DateTime'];
      case 'Number':
        return ['Number', 'Currency'];
      case 'Choice':
        return ['Choice'];
      case 'Boolean':
        return ['Boolean'];
      case 'Text':
      default:
        return ['Text'];
    }
  }

  private async getLookupListId(
    siteUrl: string,
    listTitle: string,
    cache: Map<string, string>,
  ): Promise<string> {
    const cacheKey = `${siteUrl}::${listTitle}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const sp: any = await this.getSP(siteUrl);
    const list = await sp.web.lists.getByTitle(listTitle).select('Id')();
    const normalized = this.normalizeGuid(String(list.Id));
    if (!normalized) {
      throw new Error(`Lookup list ${listTitle} on ${siteUrl} has invalid Id`);
    }
    cache.set(cacheKey, normalized);
    return normalized;
  }

  private normalizeGuid(value: string): string | null {
    const normalized = value.replace(/[{}]/g, '').toLowerCase();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(normalized)
      ? normalized
      : null;
  }

  private normalizeSeedDate(value: unknown): string | null {
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
      return match ? match[1] : null;
    }
    if (value instanceof Date && !Number.isNaN(value.valueOf())) {
      return value.toISOString().slice(0, 10);
    }
    return null;
  }

  private isNotFoundError(err: unknown): boolean {
    const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
    return (
      message.includes('404') ||
      message.includes('not found') ||
      message.includes('does not exist') ||
      message.includes('cannot find resource')
    );
  }

  private async ensureListExistsDetailed(siteUrl: string, listTitle: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    try {
      await sp.web.lists.getByTitle(listTitle).select('Id')();
      return true;
    } catch (err) {
      if (this.isNotFoundError(err)) return false;
      throw err;
    }
  }

  private async dryRunSafetyContainersViaApi(
    definitions: ISafetyProvisionContainerDefinition[],
    diagnostics: ISafetyProvisionDiagnostic[],
  ): Promise<ISafetyContainerProvisionResult[]> {
    const results: ISafetyContainerProvisionResult[] = [];
    for (const definition of definitions) {
      try {
        const exists = await this.fetchListExistsViaApi(definition.siteUrl, definition.title);
        if (!exists) {
          const fields = definition.fields
            .filter((field) => !(field.internalName === 'Title' && definition.kind === 'list'))
            .map((field) => ({
              internalName: field.internalName,
              outcome: 'created' as const,
              message: 'Dry-run: field would be created.',
            }));
          results.push({
            key: definition.key,
            title: definition.title,
            kind: definition.kind,
            siteUrl: definition.siteUrl,
            outcome: 'created',
            fields,
            message: 'Dry-run: container would be created.',
          });
          continue;
        }

        const fieldsPresent = definition.kind === 'list'
          ? await this.fetchListFieldInternalNamesViaApi(definition.siteUrl, definition.title)
          : new Set<string>();
        const fieldOutcomes: ISafetyFieldProvisionResult[] = [];
        let outcome: SafetyProvisionOutcome = 'alreadyExisted';
        for (const field of definition.fields) {
          if (field.internalName === 'Title' && definition.kind === 'list') continue;
          if (definition.kind === 'library') {
            fieldOutcomes.push({ internalName: field.internalName, outcome: 'alreadyExisted' });
            continue;
          }
          if (!fieldsPresent.has(field.internalName)) {
            fieldOutcomes.push({
              internalName: field.internalName,
              outcome: 'updatedOrRepaired',
              message: 'Dry-run: field would be created.',
            });
            outcome = 'updatedOrRepaired';
          } else {
            fieldOutcomes.push({ internalName: field.internalName, outcome: 'alreadyExisted' });
          }
        }
        results.push({
          key: definition.key,
          title: definition.title,
          kind: definition.kind,
          siteUrl: definition.siteUrl,
          outcome,
          fields: fieldOutcomes,
        });
      } catch (err) {
        const errorMessage = formatSharePointTokenAcquisitionDiagnostic(err);
        diagnostics.push({
          code: this.toProvisioningErrorCode(err, 'CONTAINER_ACCESS_ERROR'),
          message: `${definition.title} on ${definition.siteUrl}: ${errorMessage}`,
        });
        results.push({
          key: definition.key,
          title: definition.title,
          kind: definition.kind,
          siteUrl: definition.siteUrl,
          outcome: 'failed',
          fields: [],
          message: errorMessage,
        });
      }
    }
    return results;
  }

  private async fetchListExistsViaApi(siteUrl: string, listTitle: string): Promise<boolean> {
    const client = this.getGraphListClient(siteUrl);
    return client.listExists(listTitle);
  }

  private async fetchListIdViaApi(siteUrl: string, listTitle: string): Promise<string> {
    const client = this.getGraphListClient(siteUrl);
    return client.resolveListId(listTitle);
  }

  private async fetchListFieldInternalNamesViaApi(siteUrl: string, listTitle: string): Promise<Set<string>> {
    const client = this.getGraphListClient(siteUrl);
    return client.getWritableColumnNames(listTitle);
  }

  private getGraphListClient(siteUrl: string): GraphListClient {
    const normalized = siteUrl.replace(/\/+$/, '');
    const cached = this.graphListClients.get(normalized);
    if (cached) return cached;
    const client = new GraphListClient(normalized);
    this.graphListClients.set(normalized, client);
    return client;
  }

  private async ensureLibraryExistsDetailed(siteUrl: string, libraryName: string): Promise<boolean> {
    return this.ensureListExistsDetailed(siteUrl, libraryName);
  }

  private bumpCounts(outcomes: SafetyProvisionOutcome[], counts: ISafetyRecordKeepingProvisionResult['counts']): void {
    for (const outcome of outcomes) {
      counts[outcome] += 1;
    }
  }

  /**
   * D-PH6-05 Step 5 implementation: installs HB Intel SPFx app from tenant App Catalog
   * and polls until installation is visible or timeout is reached.
   */
  async installWebParts(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    const appCatalogUrl = process.env.SHAREPOINT_APP_CATALOG_URL!;
    if (!appCatalogUrl) throw new Error('SHAREPOINT_APP_CATALOG_URL env var is required');

    const hbIntelAppId = process.env.HB_INTEL_SPFX_APP_ID!;
    if (!hbIntelAppId) throw new Error('HB_INTEL_SPFX_APP_ID env var is required');

    // The app catalog URL is validated by env presence; installation call executes on target web.
    await sp.web.appcatalog.getAppById(hbIntelAppId).install();

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      const apps = await sp.web.appcatalog.filter(`ProductId eq '${hbIntelAppId}'`)();
      if (apps[0]?.InstalledVersion) return;
      await new Promise((r) => setTimeout(r, 5000));
    }

    throw new Error('Web part installation did not complete within 60 seconds');
  }

  async setGroupPermissions(siteUrl: string, memberUpns: string[], opexUpn: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.web.breakRoleInheritance(false, true);
    for (const upn of [...memberUpns, opexUpn]) {
      await sp.web.siteUsers
        .getByEmail(upn)
        .then(async (user: any) => {
          await sp.web.roleAssignments.add(user.Id, 1073741827);
        })
        .catch((err: unknown) => {
          throw new Error(
            `Failed to add user ${upn}: ${err instanceof Error ? err.message : String(err)}`
          );
        });
    }
  }

  async associateHubSite(siteUrl: string, hubSiteId: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.joinHubSiteById(hubSiteId);
  }

  async isHubAssociated(siteUrl: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    const siteInfo = (await sp.site.select('HubSiteId')()) as { HubSiteId?: string };
    return (
      !!siteInfo.HubSiteId && siteInfo.HubSiteId !== '00000000-0000-0000-0000-000000000000'
    );
  }

  async disassociateHubSite(siteUrl: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    await sp.site.unJoinHubSite();
  }

  async writeAuditRecord(record: IProvisioningAuditRecord): Promise<void> {
    const sp: any = await this.getSP(this.tenantUrl);
    const list = sp.web.lists.getByTitle('ProvisioningAuditLog');
    await list.items.add({
      Title: `${record.projectNumber} — ${record.event}`,
      ProjectId: record.projectId,
      ProjectNumber: record.projectNumber,
      ProjectName: record.projectName,
      CorrelationId: record.correlationId,
      Event: record.event,
      TriggeredBy: record.triggeredBy,
      SubmittedBy: record.submittedBy,
      Timestamp: record.timestamp,
      SiteUrl: record.siteUrl ?? '',
      ErrorSummary: record.errorSummary ?? '',
    });
  }

  /** W0-G2-T07: Creates a folder inside a document library if it does not already exist. */
  async createFolderIfNotExists(siteUrl: string, libraryName: string, folderPath: string): Promise<void> {
    const sp: any = await this.getSP(siteUrl);
    const relUrl = `/${new URL(siteUrl).pathname.slice(1)}/${libraryName}/${folderPath}`;
    try {
      await sp.web.getFolderByServerRelativePath(relUrl).select('Exists')();
    } catch {
      await sp.web.folders.addUsingPath(relUrl);
    }
  }

  /** W0-G2-T07: Uploads a single template file to a document library. Returns false if asset is missing. */
  async uploadTemplateFile(
    siteUrl: string,
    entry: { fileName: string; targetLibrary: string; assetPath: string }
  ): Promise<boolean> {
    const fullPath = path.resolve(__dirname, '../assets/templates/', entry.assetPath);
    if (!fs.existsSync(fullPath)) {
      return false;
    }
    // T08 §3.4: Never overwrite existing files — idempotent skip if already present.
    const alreadyExists = await this.fileExists(siteUrl, entry.targetLibrary, entry.fileName);
    if (alreadyExists) {
      return true;
    }
    const sp: any = await this.getSP(siteUrl);
    const folderUrl = `/${new URL(siteUrl).pathname.slice(1)}/${entry.targetLibrary}`;
    const folder = sp.web.getFolderByServerRelativePath(folderUrl);
    await folder.files.addUsingPath(entry.fileName, fs.readFileSync(fullPath), { Overwrite: false });
    return true;
  }

  /** T08 §3.4: Check if a file exists in a document library. */
  async fileExists(siteUrl: string, libraryName: string, fileName: string): Promise<boolean> {
    const sp: any = await this.getSP(siteUrl);
    const relUrl = `/${new URL(siteUrl).pathname.slice(1)}/${libraryName}/${fileName}`;
    try {
      await sp.web.getFileByServerRelativePath(relUrl).select('Exists')();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * W0-G1-T02: Assigns an Entra ID security group to a SharePoint permission level.
   * Uses PnPjs to break role inheritance, resolve the group as a site principal,
   * and assign the named role definition. Idempotent on retries.
   */
  async assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string
  ): Promise<void> {
    const sp: any = await this.getSP(siteUrl);

    // Break role inheritance (idempotent — copyRoleAssignments preserves existing grants).
    await sp.web.breakRoleInheritance(false, true);

    // Resolve the Entra ID security group as a SharePoint site principal.
    const tenantId = process.env.AZURE_TENANT_ID;
    if (!tenantId) throw new Error('AZURE_TENANT_ID env var is required for group permission assignment');
    const claimIdentity = `c:0t.c|tenant|${entraGroupId}`;
    const userInfo = await sp.web.ensureUser(claimIdentity);
    const principalId: number = userInfo.data?.Id ?? userInfo.Id;

    // Resolve the role definition by name (e.g. "Full Control", "Contribute", "Read").
    const roleDef = await sp.web.roleDefinitions.getByName(permissionLevel).select('Id')();
    const roleDefId: number = roleDef.Id;

    // Add role assignment — catch duplicate assignment for idempotency.
    try {
      await sp.web.roleAssignments.add(principalId, roleDefId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // SharePoint returns a specific error when the assignment already exists.
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        return;
      }
      throw err;
    }
  }

  /** Compatibility wrapper for older Step 5 callsites. */
  async applyWebParts(siteUrl: string): Promise<void> {
    await this.installWebParts(siteUrl);
  }

  /** Compatibility wrapper for pre-PH6.5 step contract. */
  async setPermissions(_siteUrl: string, _projectId: string): Promise<void> {
    return;
  }

  /** Compatibility wrapper for pre-PH6.5 step contract. */
  async associateHub(siteUrl: string, hubSiteUrl: string): Promise<void> {
    const hubSiteId = hubSiteUrl;
    await this.associateHubSite(siteUrl, hubSiteId);
  }

  /** Compatibility wrapper for pre-PH6.5 compensation contract. */
  async removeHubAssociation(siteUrl: string): Promise<void> {
    await this.disassociateHubSite(siteUrl);
  }

  private async getSP(siteUrl: string): Promise<any> {
    const behavior = await createSharePointBearerTokenBehavior(siteUrl, this.tokenService);
    return (spfi(siteUrl) as any).using(behavior);
  }

  private toProvisioningErrorCode(err: unknown, fallback: string): string {
    return err instanceof SharePointTokenAcquisitionError
      ? err.code
      : fallback;
  }

  /** D-PH6-05 readiness poll loop for post-create eventual consistency in SharePoint. */
  private async waitForSite(siteUrl: string, timeoutMs: number): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const sp = await this.getSP(siteUrl);
        await sp.web.select('Title')();
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    throw new Error(`Site at ${siteUrl} did not become available within ${timeoutMs}ms`);
  }
}

/**
 * D-PH6-05 mock adapter used for tests/local mock mode where real SharePoint access is disabled.
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

  async createDataLists(_siteUrl: string, _listDefinitions: IListDefinition[], _context?: { projectNumber?: string }): Promise<void> {}

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

  /** W0-G2-T07: Mock — no-op folder creation. */
  async createFolderIfNotExists(_siteUrl: string, _libraryName: string, _folderPath: string): Promise<void> {}

  /** W0-G2-T07: Mock — always returns true. */
  async uploadTemplateFile(
    _siteUrl: string,
    _entry: { fileName: string; targetLibrary: string; assetPath: string }
  ): Promise<boolean> {
    return true;
  }

  /** T08 §3.4: Mock — file never exists (allows upload path to proceed). */
  async fileExists(_siteUrl: string, _libraryName: string, _fileName: string): Promise<boolean> {
    return false;
  }

  /** W0-G1-T02: Mock — logs the group-to-permission-level assignment. */
  async assignGroupToPermissionLevel(
    siteUrl: string,
    entraGroupId: string,
    permissionLevel: string
  ): Promise<void> {
    console.log(
      `[MockSharePoint] Assigned group ${entraGroupId} → ${permissionLevel} on ${siteUrl}`
    );
  }

  async provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean }
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
      diagnostics: [],
    };
  }
}
