/**
 * Cleanup helpers — scoped deletion of synthetic test items.
 */
import type { RunContext, StepResult } from './types.js';
import { recordResult } from './assertions.js';
import { spQueryItems, spDeleteItem } from './spClient.js';
import { buildSyntheticKudosId, buildSyntheticPrefix } from '../shared/context.js';

export async function cleanupTestItems(ctx: RunContext): Promise<StepResult[]> {
  const results: StepResult[] = [];
  if (!ctx.config.cleanup) {
    results.push(recordResult(ctx, { step: 'cleanup', status: 'skip', detail: '--no-cleanup: skipped' }));
    return results;
  }
  const prefix = buildSyntheticPrefix(ctx.runId);
  const kudosList = ctx.config.lists.peopleCultureKudos;
  const auditList = ctx.config.lists.kudosAuditEvents;

  try {
    const kudosRows = await spQueryItems(ctx, kudosList, `startswith(KudosId,'${prefix.replace(/'/g, "''")}')`, ['Id', 'KudosId']);
    for (const row of kudosRows) { await spDeleteItem(ctx, kudosList, row.Id); }
    results.push(recordResult(ctx, {
      step: 'cleanup.kudos',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `${ctx.dryRun ? 'would delete' : 'deleted'} ${kudosRows.length} kudos row(s)`,
    }));
  } catch (err) {
    results.push(recordResult(ctx, { step: 'cleanup.kudos', status: 'warn', detail: `cleanup failed: ${(err as Error).message}` }));
  }

  try {
    let deleted = 0;
    for (let seq = 1; seq <= 32; seq++) {
      const kudosId = buildSyntheticKudosId(ctx.runId, seq);
      const filter = `KudosId eq '${kudosId.replace(/'/g, "''")}'`;
      const auditRows = await spQueryItems(ctx, auditList, filter, ['Id']);
      for (const row of auditRows) { await spDeleteItem(ctx, auditList, row.Id); deleted++; }
    }
    results.push(recordResult(ctx, {
      step: 'cleanup.audit',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `${ctx.dryRun ? 'would delete' : 'deleted'} ${deleted} audit row(s)`,
    }));
  } catch (err) {
    results.push(recordResult(ctx, { step: 'cleanup.audit', status: 'warn', detail: `audit cleanup failed: ${(err as Error).message}` }));
  }

  return results;
}
