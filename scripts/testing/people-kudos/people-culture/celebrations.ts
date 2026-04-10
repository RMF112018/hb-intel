/**
 * Celebrations/milestones workflow — create, persist, lifecycle.
 *
 * Uses the live `People Culture Celebrations` list (GUID b87bf664-…)
 * with field names proven via the CEL_FIELDS constant in
 * peopleCultureListSource.ts. Note: the mangled HomepageEnabled
 * field is `HomepageEnabledGovernanceextensi` on this list.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertDefined } from '../shared/assertions.js';
import { spCreateItem, spGetItem } from '../shared/spClient.js';
import { buildCelebrationFields } from '../shared/fixtures.js';
import { safeTransition } from './helpers.js';

export async function runCelebrationWorkflow(ctx: RunContext, _userId: number): Promise<void> {
  const celList = ctx.config.lists.peopleCultureCelebrations;

  // === Birthday celebration ===
  const seqBday = 15;
  try {
    const fields = buildCelebrationFields(ctx.runId, seqBday, 'birthday-test');
    const item = await spCreateItem(ctx, celList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.cel.birthday.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, celList, item.Id, [
      'Id', 'AnnouncementId', 'PersonDisplayName', 'CelebrationType', 'CelebrationDate', 'HomepageEnabledGovernanceextensi',
    ]);
    assertFieldEquals(ctx, 'pc.cel.birthday.type', 'CelebrationType', fetched.CelebrationType, 'birthday');
    assertFieldEquals(ctx, 'pc.cel.birthday.homepageEnabled', 'HomepageEnabledGovernanceextensi', fetched.HomepageEnabledGovernanceextensi, false);
    assertDefined(ctx, 'pc.cel.birthday.personDisplayName', 'PersonDisplayName', fetched.PersonDisplayName);
    assertDefined(ctx, 'pc.cel.birthday.celebrationDate', 'CelebrationDate', fetched.CelebrationDate);
  } catch (err) {
    recordResult(ctx, { step: 'pc.cel.birthday', status: 'fail', detail: (err as Error).message });
  }

  // === Anniversary celebration with AnniversaryYears ===
  const seqAnniv = 16;
  try {
    const fields = {
      ...buildCelebrationFields(ctx.runId, seqAnniv, 'anniversary-test'),
      CelebrationType: 'anniversary',
      AnniversaryYears: 10,
    };
    const item = await spCreateItem(ctx, celList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.cel.anniversary.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, celList, item.Id, ['Id', 'CelebrationType', 'AnniversaryYears']);
    assertFieldEquals(ctx, 'pc.cel.anniversary.type', 'CelebrationType', fetched.CelebrationType, 'anniversary');
    assertFieldEquals(ctx, 'pc.cel.anniversary.years', 'AnniversaryYears', fetched.AnniversaryYears, 10);
  } catch (err) {
    recordResult(ctx, { step: 'pc.cel.anniversary', status: 'fail', detail: (err as Error).message });
  }

  // === HomepageEnabled lifecycle (mangled field) ===
  const seqLifecycle = 17;
  try {
    const fields = buildCelebrationFields(ctx.runId, seqLifecycle, 'lifecycle-test');
    const item = await spCreateItem(ctx, celList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.cel.lifecycle.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    // Enable
    await safeTransition(ctx, 'pc.cel.lifecycle.enable', celList, item.Id,
      { HomepageEnabledGovernanceextensi: true }, 'HomepageEnabledGovernanceextensi', true);

    // Suppress
    await safeTransition(ctx, 'pc.cel.lifecycle.suppress', celList, item.Id,
      { HomepageEnabledGovernanceextensi: false }, 'HomepageEnabledGovernanceextensi', false);
  } catch (err) {
    recordResult(ctx, { step: 'pc.cel.lifecycle', status: 'fail', detail: (err as Error).message });
  }

  // === Audience tags (Taxonomy — deferred) ===
  recordResult(ctx, {
    step: 'pc.cel.audienceTargeting',
    status: 'warn',
    detail: 'AudienceTags is a Taxonomy field — term-store write deferred; schema presence proven.',
  });

  // === PersonName (UserMulti) ===
  recordResult(ctx, {
    step: 'pc.cel.personName',
    status: 'warn',
    detail: 'PersonName is a UserMulti field — live harness defers multi-person celebrations to ensureUser resolution; read-path extraction proven in peopleCultureListSource.ts mapCelebrations().',
  });

  // === Culture program / event items ===
  recordResult(ctx, {
    step: 'pc.cultureProgramEvent',
    status: 'warn',
    detail: 'cultureProgramEvent content family is defined in peopleCultureSplitContracts.ts but has no dedicated SharePoint list. The contracts type is tested via vitest (peopleCultureSplitModel.test.ts). Live harness coverage blocked until a list or storage model is provisioned.',
  });
}
