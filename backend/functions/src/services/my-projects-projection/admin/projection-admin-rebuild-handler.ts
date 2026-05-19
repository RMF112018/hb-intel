/**
 * Pure (DI-friendly) admin handler for the My Projects projection seed/rebuild/status
 * endpoints. The Azure Functions entry in
 * `functions/myProjectsProjectionAdmin/index.ts` wires production singletons; tests
 * pass in fakes.
 */

import type { HttpRequest, HttpResponseInit } from '@azure/functions';

import type {
  IProjectionAdminRebuildRequest,
  ProjectionAdminRebuildKind,
} from '../projection-admin-contracts.js';
import { isProjectionRunType, isSourceListKind, type SourceListKind } from '../projection-types.js';
import type { IProjectionSeedService, ISeedRunResult } from '../engine/projection-seed-service.js';
import type { IProjectionRunEntity } from '../projection-state-entities.js';

export interface IProjectionAdminRebuildHandlerDeps {
  readonly seedService: IProjectionSeedService;
  readonly runRepository: {
    listRecent(args: {
      runType?: string;
      sourceListKind?: SourceListKind;
      limit: number;
    }): Promise<ReadonlyArray<IProjectionRunEntity>>;
  };
  readonly rebuildLeaseTtlMinutes: number;
  readonly runIdProvider: () => string;
  readonly projectionBatchIdProvider: () => string;
  readonly leaseOwnerProvider: () => string;
}

interface IAdminRebuildBody {
  rebuildKind?: ProjectionAdminRebuildKind;
  sourceListKind?: string;
  dryRun?: boolean;
  notes?: string;
}

export const STATUS_DEFAULT_LIMIT = 10;
export const STATUS_MAX_LIMIT = 50;

export function buildJsonResponse(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function badRequest(message: string): HttpResponseInit {
  return buildJsonResponse(400, { error: { code: 'invalid-request', message } });
}

function isHttpResponse(value: unknown): value is HttpResponseInit {
  return (
    typeof value === 'object' && value !== null && 'status' in (value as Record<string, unknown>)
  );
}

export function buildRebuildRequest(
  body: IAdminRebuildBody,
  defaultKind: ProjectionAdminRebuildKind,
): IProjectionAdminRebuildRequest | HttpResponseInit {
  const rebuildKind = body.rebuildKind ?? defaultKind;
  if (
    rebuildKind !== 'seed' &&
    rebuildKind !== 'full-rebuild' &&
    rebuildKind !== 'source-rebuild'
  ) {
    return badRequest(`Unsupported rebuildKind '${rebuildKind}'.`);
  }
  if (rebuildKind === 'source-rebuild') {
    if (!body.sourceListKind || !isSourceListKind(body.sourceListKind)) {
      return badRequest(
        "source-rebuild requires 'sourceListKind' = 'Projects' | 'LegacyRegistry'.",
      );
    }
    return {
      rebuildKind,
      sourceListKind: body.sourceListKind as SourceListKind,
      ...(typeof body.dryRun === 'boolean' ? { dryRun: body.dryRun } : {}),
      ...(typeof body.notes === 'string' ? { notes: body.notes } : {}),
    };
  }
  return {
    rebuildKind,
    ...(typeof body.dryRun === 'boolean' ? { dryRun: body.dryRun } : {}),
    ...(typeof body.notes === 'string' ? { notes: body.notes } : {}),
  };
}

export function toResponseShape(result: ISeedRunResult): Record<string, unknown> {
  return {
    runId: result.runId,
    runType: result.runType,
    status: result.status,
    startedAtUtc: result.startedAtUtc,
    ...(result.completedAtUtc ? { completedAtUtc: result.completedAtUtc } : {}),
    ...(result.sourceListKind ? { sourceListKind: result.sourceListKind } : {}),
    dryRun: result.dryRun,
    counts: result.counts,
    ...(result.failureCode ? { failureCode: result.failureCode } : {}),
    ...(result.sanitizedReason ? { sanitizedReason: result.sanitizedReason } : {}),
  };
}

async function readJsonBody(request: HttpRequest): Promise<IAdminRebuildBody> {
  try {
    const body = (await request.json()) as IAdminRebuildBody | null;
    return body ?? {};
  } catch {
    return {};
  }
}

export async function handleProjectionSeed(
  request: HttpRequest,
  deps: IProjectionAdminRebuildHandlerDeps,
): Promise<HttpResponseInit> {
  const body = await readJsonBody(request);
  const rebuildRequest = buildRebuildRequest({ ...body, rebuildKind: 'seed' }, 'seed');
  if (isHttpResponse(rebuildRequest)) return rebuildRequest;
  const result = await deps.seedService.runSeedOrRebuild({
    request: rebuildRequest,
    runId: deps.runIdProvider(),
    projectionBatchId: deps.projectionBatchIdProvider(),
    leaseOwner: deps.leaseOwnerProvider(),
    rebuildLeaseTtlMinutes: deps.rebuildLeaseTtlMinutes,
  });
  return buildJsonResponse(result.status === 'failed' ? 500 : 200, toResponseShape(result));
}

export async function handleProjectionRebuild(
  request: HttpRequest,
  deps: IProjectionAdminRebuildHandlerDeps,
): Promise<HttpResponseInit> {
  const body = await readJsonBody(request);
  const rebuildRequest = buildRebuildRequest(body, 'full-rebuild');
  if (isHttpResponse(rebuildRequest)) return rebuildRequest;
  if (rebuildRequest.rebuildKind === 'seed') {
    return badRequest("'seed' rebuildKind must be invoked via /seed, not /rebuild.");
  }
  const result = await deps.seedService.runSeedOrRebuild({
    request: rebuildRequest,
    runId: deps.runIdProvider(),
    projectionBatchId: deps.projectionBatchIdProvider(),
    leaseOwner: deps.leaseOwnerProvider(),
    rebuildLeaseTtlMinutes: deps.rebuildLeaseTtlMinutes,
  });
  return buildJsonResponse(result.status === 'failed' ? 500 : 200, toResponseShape(result));
}

export async function handleProjectionStatus(
  request: HttpRequest,
  deps: Pick<IProjectionAdminRebuildHandlerDeps, 'runRepository'>,
): Promise<HttpResponseInit> {
  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get('limit') ?? STATUS_DEFAULT_LIMIT);
  const limit =
    Number.isInteger(limitParam) && limitParam > 0
      ? Math.min(limitParam, STATUS_MAX_LIMIT)
      : STATUS_DEFAULT_LIMIT;

  const runTypeParam = url.searchParams.get('runType') ?? undefined;
  const sourceListKindParam = url.searchParams.get('sourceListKind') ?? undefined;

  if (runTypeParam !== undefined && !isProjectionRunType(runTypeParam)) {
    return badRequest(`Invalid 'runType' query parameter: '${runTypeParam}'.`);
  }
  if (sourceListKindParam !== undefined && !isSourceListKind(sourceListKindParam)) {
    return badRequest(`Invalid 'sourceListKind' query parameter: '${sourceListKindParam}'.`);
  }

  const recent = await deps.runRepository.listRecent({
    limit,
    ...(runTypeParam ? { runType: runTypeParam } : {}),
    ...(sourceListKindParam ? { sourceListKind: sourceListKindParam } : {}),
  });

  return buildJsonResponse(200, {
    recent: recent.map((entity) => ({
      runId: entity.RunId,
      runType: entity.RunType,
      status: entity.Status,
      startedAtUtc: entity.StartedAtUtc,
      completedAtUtc: entity.CompletedAtUtc ?? null,
      sourceListKind: entity.SourceListKind || null,
      projectionBatchId: entity.ProjectionBatchId || null,
      failureCode: entity.FailureCode || null,
      counts: {
        changedItemCount: entity.ChangedItemCount ?? 0,
        deletedItemCount: entity.DeletedItemCount ?? 0,
        helperRowsInserted: entity.HelperRowsInserted ?? 0,
        helperRowsUpdated: entity.HelperRowsUpdated ?? 0,
        helperRowsReactivated: entity.HelperRowsReactivated ?? 0,
        helperRowsDeactivated: entity.HelperRowsDeactivated ?? 0,
        helperRowsPurged: entity.HelperRowsPurged ?? 0,
      },
    })),
  });
}
