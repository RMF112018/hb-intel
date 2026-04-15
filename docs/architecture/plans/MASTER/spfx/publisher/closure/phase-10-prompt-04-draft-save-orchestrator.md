# Phase 10 · Prompt 04 closure — Draft save orchestration service seam

## Chosen save-consistency model: truthful staged save
The three draft-save writes (master article → team-member keyed sync → media keyed sync) are sequenced inside a dedicated service, and the controller now receives a typed outcome that states exactly what persisted. Partial persistence is allowed; it is never hidden. If an early stage (the master row) already committed before a later stage failed, the caller trusts the server as authoritative and reloads from it so local draft state stops diverging from persisted truth.

Compensating rollback was intentionally not chosen: team and media writers are keyed-sync (MERGE / POST / orphan-delete), so a re-save naturally reconciles. The server already holds the latest successful shape for each list, and reloading from the server is the simpler, more honest recovery.

## Extracted service seam
New file: `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts`.

- `createDraftSaveOrchestrator(repositories)` → `{ save(req) }`
- Input: `DraftSaveRequest { article, teamMembers, media }`
- Output: `DraftSaveOutcome`, either
  - `{ ok: true, article, persisted }` where `persisted = { article, teamMembers, media }` is all `true`, or
  - `{ ok: false, stage, message, persisted, article?, cause? }` with:
    - `stage: 'articleUpsert' | 'teamMembersWrite' | 'mediaWrite'`
    - `persisted` exactly reflects which list writes landed
    - `article` is populated when the master row was committed before the failing stage

Belongs in `publisherAdapter` (not the controller) because:
- save order is a data-layer concern, not a UI concern
- it can be unit-tested without React / SPFx harness
- the controller never needs to reason about ordering again
- the outcome type is a structured seam other surfaces (e.g. future bulk-save) can reuse

## Before / after save-failure matrix

| Failure stage       | Before (controller-owned)                                    | After (service-owned)                                                                                      |
|---------------------|--------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| articleUpsert       | UI: "Couldn't save — <err>". Master never written.           | UI: "Save partially failed at articleUpsert … Persistence: master not saved; team not saved; media not saved." Typed outcome reflects the same. |
| teamMembersWrite    | UI: "Couldn't save — <err>". Master silently already committed; team/media may or may not have been written. | UI: "Save partially failed at teamMembersWrite … Persistence: master saved; team not saved; media not saved." Controller reloads from server since master committed. |
| mediaWrite          | UI: "Couldn't save — <err>". Master + team already committed; media not written; no reconcile.               | UI: "Save partially failed at mediaWrite … Persistence: master saved; team saved; media not saved." Controller reloads from server. |

## Preservation of keyed-sync child writers
The service only wraps `repositories.teamMembers.replaceAllForArticle` and `repositories.media.replaceAllForArticle`, which are backed by the keyed-sync writers in `publisherWriters.ts`. Test `passes the article row, team, and media through to the repositories unchanged (no destructive rewrite)` pins that the service does not recompose or mutate the arguments on the way through.

## Changed files
- `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.ts` — new service.
- `apps/hb-publisher/src/data/publisherAdapter/draftSaveOrchestrator.test.ts` — new unit tests.
- `apps/hb-publisher/src/data/publisherAdapter/index.ts` — barrel export.
- `apps/hb-publisher/src/webparts/articlePublisher/controllers/useDraftLifecycle.ts` — `handleSave` now delegates to the service and renders a stage-aware status banner with a truthful per-list persistence summary, reloading from the server whenever the master committed even if a child stage failed.
- `apps/hb-publisher/config/package-solution.json` — version bump to 1.0.0.11.

## Tests added
- `returns ok with full persistence map on the happy path, in the correct sequence`
- `classifies an articleUpsert failure; no child writes attempted; master not persisted`
- `surfaces teamMembersWrite failure truthfully: master committed, team + media not persisted, media write is skipped`
- `surfaces mediaWrite failure truthfully: master + team committed, media not persisted`
- `passes the article row, team, and media through to the repositories unchanged (no destructive rewrite)`

Each failure test asserts the full truth tuple (stage, message, per-list persisted flags, whether the master row is carried back to the caller) that the prompt requires.

## Proof that user-visible messaging now matches persistence truth
The controller builds its status banner directly from the outcome:
- `Save partially failed at <stage>: <service message>. Persistence: master (not )saved; team (not )saved; media (not )saved.`

That string is a verbatim projection of `outcome.persisted`, so the UI can no longer say "save failed" while the master has actually committed. When `persisted.article === true` the controller reloads draft-rail groups and the selected draft from the server, so local state converges on persisted truth.

## Verification
- `npx vitest run src/data/publisherAdapter/draftSaveOrchestrator.test.ts` → 5/5 pass.
- `npx tsc --noEmit` in `apps/hb-publisher` → clean.
- `npx vitest run src/data/publisherAdapter` → 263/269 pass; the 6 failures are the pre-existing `publisherEndToEnd.test.ts` failures already present on `main` before phase-10 work.

## Non-goals (intentional)
- No change to template resolution, slug governance, intelligent defaults, or promotion-policy application inside `handleSave`.
- No change to publish / lifecycle orchestration.
- No change to the underlying keyed-sync child writers in `publisherWriters.ts`.
