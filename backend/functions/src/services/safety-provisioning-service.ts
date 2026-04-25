import {
  SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS,
  SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS,
  type ISafetyProvisionContainerDefinition,
} from '../config/safety-record-keeping-list-definitions.js';
import {
  formatSharePointTokenAcquisitionDiagnostic,
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from './managed-identity-token-service.js';
import {
  normalizeGuid,
  normalizeSeedDate,
  toProvisioningErrorCode,
} from './sharepoint-common.js';
import {
  resolveSafetyProvisioningTargets,
  validateReferenceLists,
} from './safety-readiness.js';
import {
  GraphListDiscoveryService,
  type IGraphListDiscoveryService,
} from './graph-list-discovery-service.js';
import {
  SharePointProvisioningService,
  type IFieldDefinition,
  type ISharePointProvisioningService,
} from './sharepoint-provisioning-service.js';
import type {
  ISafetyContainerProvisionResult,
  ISafetyFieldProvisionResult,
  ISafetyProvisionDiagnostic,
  ISafetyRecordKeepingProvisionResult,
  ISafetyReferenceListValidationResult,
  ISafetyReportingPeriodSeedResult,
  SafetyProvisionOutcome,
} from './safety-provisioning-types.js';

/**
 * Seam: Safety provisioning / control-plane.
 *
 * Owns the "should we create / repair / verify Safety containers" decisions
 * and the "seed a current-week reporting period" control-plane action.
 * Composes the SharePoint provisioning seam (for PnP mutations) and the
 * Graph list-discovery seam (for authoritative existence / column checks)
 * instead of carrying those responsibilities itself.
 */
export interface ISafetyProvisioningService {
  provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean },
  ): Promise<ISafetyRecordKeepingProvisionResult>;
  ensureCurrentWeekSafetyReportingPeriod(): Promise<ISafetyReportingPeriodSeedResult>;
}

export class SafetyProvisioningService implements ISafetyProvisioningService {
  private readonly tokenService: IManagedIdentityTokenService;
  private readonly sharePoint: ISharePointProvisioningService;
  private readonly graphDiscovery: IGraphListDiscoveryService;

  constructor(
    tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService(),
    sharePoint: ISharePointProvisioningService = new SharePointProvisioningService(tokenService),
    graphDiscovery: IGraphListDiscoveryService = new GraphListDiscoveryService(),
  ) {
    this.tokenService = tokenService;
    this.sharePoint = sharePoint;
    this.graphDiscovery = graphDiscovery;
    void this.tokenService;
  }

  async provisionSafetyRecordKeepingSharePoint(
    input?: { dryRun?: boolean },
  ): Promise<ISafetyRecordKeepingProvisionResult> {
    const dryRun = input?.dryRun === true;
    const diagnostics: ISafetyProvisionDiagnostic[] = [];
    const containers: ISafetyContainerProvisionResult[] = [];
    const referenceLists: ISafetyReferenceListValidationResult[] = [];
    const targets = resolveSafetyProvisioningTargets(diagnostics);
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

    const referenceValidationFailed = await validateReferenceLists(
      this.graphDiscovery,
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
      (a, b) => a.provisioningOrder - b.provisioningOrder,
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
    const targets = resolveSafetyProvisioningTargets(diagnostics);
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
      const sp: any = await this.sharePoint.openPnPContext(targets.hbCentralSiteUrl);
      const list = sp.web.lists.getByTitle('Safety Reporting Periods');
      const existingItems: any[] = await list.items
        .select('Id', 'Title', 'WeekStartDate', 'WeekEndDate', 'PeriodLabel', 'Status')();

      const matches = existingItems.filter((entry) => {
        const weekStart = normalizeSeedDate(entry?.WeekStartDate);
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

  private async provisionSafetyContainer(
    definition: ISafetyProvisionContainerDefinition,
    dryRun: boolean,
    diagnostics: ISafetyProvisionDiagnostic[],
  ): Promise<ISafetyContainerProvisionResult> {
    const fieldOutcomes: ISafetyFieldProvisionResult[] = [];
    const sp: any = await this.sharePoint.openPnPContext(definition.siteUrl);
    let exists = false;
    try {
      exists =
        definition.kind === 'library'
          ? await this.sharePoint.ensureLibraryExistsDetailed(definition.siteUrl, definition.title)
          : await this.sharePoint.ensureListExistsDetailed(definition.siteUrl, definition.title);
    } catch (err) {
      const errorMessage = formatSharePointTokenAcquisitionDiagnostic(err);
      diagnostics.push({
        code: toProvisioningErrorCode(err, 'CONTAINER_ACCESS_ERROR'),
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
        .select('InternalName', 'TypeAsString', 'Required', 'LookupField', 'LookupList', 'Indexed')();
      existingFieldsByInternalName = new Map(
        existingFields.map((field) => [String(field.InternalName), field]),
      );
    }

    const lookupListIdCache = new Map<string, string>();

    for (const field of definition.fields) {
      if (field.internalName === 'Title' && definition.kind === 'list') {
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
          await this.sharePoint.addListField(list, field as IFieldDefinition, definition.siteUrl);
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
        field as IFieldDefinition,
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

      if (field.indexed === true && Boolean(existing.Indexed) !== true) {
        if (dryRun) {
          fieldOutcomes.push({
            internalName: field.internalName,
            outcome: 'updatedOrRepaired',
            message: 'Dry-run: Indexed would be set to true.',
          });
          if (outcome === 'alreadyExisted') outcome = 'updatedOrRepaired';
          continue;
        }
        try {
          await list.fields
            .getByInternalNameOrTitle(field.internalName)
            .update({ Indexed: true });
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

  private async dryRunSafetyContainersViaApi(
    definitions: ISafetyProvisionContainerDefinition[],
    diagnostics: ISafetyProvisionDiagnostic[],
  ): Promise<ISafetyContainerProvisionResult[]> {
    const results: ISafetyContainerProvisionResult[] = [];
    for (const definition of definitions) {
      try {
        const exists = await this.graphDiscovery.listExists(definition.siteUrl, definition.title);
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
          ? await this.graphDiscovery.getWritableColumnNames(definition.siteUrl, definition.title)
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
          code: toProvisioningErrorCode(err, 'CONTAINER_ACCESS_ERROR'),
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

  private async getFieldCompatibilityError(
    expected: IFieldDefinition,
    actual: any,
    siteUrl: string,
    lookupListIdCache: Map<string, string>,
  ): Promise<string | null> {
    const typeValue = String(actual.TypeAsString ?? '');
    const compatibleTypes = compatibleSharePointTypes(expected.type);
    if (!compatibleTypes.includes(typeValue)) {
      return `Expected type ${expected.type}, found ${typeValue}.`;
    }

    if (expected.type === 'Lookup' && expected.lookupListTitle) {
      const expectedLookupListId = await this.getLookupListId(
        siteUrl,
        expected.lookupListTitle,
        lookupListIdCache,
      );
      const actualLookupListId = normalizeGuid(String(actual.LookupList ?? ''));
      if (!actualLookupListId) {
        return 'Lookup column is missing LookupList binding.';
      }
      if (actualLookupListId !== expectedLookupListId) {
        return `Expected lookup list ${expected.lookupListTitle}, found ${actualLookupListId}.`;
      }
    }

    return null;
  }

  private async getLookupListId(
    siteUrl: string,
    listTitle: string,
    cache: Map<string, string>,
  ): Promise<string> {
    const cacheKey = `${siteUrl}::${listTitle}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const sp: any = await this.sharePoint.openPnPContext(siteUrl);
    const list = await sp.web.lists.getByTitle(listTitle).select('Id')();
    const normalized = normalizeGuid(String(list.Id));
    if (!normalized) {
      throw new Error(`Lookup list ${listTitle} on ${siteUrl} has invalid Id`);
    }
    cache.set(cacheKey, normalized);
    return normalized;
  }

  private bumpCounts(
    outcomes: SafetyProvisionOutcome[],
    counts: ISafetyRecordKeepingProvisionResult['counts'],
  ): void {
    for (const outcome of outcomes) {
      counts[outcome] += 1;
    }
  }
}

function compatibleSharePointTypes(type: IFieldDefinition['type']): string[] {
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
