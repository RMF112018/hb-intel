/**
 * My Work Adobe-Sign live read-model provider — B05 remediation Prompt 05.
 *
 * Production implementation that satisfies the Adobe-Sign portion of
 * `IMyWorkReadModelProvider` (`getMyWorkHome` + `getAdobeSignActionQueue`).
 * The operator's `getMyProjectLinks` lives in
 * `MyProjectLinksReadModelProvider` and is composed alongside this
 * provider at the route layer.
 *
 * Boundary guarantees:
 *
 *   - `getAdobeSignActionQueue` is a 1:1 delegation to the existing
 *     `createAdobeSignActionQueueAdapter(...)` orchestrator. No row
 *     bypass, no raw payload passthrough, unsupported-status filtering
 *     preserved, source-handoff URL policy applied where the adapter
 *     was configured for it.
 *   - `getMyWorkHome` calls the adapter exactly once with a bounded
 *     `pageSize: 5` preview query — no per-row detail fan-out. The
 *     resulting envelope's `sourceStatus` and `warnings` propagate to
 *     the home envelope so a degraded outcome is consistent across
 *     both protected My Work routes.
 *   - When the adapter returns any non-`'available'` source status,
 *     the home `summary.totalActionItemCount` comes from the
 *     adapter's bounded summary (which the adapter itself emits as
 *     zero for degraded states) rather than from any synthesized
 *     fallback.
 *
 * @module hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider
 */

import type {
  MyWorkAdobeSignActionQueueQuery,
  MyWorkAdobeSignActionQueueReadModel,
  MyWorkHomeReadModel,
  MyWorkReadModelEnvelope,
} from '@hbc/models/myWork';

import type { IAdobeSignActionQueueAdapter } from './adobe-sign/adobe-sign-action-queue-adapter.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const HOME_PREVIEW_ITEM_LIMIT = 5 as const;

export interface MyWorkAdobeSignLiveReadModelProviderOptions {
  readonly actionQueueAdapter: IAdobeSignActionQueueAdapter;
  /** Defaults to `() => new Date()` so tests can pin `generatedAtUtc`. */
  readonly now?: () => Date;
}

export class MyWorkAdobeSignLiveReadModelProvider {
  private readonly actionQueueAdapter: IAdobeSignActionQueueAdapter;
  private readonly now: () => Date;

  constructor(options: MyWorkAdobeSignLiveReadModelProviderOptions) {
    this.actionQueueAdapter = options.actionQueueAdapter;
    this.now = options.now ?? (() => new Date());
  }

  async getAdobeSignActionQueue(
    context: MyWorkReadContext,
    query: MyWorkAdobeSignActionQueueQuery,
  ): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignActionQueueReadModel>> {
    return this.actionQueueAdapter.getActionQueue(context, query);
  }

  async getMyWorkHome(
    context: MyWorkReadContext,
  ): Promise<MyWorkReadModelEnvelope<MyWorkHomeReadModel>> {
    const queueEnvelope = await this.actionQueueAdapter.getActionQueue(context, {
      pageSize: HOME_PREVIEW_ITEM_LIMIT,
    });

    const data: MyWorkHomeReadModel = {
      actor: context.actor,
      summary: {
        totalActionItemCount: queueEnvelope.data.summary.totalActionItemCount,
      },
      sourceReadiness: [
        {
          sourceSystem: 'adobe-sign',
          sourceStatus: queueEnvelope.sourceStatus,
          warnings: queueEnvelope.warnings,
        },
      ],
      adobeSignActionQueue: {
        summary: queueEnvelope.data.summary,
        previewItems: queueEnvelope.data.items.slice(0, HOME_PREVIEW_ITEM_LIMIT),
        previewItemLimit: HOME_PREVIEW_ITEM_LIMIT,
      },
    };

    return {
      mode: 'backend',
      sourceStatus: queueEnvelope.sourceStatus,
      readOnly: true,
      warnings: queueEnvelope.warnings,
      generatedAtUtc: this.now().toISOString(),
      data,
    };
  }
}
