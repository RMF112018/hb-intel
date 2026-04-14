# Closure 08 — Replace destructive child rewrite behavior

## Objective
Eliminate the data-loss risk of the previous child-list write
strategy (delete-all → recreate-all by `ArticleId`) for
`HB Article Team Members` and `HB Article Media`. Replace it with a
keyed-sync strategy that preserves stable child identity and cannot
leave an article in a zero-rows state on a mid-write failure.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.test.ts` (new)

## Exact issue closed
`createReplaceAllWriter` first listed every existing child row by
`ArticleId`, deleted all of them, and only then started POSTing
the new set. Any failure during the POST loop (network blip,
SharePoint validation, throttling) left the article with zero
authored child rows on the tenant — irrecoverable except by manual
re-author. Tenant identity (`TeamMemberId` / `MediaId`) was also
discarded on every save because every row was recreated as a brand
new SharePoint item.

## Remediation
1. **New keyed-sync writer (`createKeyedSyncWriter`).** The shared
   helper now:
   - GETs existing rows for the parent `ArticleId` returning
     `{Id, childKey}` (via the new `listItemsByParentKey` helper).
   - For each incoming row:
     - Match on `childKey` → `MERGE` the existing tenant item in
       place (preserves `Id`, version history, and any tenant-side
       fields the publisher does not author).
     - No match → `POST` a new item.
   - **Only after every MERGE/POST has succeeded**, deletes the
     existing rows whose `childKey` is not present in the incoming
     set.
   - Throws on the first MERGE/POST failure, so the deletion phase
     never runs and the prior tenant rows stay intact. The caller
     surfaces a partial-write error instead of silently wiping the
     child set.
2. **Wiring (`createSharePointTeamMembersWriter`,
   `createSharePointMediaWriter`).** Both factories now use the new
   keyed sync writer with the tenant child key
   (`TeamMemberId` / `MediaId`) and the row's tenant mapper.
3. **Outcome contract (`ChildSyncOutcome`).** The
   `replaceAllForArticle` return type now reports `{ created,
   updated, deleted, written }` (`written = created + updated`) so
   callers can distinguish the three operation classes. `written`
   is preserved for back-compat with prior callers.

## Tests added or updated
- `publisherWriters.test.ts` (new):
  - "MERGEs existing rows by TeamMemberId, POSTs new rows, and
    deletes only orphans" — pins the keyed-sync verb breakdown
    and proves deletion runs *after* writes.
  - "throws and performs ZERO deletes when a MERGE fails mid-write
    — prior rows stay intact" — proves the partial-failure
    safety property.
  - Equivalent pair for the media writer
    (`createSharePointMediaWriter`).

Baseline before this prompt: 16 failed, 159 passed.
After this prompt: 16 failed, 163 passed (4 new keyed-sync tests
all green; no regressions on the previously-failing 16 cases —
those remain unrelated pre-existing fixture/legacy-field issues).

## Proof of behavioral closure
- The destructive `createReplaceAllWriter` is gone; both
  team-member and media writers are constructed via
  `createKeyedSyncWriter`.
- Stable child identity is preserved on every save: existing tenant
  rows keep their `Id` (and so their version history) when the
  child key matches.
- A mid-write failure leaves the prior tenant rows intact — the
  new failure-path tests fail loudly if any future change
  reintroduces a pre-write delete loop or moves deletion ahead of
  successful writes.
- The success outcome carries explicit `created` / `updated` /
  `deleted` counters, so the existing `written` contract is
  maintained while callers can audit what actually happened.

## Remaining follow-up risks
- The current sync still does the delete loop AFTER writes, not in
  one transactional batch. If the deletion phase fails partway, the
  caller has already committed all writes and some orphan rows may
  remain. That is a soft-failure (extra rows, never missing rows)
  — Prompt 09 (lifecycle error classification) is the right place
  to add typed reporting / retry policy for the orphan-cleanup
  step.
- The keyed-sync writer assumes the tenant `childKey` is unique
  per article. If duplicate `TeamMemberId` / `MediaId` rows exist
  on the server (legacy data), the writer will MERGE the first
  match it sees and treat the rest as orphans. A future audit
  could enforce uniqueness via a tenant index; today the
  publisher is the only writer on these lists.
