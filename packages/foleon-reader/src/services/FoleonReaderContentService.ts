import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonPlacementRecord } from '../types/foleon-placement.types.js';
import type { FoleonGateReason } from '../types/foleon-runtime.types.js';
import type { FoleonReaderModuleConfig } from '../readers/readerConfigs.js';
import type { FoleonOriginPolicy } from './FoleonOriginPolicy.js';
import { evaluateFoleonReaderGate } from './FoleonReaderGate.js';
import { fetchFoleonContent } from './FoleonContentService.js';
import { fetchFoleonPlacements } from './FoleonPlacementService.js';

export type FoleonReaderResolutionWarning =
  | 'placement-not-found'
  | 'placement-stale'
  | 'placement-content-mismatch'
  | 'multiple-active-editions'
  | 'reader-key-mismatch'
  | 'content-type-mismatch';

export type FoleonReaderResolution =
  | {
      readonly kind: 'ready';
      readonly config: FoleonReaderModuleConfig;
      readonly record: FoleonContentRecord;
      readonly embedUrl: string;
      readonly warnings: ReadonlyArray<FoleonReaderResolutionWarning>;
    }
  | {
      readonly kind: 'preview';
      readonly config: FoleonReaderModuleConfig;
      readonly reason: 'no-active-record';
      readonly warnings: ReadonlyArray<FoleonReaderResolutionWarning>;
    }
  | {
      readonly kind: 'blocked';
      readonly config: FoleonReaderModuleConfig;
      readonly record: FoleonContentRecord;
      readonly reason: FoleonGateReason | 'reader-key-mismatch' | 'content-type-mismatch';
      readonly warnings: ReadonlyArray<FoleonReaderResolutionWarning>;
    }
  | {
      readonly kind: 'error';
      readonly config: FoleonReaderModuleConfig;
      readonly reason: string;
      readonly warnings: ReadonlyArray<FoleonReaderResolutionWarning>;
    };

export interface FoleonReaderContentQueryParams {
  readonly siteUrl: string;
  readonly contentRegistryListId: string;
  readonly placementsListId?: string;
  readonly config: FoleonReaderModuleConfig;
  readonly originPolicy: FoleonOriginPolicy;
  readonly now?: Date;
  readonly signal?: AbortSignal;
}

export async function resolveFoleonReaderContent(
  params: FoleonReaderContentQueryParams,
): Promise<FoleonReaderResolution> {
  const warnings = new Set<FoleonReaderResolutionWarning>();
  const { config } = params;
  try {
    const candidates = await fetchFoleonContent({
      siteUrl: params.siteUrl,
      contentRegistryListId: params.contentRegistryListId,
      readerKey: config.readerKey,
      activeEditionOnly: true,
      publishedOnly: true,
      homepageEligibleOnly: true,
      top: 25,
      signal: params.signal,
    });
    const configCandidates = candidates.filter((candidate) =>
      isConfigConsistent(candidate, config, warnings)
    );

    const placementRecord = params.placementsListId
      ? await resolvePlacementCandidate(params, candidates, warnings)
      : undefined;
    const selected = placementRecord ?? chooseActiveEditionCandidate(configCandidates, warnings);

    if (!selected) {
      return {
        kind: 'preview',
        config,
        reason: 'no-active-record',
        warnings: [...warnings],
      };
    }

    const consistencyBlock = selectedRecordConsistencyBlock(selected, config, warnings);
    if (consistencyBlock) {
      return {
        kind: 'blocked',
        config,
        record: selected,
        reason: consistencyBlock,
        warnings: [...warnings],
      };
    }

    const gate = evaluateFoleonReaderGate(selected, params.originPolicy, params.now);
    if (!gate.allowed) {
      return {
        kind: 'blocked',
        config,
        record: selected,
        reason: gate.reason,
        warnings: [...warnings],
      };
    }

    return {
      kind: 'ready',
      config,
      record: selected,
      embedUrl: gate.embedUrl!,
      warnings: [...warnings],
    };
  } catch (error) {
    return {
      kind: 'error',
      config,
      reason: error instanceof Error ? error.message : String(error),
      warnings: [...warnings],
    };
  }
}

async function resolvePlacementCandidate(
  params: FoleonReaderContentQueryParams,
  candidates: ReadonlyArray<FoleonContentRecord>,
  warnings: Set<FoleonReaderResolutionWarning>,
): Promise<FoleonContentRecord | undefined> {
  const placements = await fetchFoleonPlacements({
    siteUrl: params.siteUrl,
    placementsListId: params.placementsListId!,
    activeOnly: true,
    top: 25,
    signal: params.signal,
  });
  const matchingPlacement = placements.find((placement) => placement.placementKey === params.config.placementKey);
  if (!matchingPlacement) {
    warnings.add('placement-not-found');
    return undefined;
  }
  const resolved = resolveCandidateFromPlacement(matchingPlacement, candidates);
  if (!resolved) {
    warnings.add('placement-stale');
    return undefined;
  }
  if (resolved.readerKey !== params.config.readerKey || resolved.contentTypeKey !== params.config.contentTypeKey) {
    warnings.add('placement-content-mismatch');
    return undefined;
  }
  return resolved;
}

function resolveCandidateFromPlacement(
  placement: FoleonPlacementRecord,
  candidates: ReadonlyArray<FoleonContentRecord>,
): FoleonContentRecord | undefined {
  return candidates.find((candidate) =>
    candidate.foleonDocId === placement.contentIdCache ||
    candidate.id === placement.contentLookupId
  );
}

function chooseActiveEditionCandidate(
  candidates: ReadonlyArray<FoleonContentRecord>,
  warnings: Set<FoleonReaderResolutionWarning>,
): FoleonContentRecord | undefined {
  if (candidates.length > 1) warnings.add('multiple-active-editions');
  return [...candidates].sort(compareReaderCandidate)[0];
}

function compareReaderCandidate(a: FoleonContentRecord, b: FoleonContentRecord): number {
  return dateValue(b.lastEditorialUpdate) - dateValue(a.lastEditorialUpdate) ||
    dateValue(b.publishedOn) - dateValue(a.publishedOn) ||
    dateValue(b.issueDate) - dateValue(a.issueDate) ||
    a.id - b.id;
}

function dateValue(value: string | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isConfigConsistent(
  record: FoleonContentRecord,
  config: FoleonReaderModuleConfig,
  warnings: Set<FoleonReaderResolutionWarning>,
): boolean {
  const readerMatches = record.readerKey === config.readerKey;
  const contentTypeMatches = record.contentTypeKey === config.contentTypeKey;
  if (!readerMatches) warnings.add('reader-key-mismatch');
  if (!contentTypeMatches) warnings.add('content-type-mismatch');
  return readerMatches && contentTypeMatches;
}

function selectedRecordConsistencyBlock(
  record: FoleonContentRecord,
  config: FoleonReaderModuleConfig,
  warnings: Set<FoleonReaderResolutionWarning>,
): 'reader-key-mismatch' | 'content-type-mismatch' | undefined {
  if (record.readerKey !== config.readerKey) {
    warnings.add('reader-key-mismatch');
    return 'reader-key-mismatch';
  }
  if (record.contentTypeKey !== config.contentTypeKey) {
    warnings.add('content-type-mismatch');
    return 'content-type-mismatch';
  }
  return undefined;
}
