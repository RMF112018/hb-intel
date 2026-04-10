/**
 * Shared transition helper for the kudos suite.
 */
import type { RunContext } from '../shared/types.js';
import { assertFieldEquals } from '../shared/assertions.js';
import { spPatchItem, spGetItem } from '../shared/spClient.js';
import { recordResult } from '../shared/assertions.js';

export async function safeTransition(
  ctx: RunContext,
  step: string,
  listTitle: string,
  itemId: number,
  patch: Record<string, unknown>,
  assertField: string,
  expected: unknown,
): Promise<void> {
  try {
    await spPatchItem(ctx, listTitle, itemId, patch);
    const after = await spGetItem<Record<string, unknown>>(ctx, listTitle, itemId, ['Id', assertField]);
    assertFieldEquals(ctx, step, assertField, after[assertField], expected);
  } catch (err) {
    recordResult(ctx, { step, status: 'fail', detail: (err as Error).message });
  }
}
