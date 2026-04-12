# 03a — Locator Coverage Note

Closes phase-16a Gap 3 for the critical-path locators. Each entry
notes the live DOM anchor, source file, and whether spec lookup is
now resolvable without fallback selectors.

## Covered in this commit

| Locator id | Source file | Element |
|---|---|---|
| `hb-kudos-public-root` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | top-level `<section>` wrapper |
| `hb-kudos-public-detail` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | public `DetailPanel` body wrapper |
| `hb-kudos-archive-search` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | archive `<input type="search">` |
| `hb-kudos-view-all-panel` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | View All flyout body wrapper |
| `hb-kudos-composer-form` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | wraps `HbcKudosComposerForm` |
| `hb-kudos-composer-preview` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | wraps `HbcKudosComposerPreview` |
| `hb-kudos-composer-success` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | wraps `HbcKudosComposerSuccess` |
| `hb-kudos-composer-error` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` | wraps `HbcKudosComposerError` (role=alert) |
| `hb-kudos-give-trigger` | `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` | Give Kudos button (all 4 render variants: primary, ghost-inline, solid, and homepage) |
| `hb-kudos-view-all` | `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` | View All button (primary + ghost variants) |
| `hb-kudos-celebrate` | `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` | spotlight celebrate button |
| `hb-kudos-celebrate-count` | `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx` | celebrate count span (both interactive and read-only renders) |
| `hb-kudos-audit-timeline` | `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx` | governance-only audit timeline wrapper — MUST NOT appear under viewer role per Decision Lock §103-107 |
| `hb-kudos-companion-root` | `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx` | top-level `<section>` wrapper |
| `hb-kudos-companion-detail` | `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx` | admin detail panel body wrapper |
| `hb-kudos-queue-tab-<bucket>` | `HbKudosCompanion.tsx` via `KudosGovernanceTabButton.testId` | queue tab filter buttons for `pending` / `revisionRequested` / `flagged` / `approved` / `rejected` / `removed` |
| `hb-kudos-queue-row` | `HbKudosCompanion.tsx` | queue row wrapper div inside `HbcCard` |
| `hb-kudos-queue-filter-search` | `HbKudosCompanion.tsx` | search `<input type="search">` |
| `hb-kudos-queue-filter-ownership` | `HbKudosCompanion.tsx` | ownership `<select>` |
| `hb-kudos-queue-filter-admin-review` | `HbKudosCompanion.tsx` via `KudosGovernanceToggleChip.testId` | "Flagged for admin" toggle |
| `hb-kudos-queue-filter-scheduled` | `HbKudosCompanion.tsx` via `KudosGovernanceToggleChip.testId` | "Scheduled only" toggle |
| `hb-kudos-bulk-approve` | `HbKudosCompanion.tsx` | bulk-approve button in the selection bar |
| `hb-kudos-action-<kind>` | `HbKudosCompanion.tsx` via `KudosActionButton.testId` | reject, request-revision, schedule, unschedule, pin, unpin, feature, unfeature, remove, restore, flag, clear-flag, reopen, update-content, claim, assign |

## Registry changes

- `e2e/webparts/kudos/helpers/kudosLocators.ts`: `QueueBucket` tab id
  `'revision-requested'` renamed to `'revisionRequested'` to match the
  real `COMPANION_TABS` id in
  `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx:129`.
- `e2e/webparts/kudos/companion/kudos.admin.queue-tabs-and-filters.spec.ts`
  updated to use the matching id.

## Primitive prop surface additions

Three governance primitives in
`apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
gained an optional `testId?: string` prop forwarded to the rendered
button's `data-hbc-testid`:

- `KudosGovernanceTabButton`
- `KudosGovernanceToggleChip`
- `KudosActionButton`

The prop is opt-in; existing call sites outside the Kudos webpart are
unaffected.

## Not yet instrumented (explicit follow-up)

These locator registry entries are declared in `kudosLocators.ts` but
not yet wired. They require deeper ui-kit touches or composer-flyout
primaryAction prop flow and are out of scope for this commit:

| Locator id | Owner |
|---|---|
| `hb-kudos-public-feed`, `hb-kudos-public-feed-item` | `HbcPeopleCultureSurface` rail/row element classes |
| `hb-kudos-composer-submit`, `hb-kudos-composer-send-another`, `hb-kudos-composer-discard-dialog` | `HbcKudosComposerFlyout` `primaryAction` / `secondaryAction` buttons |
| `hb-kudos-people-picker-input`, `hb-kudos-people-picker-results`, `hb-kudos-people-picker-empty`, `hb-kudos-people-picker-error` | `HbcPeoplePicker` (package `@hbc/ui-kit` internals) |
| `hb-kudos-queue-filter-aging` | not yet rendered in the companion filter toolbar — reserved for when the aging-bucket filter UI lands |
| `hb-kudos-action-approve` | companion `HbcKudosComposerFlyout` `primaryAction` button (flyout primitive, not `KudosActionButton`) |

Prompt 04 (execution promotion) is responsible for deciding whether
each spec can drop its `test.fixme` guard given the current instrumented
set. Prompt 04 may also split the remaining follow-up locators into
a scoped ui-kit ticket if it becomes a blocker.

## Verification

- Kudos Playwright lane discovery still reports **108 tests in 23
  files** (`pnpm exec playwright test
  --config=playwright.webparts.config.ts e2e/webparts/kudos --list`).
- Kudos-owned Vitest suite still **58 passing / 58**
  (`pnpm --filter @hbc/spfx-hb-webparts exec vitest run
  --config vitest.config.ts src/homepage/__tests__/kudos*.test.* src/homepage/__tests__/useKudosComposer.test.ts src/homepage/__tests__/useSharePointPeopleSearch.test.ts src/homepage/__tests__/submitKudosDraft.test.ts src/homepage/__tests__/buildKudosPatchPlan.test.ts`).
- No duplicate `data-hbc-testid` values were introduced for the
  covered set; tab ids are uniquely parameterized, action ids are
  uniquely keyed.

## Coverage at a glance

| Locator registry entry | Covered | Notes |
|---|---|---|
| publicRoot | ✅ | |
| publicFeed | ⏳ | ui-kit follow-up |
| publicFeedItem | ⏳ | ui-kit follow-up |
| publicDetailPanel | ✅ | |
| publicAuditTimeline | ✅ (via `hb-kudos-audit-timeline` in shared detail content) | guard-critical |
| giveKudosFlyoutTrigger | ✅ | 4 render variants |
| composerForm | ✅ | |
| composerPreview | ✅ | |
| composerSubmit | ⏳ | flyout `primaryAction` |
| composerDiscardDialog | ⏳ | dialog primitive |
| composerSendAnother | ⏳ | flyout `primaryAction` |
| peoplePickerInput/results/empty/error | ⏳ | ui-kit follow-up |
| celebrateButton/Count | ✅ | |
| viewAllTrigger | ✅ | |
| viewAllFeedPanel | ✅ | |
| archiveSearchInput | ✅ | |
| companionRoot | ✅ | |
| queueTab(...) | ✅ | 6 buckets |
| queueRow | ✅ | |
| queueFilterSearch | ✅ | |
| queueFilterOwnership | ✅ | |
| queueFilterAdminReviewOnly | ✅ | |
| queueFilterScheduledOnly | ✅ | |
| queueFilterAging | ⏳ | UI not yet in companion |
| companionDetailPanel | ✅ | |
| companionAuditTimeline | ✅ | shared with public; see boundary rule |
| bulkApproveButton | ✅ | |
| governanceAction(...) | ✅ | 16 of 17 kinds; `approve` lives on flyout primaryAction (follow-up) |
