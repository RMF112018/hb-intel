/**
 * Announcements workflow — create, persist, lifecycle transitions.
 *
 * Uses the live `People Culture Announcements` list (GUID 2cd191fc-…)
 * with field names proven via the extracted schema report and the
 * ANN_FIELDS constant in peopleCultureListSource.ts.
 */
import type { RunContext } from '../shared/types.js';
import { recordResult, assertFieldEquals, assertDefined } from '../shared/assertions.js';
import { spCreateItem, spGetItem } from '../shared/spClient.js';
import { buildAnnouncementFields } from '../shared/fixtures.js';
import { buildSyntheticKudosId, buildSyntheticHeadline } from '../shared/context.js';
import { safeTransition } from './helpers.js';

export async function runAnnouncementWorkflow(ctx: RunContext, _userId: number): Promise<void> {
  const annList = ctx.config.lists.peopleCultureAnnouncements;

  // === Announcement type: promotion ===
  const seq = 10;
  try {
    const fields = buildAnnouncementFields(ctx.runId, seq, 'promotion-test');
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id); // reuse cleanup array
    recordResult(ctx, { step: 'pc.ann.promotion.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, [
      'Id', 'AnnouncementId', 'PersonDisplayName', 'AnnouncementType', 'Headline', 'Summary', 'HomepageEnabled',
    ]);
    assertFieldEquals(ctx, 'pc.ann.promotion.type', 'AnnouncementType', fetched.AnnouncementType, 'promotion');
    assertFieldEquals(ctx, 'pc.ann.promotion.homepageEnabled', 'HomepageEnabled', fetched.HomepageEnabled, false);
    assertDefined(ctx, 'pc.ann.promotion.headline', 'Headline', fetched.Headline);
    assertDefined(ctx, 'pc.ann.promotion.summary', 'Summary', fetched.Summary);
    assertDefined(ctx, 'pc.ann.promotion.personDisplayName', 'PersonDisplayName', fetched.PersonDisplayName);
  } catch (err) {
    recordResult(ctx, { step: 'pc.ann.promotion', status: 'fail', detail: (err as Error).message });
  }

  // === Announcement type: newHire ===
  const seqHire = 11;
  try {
    const fields = {
      ...buildAnnouncementFields(ctx.runId, seqHire, 'newhire-test'),
      AnnouncementType: 'newHire',
    };
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.ann.newHire.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, ['Id', 'AnnouncementType']);
    assertFieldEquals(ctx, 'pc.ann.newHire.type', 'AnnouncementType', fetched.AnnouncementType, 'newHire');
  } catch (err) {
    recordResult(ctx, { step: 'pc.ann.newHire', status: 'fail', detail: (err as Error).message });
  }

  // === HomepageEnabled toggle (draft → live → suppressed) ===
  const seqLifecycle = 12;
  try {
    const fields = buildAnnouncementFields(ctx.runId, seqLifecycle, 'lifecycle-test');
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.ann.lifecycle.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    // Enable for homepage
    await safeTransition(ctx, 'pc.ann.lifecycle.enable', annList, item.Id,
      { HomepageEnabled: true }, 'HomepageEnabled', true);

    // Suppress (disable)
    await safeTransition(ctx, 'pc.ann.lifecycle.suppress', annList, item.Id,
      { HomepageEnabled: false }, 'HomepageEnabled', false);
  } catch (err) {
    recordResult(ctx, { step: 'pc.ann.lifecycle', status: 'fail', detail: (err as Error).message });
  }

  // === Display date window ===
  const seqWindow = 13;
  try {
    const now = new Date();
    const fields = {
      ...buildAnnouncementFields(ctx.runId, seqWindow, 'window-test'),
      StartDisplayDate: new Date(now.getTime() - 60_000).toISOString(),
      EndDisplayDate: new Date(now.getTime() + 7 * 24 * 3_600_000).toISOString(),
    };
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.ann.window.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, ['Id', 'StartDisplayDate', 'EndDisplayDate']);
    assertDefined(ctx, 'pc.ann.window.startDate', 'StartDisplayDate', fetched.StartDisplayDate);
    assertDefined(ctx, 'pc.ann.window.endDate', 'EndDisplayDate', fetched.EndDisplayDate);
  } catch (err) {
    recordResult(ctx, { step: 'pc.ann.window', status: 'fail', detail: (err as Error).message });
  }

  // === Pin + priority override ===
  const seqPin = 14;
  try {
    const fields = {
      ...buildAnnouncementFields(ctx.runId, seqPin, 'pin-test'),
      IsPinned: true,
      PriorityOverride: 5,
    };
    const item = await spCreateItem(ctx, annList, fields);
    if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
    recordResult(ctx, { step: 'pc.ann.pin.create', status: ctx.dryRun ? 'dry' : 'pass', detail: `itemId=${item.Id}` });

    const fetched = await spGetItem<Record<string, unknown>>(ctx, annList, item.Id, ['Id', 'IsPinned', 'PriorityOverride']);
    assertFieldEquals(ctx, 'pc.ann.pin.isPinned', 'IsPinned', fetched.IsPinned, true);
    assertFieldEquals(ctx, 'pc.ann.pin.priority', 'PriorityOverride', fetched.PriorityOverride, 5);
  } catch (err) {
    recordResult(ctx, { step: 'pc.ann.pin', status: 'fail', detail: (err as Error).message });
  }

  // === Audience targeting ===
  recordResult(ctx, {
    step: 'pc.ann.audienceTargeting',
    status: 'warn',
    detail: 'AudienceTags is a Taxonomy field — term-store write deferred; schema presence proven. Audience vs company-wide logic tested via vitest unit tests in peopleCultureSplitModel.test.ts.',
  });

  // === Media / CTA fields ===
  recordResult(ctx, {
    step: 'pc.ann.mediaCta',
    status: 'warn',
    detail: 'PrimaryImage (URL), ImageAltText, CtaLabel, CtaUrl, OpenInNewTab — schema presence proven; live persistence deferred (URL/Hyperlink field write is standard but not lifecycle-critical).',
  });
}
