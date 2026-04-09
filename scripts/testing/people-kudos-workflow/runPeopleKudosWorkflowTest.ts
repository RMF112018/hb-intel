/**
 * Preliminary People & Culture + HB Kudos workflow test harness — runner.
 *
 * Run:
 *   pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --dry-run --verbose
 *   pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live --only-kudos
 *   SHAREPOINT_BEARER_TOKEN=... pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --live
 *   pnpm tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts --only-discover --live
 *
 * Flags:
 *   --dry-run             (default) no writes/reads, logs planned actions
 *   --live                enable live SharePoint writes (requires token)
 *   --only-kudos          run HB Kudos lifecycle flows only
 *   --only-audit          run audit-parity flows only (assumes kudos rows exist)
 *   --only-discover       run --discover for Announcements + Celebrations only
 *   --no-cleanup          skip cleanup of synthetic rows (for debugging)
 *   --verbose             verbose logging
 *   --token <bearer>      explicit bearer token (alternative to env var)
 *   --config <path>       path to JSON config override
 *
 * Required env in --live mode (either-or):
 *   SHAREPOINT_BEARER_TOKEN   preauthorized SharePoint-scoped bearer token
 *   (fallback) Azure CLI preauthorized on SharePoint for the tenant (not
 *   the case in this tenant today — see harness design doc)
 *
 * See also:
 *   docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/
 *     people-kudos-preliminary-workflow-test-harness.md
 *     people-kudos-preliminary-workflow-test-matrix.md
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  type HarnessConfig,
  type RunContext,
  type StepResult,
  assertFieldEquals,
  buildKudosApprovalPatch,
  buildKudosCelebratePatch,
  buildKudosDraftFields,
  buildKudosFeaturePatch,
  buildKudosPinPatch,
  buildKudosRejectPatch,
  buildKudosRemovePatch,
  buildKudosRestorePatch,
  buildKudosRevisionRequestedPatch,
  buildKudosSchedulePatch,
  buildKudosVisibilityPatch,
  buildKudosWithdrawPatch,
  buildSyntheticKudosId,
  cleanupTestItems,
  createAuditEvent,
  createKudosItem,
  createTokenSource,
  discoverListSchema,
  ensureCurrentUserId,
  generateRunId,
  getKudosItem,
  patchKudosItem,
  printSummary,
  queryAuditByKudosId,
  recordResult,
} from './peopleKudosWorkflowHelpers.js';

/* ─── CLI parsing ─────────────────────────────────────────────────────── */

interface CliArgs {
  dryRun: boolean;
  onlyKudos: boolean;
  onlyAudit: boolean;
  onlyDiscover: boolean;
  cleanup: boolean;
  verbose: boolean;
  token?: string;
  configPath?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dryRun: true,
    onlyKudos: false,
    onlyAudit: false,
    onlyDiscover: false,
    cleanup: true,
    verbose: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case '--dry-run':
        args.dryRun = true;
        break;
      case '--live':
        args.dryRun = false;
        break;
      case '--only-kudos':
        args.onlyKudos = true;
        break;
      case '--only-audit':
        args.onlyAudit = true;
        break;
      case '--only-discover':
        args.onlyDiscover = true;
        break;
      case '--no-cleanup':
        args.cleanup = false;
        break;
      case '--verbose':
        args.verbose = true;
        break;
      case '--token':
        args.token = argv[++i];
        break;
      case '--config':
        args.configPath = argv[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      // eslint-disable-next-line no-fallthrough
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown flag: ${arg}`);
          printHelp();
          process.exit(2);
        }
    }
  }
  return args;
}

function printHelp(): void {
  console.log(`
Preliminary People & Culture + HB Kudos workflow test harness

Usage:
  tsx scripts/testing/people-kudos-workflow/runPeopleKudosWorkflowTest.ts [flags]

Flags:
  --dry-run             (default) no writes, logs intended actions
  --live                enable live SharePoint writes (requires token)
  --only-kudos          HB Kudos lifecycle flows only
  --only-audit          audit-parity flows only
  --only-discover       schema discovery for Announcements + Celebrations
  --no-cleanup          skip synthetic-row cleanup (for debugging)
  --verbose             verbose per-step logging
  --token <bearer>      explicit SharePoint bearer token
  --config <path>       path to JSON config overrides
  --help, -h            this help
`);
}

/* ─── Config ──────────────────────────────────────────────────────────── */

const DEFAULT_CONFIG: HarnessConfig = {
  siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
  lists: {
    peopleCultureKudos: 'People Culture Kudos',
    kudosAuditEvents: 'Kudos Audit Events',
    peopleCultureAnnouncements: 'People Culture Announcements',
    peopleCultureCelebrations: 'People Culture Celebrations',
  },
  testPrefix: 'TEST-HBI',
  cleanup: true,
  auditParity: true,
  docsDir: resolve(
    process.cwd(),
    'docs/architecture/plans/MASTER/spfx/homepage/people/phase-14',
  ),
};

function loadConfig(cliArgs: CliArgs): HarnessConfig {
  let cfg = { ...DEFAULT_CONFIG, cleanup: cliArgs.cleanup };
  if (cliArgs.configPath) {
    const overridesRaw = readFileSync(resolve(cliArgs.configPath), 'utf8');
    const overrides = JSON.parse(overridesRaw) as Partial<HarnessConfig>;
    cfg = {
      ...cfg,
      ...overrides,
      lists: { ...cfg.lists, ...(overrides.lists ?? {}) },
    };
  }
  return cfg;
}

/* ─── HB Kudos lifecycle ──────────────────────────────────────────────── */

async function runKudosLifecycle(ctx: RunContext): Promise<void> {
  console.log('');
  console.log('--- HB Kudos lifecycle ---');

  // Resolve current user id once (used by every User field).
  let currentUserId: number | undefined;
  if (!ctx.dryRun) {
    try {
      currentUserId = await ensureCurrentUserId(ctx);
      recordResult(ctx, {
        step: 'kudos.ensureCurrentUser',
        status: 'pass',
        detail: `currentUserId=${currentUserId}`,
      });
    } catch (err) {
      recordResult(ctx, {
        step: 'kudos.ensureCurrentUser',
        status: 'fail',
        detail: `failed to resolve currentUser: ${(err as Error).message}`,
      });
      return;
    }
  } else {
    currentUserId = 0;
    recordResult(ctx, {
      step: 'kudos.ensureCurrentUser',
      status: 'dry',
      detail: 'dry-run: using synthetic userId=0',
    });
  }

  // --- Item A: happy path (submit → revisionRequested → resubmit → approve → schedule → pin → feature → remove → restore) ---
  const seqA = 1;
  const kudosIdA = buildSyntheticKudosId(ctx.runId, seqA);

  // 1. Submit
  let itemA: { Id: number } & Record<string, unknown>;
  try {
    const draft = buildKudosDraftFields(ctx.runId, seqA, {
      submittedByUserId: currentUserId,
    });
    itemA = await createKudosItem(ctx, draft);
    recordResult(ctx, {
      step: 'kudos.submit',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `itemId=${itemA.Id} kudosId=${kudosIdA}`,
    });

    // Verify persistence.
    const fetched = await getKudosItem<Record<string, unknown>>(ctx, itemA.Id, [
      'Id',
      'KudosId',
      'Headline',
      'Excerpt',
      'WorkflowStatus',
      'HomepageEnabled',
      'IsPinned',
      'WasEverPublished',
      'CelebrateCount',
    ]);
    assertFieldEquals(ctx, 'kudos.submit.persist.kudosId', 'KudosId', fetched.KudosId, kudosIdA);
    assertFieldEquals(
      ctx,
      'kudos.submit.persist.workflowStatus',
      'WorkflowStatus',
      fetched.WorkflowStatus,
      'pending',
    );
  } catch (err) {
    recordResult(ctx, {
      step: 'kudos.submit',
      status: 'fail',
      detail: (err as Error).message,
    });
    return; // Cannot proceed without item A.
  }

  // 2. Taxonomy recipients WARN
  recordResult(ctx, {
    step: 'kudos.recipients.taxonomy.warn',
    status: 'warn',
    detail:
      'TeamRecipients/DepartmentRecipients/ProjectGroupRecipients are Taxonomy fields — term-store resolution is out of scope for this preliminary harness; field presence only is asserted via schema doc.',
  });

  // 3. Revision requested
  await safeTransition(
    ctx,
    'kudos.revisionRequested',
    itemA.Id,
    buildKudosRevisionRequestedPatch(
      currentUserId ?? 0,
      'Please clarify the recipient list before resubmitting.',
    ),
    'WorkflowStatus',
    'revisionRequested',
  );

  // 4. Resubmit (back to pending)
  await safeTransition(
    ctx,
    'kudos.resubmit',
    itemA.Id,
    { WorkflowStatus: 'pending' },
    'WorkflowStatus',
    'pending',
  );

  // 5. Approve
  await safeTransition(
    ctx,
    'kudos.approve',
    itemA.Id,
    buildKudosApprovalPatch(currentUserId ?? 0),
    'WorkflowStatus',
    'approved',
  );

  // 6. Schedule
  const scheduledAt = new Date(Date.now() + 2 * 3_600_000).toISOString();
  await safeTransition(
    ctx,
    'kudos.schedule',
    itemA.Id,
    buildKudosSchedulePatch(scheduledAt, currentUserId ?? 0),
    'WorkflowStatus',
    'approvedScheduled',
  );

  // 7. Back to approved (unschedule as a simple field update)
  await safeTransition(
    ctx,
    'kudos.unschedule',
    itemA.Id,
    { WorkflowStatus: 'approved', IsScheduled: false, ScheduleCancelledAt: new Date().toISOString(), ScheduleCancelledById: currentUserId ?? 0 },
    'WorkflowStatus',
    'approved',
  );

  // 8. Pin
  await safeTransition(
    ctx,
    'kudos.pin',
    itemA.Id,
    buildKudosPinPatch(1),
    'IsPinned',
    true,
  );

  // 9. Feature
  const featureExpiresAt = new Date(Date.now() + 7 * 24 * 3_600_000).toISOString();
  await safeTransition(
    ctx,
    'kudos.feature',
    itemA.Id,
    buildKudosFeaturePatch(featureExpiresAt),
    'IsFeatured',
    true,
  );

  // 10. Publish window + HomepageEnabled
  await safeTransition(
    ctx,
    'kudos.publishWindow',
    itemA.Id,
    {
      HomepageEnabled: true,
      WasEverPublished: true,
      PublishStartDate: new Date(Date.now() - 60_000).toISOString(),
      PublishEndDate: new Date(Date.now() + 14 * 24 * 3_600_000).toISOString(),
    },
    'HomepageEnabled',
    true,
  );

  // 11. Celebrate count increment
  try {
    const before = await getKudosItem<{ CelebrateCount?: number }>(ctx, itemA.Id, [
      'Id',
      'CelebrateCount',
    ]);
    const nextCount = (before.CelebrateCount ?? 0) + 1;
    await patchKudosItem(ctx, itemA.Id, buildKudosCelebratePatch(nextCount));
    const after = await getKudosItem<{ CelebrateCount?: number }>(ctx, itemA.Id, [
      'Id',
      'CelebrateCount',
    ]);
    assertFieldEquals(
      ctx,
      'kudos.celebrateCountIncrement',
      'CelebrateCount',
      after.CelebrateCount,
      nextCount,
    );
    recordResult(ctx, {
      step: 'kudos.celebrateCountIncrement.raceWarn',
      status: 'warn',
      detail:
        'read-modify-write on CelebrateCount is racy without ETag handling; document before production use.',
    });
  } catch (err) {
    recordResult(ctx, {
      step: 'kudos.celebrateCountIncrement',
      status: 'fail',
      detail: (err as Error).message,
    });
  }

  // 12. Visibility mode transitions
  for (const mode of ['public', 'associatedOnly', 'internalOnly', 'public'] as const) {
    await safeTransition(
      ctx,
      `kudos.visibility.${mode}`,
      itemA.Id,
      buildKudosVisibilityPatch(mode),
      'CurrentVisibilityMode',
      mode,
    );
  }

  // 13. Remove
  await safeTransition(
    ctx,
    'kudos.remove',
    itemA.Id,
    buildKudosRemovePatch(currentUserId ?? 0, 'Synthetic remove for harness verification.'),
    'WorkflowStatus',
    'removedUnpublished',
  );

  // 14. Restore
  await safeTransition(
    ctx,
    'kudos.restore',
    itemA.Id,
    buildKudosRestorePatch(currentUserId ?? 0),
    'WorkflowStatus',
    'approved',
  );

  // --- Item B: rejection path ---
  const seqB = 2;
  try {
    const draftB = buildKudosDraftFields(ctx.runId, seqB, {
      submittedByUserId: currentUserId,
    });
    const itemB = await createKudosItem(ctx, draftB);
    recordResult(ctx, {
      step: 'kudos.reject.submit',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `itemId=${itemB.Id}`,
    });
    await safeTransition(
      ctx,
      'kudos.reject',
      itemB.Id,
      buildKudosRejectPatch(currentUserId ?? 0, 'Synthetic reject for harness verification.'),
      'WorkflowStatus',
      'rejected',
    );
  } catch (err) {
    recordResult(ctx, {
      step: 'kudos.reject',
      status: 'fail',
      detail: (err as Error).message,
    });
  }

  // --- Item C: withdraw path ---
  const seqC = 3;
  try {
    const draftC = buildKudosDraftFields(ctx.runId, seqC, {
      submittedByUserId: currentUserId,
    });
    const itemC = await createKudosItem(ctx, draftC);
    recordResult(ctx, {
      step: 'kudos.withdraw.submit',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `itemId=${itemC.Id}`,
    });
    await safeTransition(
      ctx,
      'kudos.withdraw',
      itemC.Id,
      buildKudosWithdrawPatch(currentUserId ?? 0),
      'WorkflowStatus',
      'withdrawn',
    );
  } catch (err) {
    recordResult(ctx, {
      step: 'kudos.withdraw',
      status: 'fail',
      detail: (err as Error).message,
    });
  }
}

async function safeTransition(
  ctx: RunContext,
  step: string,
  itemId: number,
  patch: Record<string, unknown>,
  assertField: string,
  expected: unknown,
): Promise<void> {
  try {
    await patchKudosItem(ctx, itemId, patch);
    const after = await getKudosItem<Record<string, unknown>>(ctx, itemId, [
      'Id',
      assertField,
    ]);
    assertFieldEquals(ctx, step, assertField, after[assertField], expected);
  } catch (err) {
    recordResult(ctx, { step, status: 'fail', detail: (err as Error).message });
  }
}

/* ─── Audit parity ────────────────────────────────────────────────────── */

async function runAuditParity(ctx: RunContext): Promise<void> {
  console.log('');
  console.log('--- Kudos Audit Events parity ---');

  if (!ctx.config.auditParity) {
    recordResult(ctx, {
      step: 'audit.parity',
      status: 'skip',
      detail: 'auditParity=false in config',
    });
    return;
  }

  recordResult(ctx, {
    step: 'audit.parity.indexWarn',
    status: 'warn',
    detail:
      'Kudos Audit Events `KudosId` column is NOT indexed in the live schema — queries may throttle at scale.',
  });

  const currentUserId = ctx.currentUserId ?? 0;
  const now = new Date().toISOString();
  const targetKudosId = buildSyntheticKudosId(ctx.runId, 1);

  const audited: Array<{ eventType: Parameters<typeof createAuditEvent>[1]['eventType'] }> = [
    { eventType: 'submit' },
    { eventType: 'revisionRequested' },
    { eventType: 'reopen' },
    { eventType: 'approve' },
    { eventType: 'schedule' },
    { eventType: 'unschedule' },
    { eventType: 'pin' },
    { eventType: 'feature' },
    { eventType: 'celebrate' },
    { eventType: 'remove' },
    { eventType: 'restore' },
  ];

  for (const ev of audited) {
    try {
      const result = await createAuditEvent(ctx, {
        kudosId: targetKudosId,
        eventType: ev.eventType,
        actorId: currentUserId || undefined,
        eventAtIso: now,
        oldValue: { ...stateForType(ev.eventType, 'old') },
        newValue: { ...stateForType(ev.eventType, 'new') },
        internalNote: `runId=${ctx.runId} preliminary audit parity`,
      });
      recordResult(ctx, {
        step: `audit.create.${ev.eventType}`,
        status: ctx.dryRun ? 'dry' : 'pass',
        detail: `auditId=${result.Id}`,
      });
    } catch (err) {
      recordResult(ctx, {
        step: `audit.create.${ev.eventType}`,
        status: 'fail',
        detail: (err as Error).message,
      });
    }
  }

  // Query back and verify count parity.
  try {
    const rows = await queryAuditByKudosId(ctx, targetKudosId);
    recordResult(ctx, {
      step: 'audit.query.byKudosId',
      status: ctx.dryRun ? 'dry' : 'pass',
      detail: `${rows.length} row(s) returned for kudosId=${targetKudosId}`,
    });
  } catch (err) {
    recordResult(ctx, {
      step: 'audit.query.byKudosId',
      status: 'fail',
      detail: (err as Error).message,
    });
  }
}

function stateForType(
  eventType: string,
  side: 'old' | 'new',
): Record<string, unknown> {
  return { eventType, side, at: new Date().toISOString() };
}

/* ─── Discover ────────────────────────────────────────────────────────── */

async function runDiscover(ctx: RunContext): Promise<void> {
  console.log('');
  console.log('--- Schema discovery (Announcements + Celebrations) ---');
  for (const [title, slug] of [
    [ctx.config.lists.peopleCultureAnnouncements, 'people-culture-announcements'],
    [ctx.config.lists.peopleCultureCelebrations, 'people-culture-celebrations'],
  ] as Array<[string, string]>) {
    try {
      const path = await discoverListSchema(ctx, title, slug);
      recordResult(ctx, {
        step: `discover.${slug}`,
        status: ctx.dryRun ? 'dry' : 'pass',
        detail: path ? `wrote ${path}` : 'dry-run: would write to phase-14/',
      });
    } catch (err) {
      recordResult(ctx, {
        step: `discover.${slug}`,
        status: 'fail',
        detail: (err as Error).message,
      });
    }
  }
}

/* ─── Main ────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const cliArgs = parseArgs(process.argv.slice(2));
  const config = loadConfig(cliArgs);
  const runId = generateRunId();

  const ctx: RunContext = {
    config,
    runId,
    dryRun: cliArgs.dryRun,
    verbose: cliArgs.verbose,
    getToken: createTokenSource({ siteUrl: config.siteUrl, explicitToken: cliArgs.token }),
    createdKudosItemIds: [],
    createdAuditItemIds: [],
    results: [],
  };

  console.log('');
  console.log('==== Phase-14 People + Culture / HB Kudos workflow test harness ====');
  console.log(`runId:    ${runId}`);
  console.log(`site:     ${config.siteUrl}`);
  console.log(`mode:     ${cliArgs.dryRun ? 'DRY-RUN (no writes)' : 'LIVE (writes enabled)'}`);
  console.log(
    `scope:    ${
      cliArgs.onlyDiscover
        ? 'discover-only'
        : cliArgs.onlyAudit
          ? 'audit-only'
          : cliArgs.onlyKudos
            ? 'kudos-only'
            : 'kudos + audit + discover'
    }`,
  );
  console.log(`cleanup:  ${config.cleanup}`);
  console.log('====================================================================');

  try {
    if (cliArgs.onlyDiscover) {
      await runDiscover(ctx);
    } else {
      if (!cliArgs.onlyAudit) await runKudosLifecycle(ctx);
      if (!cliArgs.onlyKudos) await runAuditParity(ctx);
      if (!cliArgs.onlyKudos && !cliArgs.onlyAudit) await runDiscover(ctx);
    }
  } catch (err) {
    recordResult(ctx, {
      step: 'harness.topLevel',
      status: 'fail',
      detail: (err as Error).message,
    });
  }

  // Cleanup always runs (unless --no-cleanup); it is a no-op if
  // nothing was created (dry-run).
  try {
    await cleanupTestItems(ctx);
  } catch (err) {
    recordResult(ctx, {
      step: 'cleanup.topLevel',
      status: 'warn',
      detail: (err as Error).message,
    });
  }

  printSummary(ctx);

  const hasFailures = ctx.results.some((r: StepResult) => r.status === 'fail');
  process.exitCode = hasFailures ? 1 : 0;
}

main().catch((err) => {
  console.error('Fatal harness error:', err);
  process.exitCode = 1;
});
