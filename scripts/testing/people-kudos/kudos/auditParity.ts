/**
 * Kudos audit-event linkage and traceability workflow.
 */
import type { RunContext, KudosEventType } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertTruthy } from '../shared/assertions.js';
import { spCreateItem, spQueryItems } from '../shared/spClient.js';
import { buildSyntheticKudosId, buildSyntheticHeadline } from '../shared/context.js';

interface AuditRow { Id: number; EventType: string; EventAt: string; KudosId: string }

export async function runAuditParityWorkflow(ctx: RunContext, userId: number): Promise<void> {
  const auditList = ctx.config.lists.kudosAuditEvents;
  const seq = 9;
  const kudosId = buildSyntheticKudosId(ctx.runId, seq);

  // Create a set of audit events covering the major event types and
  // verify they can be queried back by KudosId.
  const eventTypes: KudosEventType[] = [
    'submit', 'approve', 'reject', 'revisionRequested', 'reopen',
    'schedule', 'unschedule', 'pin', 'feature', 'celebrate',
    'remove', 'restore',
  ];

  for (const eventType of eventTypes) {
    try {
      const body: Record<string, unknown> = {
        Title: buildSyntheticHeadline(ctx.runId, seq, `audit-${eventType}`),
        KudosId: kudosId,
        EventType: eventType,
        EventAt: new Date().toISOString(),
        InternalNote: `runId=${ctx.runId} synthetic audit event (${eventType})`,
      };
      if (userId > 0) body.ActorId = userId;

      const item = await spCreateItem(ctx, auditList, body);
      if (!ctx.dryRun) ctx.createdAuditItemIds.push(item.Id);
      recordResult(ctx, {
        step: `kudos.audit.create.${eventType}`,
        status: ctx.dryRun ? 'dry' : 'pass',
        detail: `auditId=${item.Id}`,
      });
    } catch (err) {
      recordResult(ctx, {
        step: `kudos.audit.create.${eventType}`,
        status: 'fail',
        detail: (err as Error).message,
      });
    }
  }

  // Query all audit events back by KudosId and verify count.
  try {
    const filter = `KudosId eq '${kudosId.replace(/'/g, "''")}'`;
    const rows = await spQueryItems<AuditRow>(
      ctx, auditList, filter,
      ['Id', 'KudosId', 'EventType', 'EventAt'],
    );
    assertFieldEquals(ctx, 'kudos.audit.query.count', 'row count', rows.length, eventTypes.length);

    // Verify each expected event type is present in the result set.
    const foundTypes = new Set(rows.map((r) => r.EventType));
    for (const expected of eventTypes) {
      assertTruthy(ctx, `kudos.audit.query.has.${expected}`, `EventType=${expected}`, foundTypes.has(expected));
    }
  } catch (err) {
    recordResult(ctx, {
      step: 'kudos.audit.query',
      status: ctx.dryRun ? 'dry' : 'fail',
      detail: (err as Error).message,
    });
  }
}
