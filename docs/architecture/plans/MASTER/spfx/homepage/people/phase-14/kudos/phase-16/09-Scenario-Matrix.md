# 09 — HB Kudos Stress-Test Scenario Matrix

Authoritative scenario/state matrix for the phase-16 Kudos stress-test workstream. All downstream prompts (harness, fixtures, public/admin/shared/hosted tests) MUST map cases into the groups defined here. Do not extend the workflow core. Do not collapse overlays into the workflow core.

Scope surfaces:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/{data,shared,helpers,webparts}/`
- `packages/ui-kit/src/homepage.ts`
- `apps/hb-webparts/src/mount.tsx`

Support-tier legend:

- **RT** = repo-truth-supported today; must be covered
- **RT\*** = supported but partial / label-only (e.g. non-individual taxonomy buckets via notes)
- **NS** = not currently supported; excluded from runnable matrix (listed for drift guard only)

---

## 1. State interpretation rules

| Dimension | Type | Cardinality | Source of truth |
|---|---|---|---|
| Workflow core | closed union | 7 | `pending \| revisionRequested \| approved \| approvedScheduled \| rejected \| withdrawn \| removedUnpublished` |
| Governance overlay | boolean + ownership metadata | multi-valued | admin-review flag, claim owner, assigned owner, reviewer identity |
| Visibility overlay | predicate | derived | public, archive-eligible, aged-off, associated-to-submitter, associated-to-recipient, unrelated |
| Prominence overlay | mode + collision result | mode + outcome | pinned / featured / standard; slot-denial / demotion outcomes |
| Interaction overlay | counter + origin | numeric + surface | celebrate count, main-surface vs detail-panel origin |
| Composer lifecycle | FSM | per-session | pristine / dirty / discard-dialog / validation-error / submit-success / submit-error / send-another |
| Identity/media | attribute | per-recipient | individual-with-photo, individual-without-photo, multi-recipient mix, bucket labels |
| Host/runtime | environmental | per-run | viewport, SP chrome overlap, keyboard, focus-visible, panel scroll, zoom 100/90 |

**Rule A.** Governance overlays (flagged, claimed, reassigned, reviewed, assigned) are NEVER promoted to workflow enum members.
**Rule B.** Visibility is derived state; do not persist as workflow.
**Rule C.** Prominence collisions are writer outcomes, not workflow transitions.
**Rule D.** Composer lifecycle is session-local; does not touch workflow until submit.
**Rule E.** Each runnable case MUST name: workflow core × overlay set × surface × host condition.

---

## 2. Matrix axes

### A. Workflow core (7 states, RT)

| # | State | Public visible default | Admin queue bucket | Notes |
|---|---|---|---|---|
| A1 | `pending` | no | Pending | newly submitted; awaits review |
| A2 | `revisionRequested` | no | Revision Requested | submitter may resubmit |
| A3 | `approved` | yes | Approved | live on public surfaces |
| A4 | `approvedScheduled` | no (until schedule) | Approved (scheduled filter) | publish timestamp in future |
| A5 | `rejected` | no | Rejected | terminal unless reopened |
| A6 | `withdrawn` | no | (hidden / submitter view) | submitter-driven |
| A7 | `removedUnpublished` | no | Removed/Unpublished | admin-driven takedown |

### B. Governance overlays (RT)

| # | Overlay | Applies to | Admin-only? |
|---|---|---|---|
| B1 | flagged for admin review | any non-terminal | yes |
| B2 | admin review cleared | previously flagged | yes |
| B3 | claimed (claim owner set) | pending / flagged | yes |
| B4 | reassigned (assigned owner changed) | any active | yes |
| B5 | reviewed by current user | any | yes |
| B6 | assigned to current user | any active | yes |
| B7 | assigned to other user | any active | yes |
| B8 | unassigned | any active | yes |

### C. Visibility overlays (RT)

| # | Overlay | Derivation | Surface effect |
|---|---|---|---|
| C1 | public homepage visible | approved & not aged-off & not scheduled-future | feed + archive + detail |
| C2 | not public | any non-approved OR scheduled-future | hidden from public surfaces |
| C3 | archive eligible | approved past age threshold | archive search only |
| C4 | aged off homepage | approved & past homepage window | archive only |
| C5 | visible to submitter (associated) | submitter === current user | "My kudos" affordances |
| C6 | visible to recipient (associated) | recipient includes current user | recipient-side affordance |
| C7 | not visible to unrelated user | none of C1/C5/C6 | no access; detail 403-equivalent |

### D. Prominence overlays

| # | Overlay | Support |
|---|---|---|
| D1 | standard (no prominence) | RT |
| D2 | pinned | RT |
| D3 | featured | RT |
| D4 | unpinned (transition) | RT |
| D5 | unfeatured (transition) | RT |
| D6 | prominence collision / slot denial | RT (writer-enforced) |
| D7 | scheduled prominence collision demotion | RT\* — only if current writer exposes demotion intent; otherwise assert denial path (document outcome per run) |

### E. Interaction overlays (RT)

| # | Overlay |
|---|---|
| E1 | celebrate count = 0 |
| E2 | celebrate count > 0 |
| E3 | celebrate from main surface |
| E4 | celebrate from detail panel |
| E5 | repeated celebrate attempt (idempotency / dedupe) |

### F. Composer lifecycle (RT)

| # | State |
|---|---|
| F1 | pristine open |
| F2 | dirty draft |
| F3 | discard close dialog |
| F4 | validation error |
| F5 | submit success |
| F6 | submit error |
| F7 | send another |
| F8 | typed people search success |
| F9 | typed people search empty |
| F10 | typed people search error |

### G. Identity / media

| # | Case | Support |
|---|---|---|
| G1 | individual recipient with photo | RT |
| G2 | individual recipient without photo | RT |
| G3 | multiple recipients, mixed photo presence | RT |
| G4 | bucket mix: individual + team + department + project-group labels | RT\* (buckets flow through notes/labels; no term-store write) |
| G5 | submitter attribution correctness | RT |
| G6 | recipient display correctness across surfaces | RT |

### H. Host / runtime conditions

| # | Condition |
|---|---|
| H1 | standard viewport (1440+) |
| H2 | reduced-width supported viewport (~1024) |
| H3 | SharePoint-hosted chrome overlap risk zones |
| H4 | keyboard-only navigation |
| H5 | focus-visible state |
| H6 | panel scroll behavior |
| H7 | no dead CTA (every visible control has a handler) |
| H8 | zoom 100% baseline |
| H9 | zoom 90% comparison capture for layout regression |

---

## 3. Coverage priority

### P0 — must always run (smoke + boundary)

- A1, A3, A5 × C1/C2 × H1/H8 (core public visibility)
- A3 × E1/E2/E3 (celebrate primary path)
- F1 → F2 → F5 (composer happy path) and F1 → F2 → F3 (discard)
- F8 (typed people search success)
- G1, G2 (photo hydration present and absent)
- B1/B2 (admin-review boundary) on A1
- Companion queue renders: pending, approved, rejected
- Public/admin detail boundary: public detail excludes audit timeline; admin detail includes it
- Cache-invalidation proof: governance action → `invalidatePeopleCultureCache()` → next read reflects mutation
- H7 no-dead-CTA sweep on public main + detail + composer

### P1 — broad workflow / regression

- Full A1–A7 transitions through `submitKudosGovernanceAction()` with audit-event assertion per action
- A4 scheduled publish: hidden before timestamp, visible after
- A6 withdraw + resubmit; A5 reopen (if writer supports); A7 takedown
- B3/B4/B5/B6/B7/B8 ownership flows on A1 and A3
- C3/C4 archive eligibility + age-off transitions; archive search returns aged items
- D1–D6 prominence transitions including D6 collision denial
- E4/E5 detail-panel celebrate and idempotent repeat
- F4/F6/F7/F9/F10 composer error + send-another + empty/error people search
- G3/G4 multi-recipient + bucket labels (mark G4 as RT\*)
- Bulk approve path in companion
- Filter model coverage: search, ownership, admin-review-only, scheduled-only, aging buckets

### P2 — hosted / adversarial / drift

- H2/H3 SharePoint chrome overlap, reduced-width viewport
- H4/H5 keyboard-only + focus-visible end-to-end traversal
- H6 panel scroll with long content
- H9 90% zoom layout regression capture
- Legacy `PeopleCultureMerged` mount backward-compat smoke (1 case only)
- D7 scheduled prominence collision demotion — assert current writer outcome; label NS if writer lacks demotion intent
- Drift guard: assert workflow enum membership equals exactly the 7 states
- Graph photo cache eviction + rehydrate after reassignment
- `kudosListHostUrl` override: companion operating against foreign host list

---

## 4. Fixture dependencies per matrix family

Fixtures live under the phase-16 harness (see prompt `04-Fixtures-and-Seed-Data-Prompt.md`). Each family declares required seeds.

| Family | Required fixtures |
|---|---|
| A (workflow core) | 7 seeded items, one per state; stable IDs; etag-aware; scheduled item with future publish timestamp |
| B (governance overlays) | users: admin, reviewer, other-reviewer, non-admin; items pre-flagged / pre-claimed / pre-assigned variants |
| C (visibility) | items aged within window, past window (archive), past age-off; submitter-associated and recipient-associated items for a given test user |
| D (prominence) | slot-occupancy baseline with existing pinned + featured items to force collision paths |
| E (interaction) | items with celebrate count 0 and >0; idempotency marker store |
| F (composer) | stub Graph token provider; SP people search adapter with success / empty / error modes; validation schema boundary inputs |
| G (identity/media) | users with and without profile photo; multi-recipient mixes; labeled buckets for team / department / project-group |
| H (host/runtime) | SP-style chrome frame harness; viewport presets (1440, 1024); zoom presets (100, 90); keyboard-only driver; focus-visible probe |

Shared fixture seams referenced from audit:

- `usePeopleCultureData` cache with `invalidatePeopleCultureCache()`
- `submitKudosDraft()` (pending seed)
- `submitKudosGovernanceAction()` (all transitions + audit writes)
- `ensureUser` for typed individuals
- role helper driven by security-group membership

---

## 5. Expected assertions / proof points per matrix family

### A — workflow core
- Queue bucket membership matches state.
- Public surface shows only A3 non-scheduled non-aged items.
- Each transition writes exactly one audit event.
- Writer binds list by GUID, not title; MERGE uses etag.

### B — governance overlays
- Flag/clear toggles do not change workflow state.
- Claim/assignment changes ownership metadata only; audit event recorded.
- Role capability gate blocks unauthorized action before writer call.

### C — visibility
- Feed excludes C2/C4; archive includes C3/C4.
- Unrelated user (C7) cannot open detail; submitter/recipient can.
- Scheduled (A4) item flips from hidden to visible at publish timestamp without manual refresh required beyond cache invalidation contract.

### D — prominence
- Pinned / featured render in designated slots; standard never does.
- D6 collision returns writer denial; UI surfaces denial without silent success.
- D7 demotion: assert documented outcome; if unsupported, assert denial (not silent overwrite).

### E — interaction
- E3 and E4 both invoke same mutation seam; count increments consistently across surfaces.
- E5 repeated attempt is idempotent (no duplicate audit or double-count).

### F — composer
- F3 only fires when dirty (F2); pristine close skips dialog.
- F5 invalidates cache and closes flyout; F7 resets form but preserves session-level context.
- F8/F9/F10 distinguishable UI states; F10 does not strand the composer.

### G — identity / media
- G1 shows photo via Graph hydration cache; G2 falls back cleanly (no broken image).
- G3 mixed presence renders per-recipient correctly.
- G4 bucket labels render as labels; marked RT\* (no term-store assertion).
- G5 submitter name matches seeded identity across main + detail + archive.

### H — host / runtime
- H3: no overlap with SP command bar / suite bar at supported viewports.
- H4/H5: tab order reaches every interactive; focus ring visible.
- H6: long-content panel scrolls body, keeps header/footer controls reachable.
- H7: no-dead-CTA snapshot — every rendered button/link has a bound handler or href.
- H9: 90% zoom diff within allowed tolerance vs H8 baseline.

Cross-cutting proof points (all families):

- `invalidatePeopleCultureCache()` called on every successful mutation path.
- Public detail MUST NOT render audit timeline; admin detail MUST render it.
- Workflow enum membership test asserts exactly 7 states (drift guard).

---

## 6. Test-group breakdown (closure)

The next prompts implement these groups. One file per group unless noted.

Public webpart (`05-Public-Webpart-Stress-Test-Prompt.md` scope):

1. `kudos.public.workflow-visibility.spec.ts` — A1–A7 × C1–C7 public surface filtering
2. `kudos.public.composer-lifecycle.spec.ts` — F1–F10 including people-search modes
3. `kudos.public.celebrate.spec.ts` — E1–E5 across main + detail
4. `kudos.public.detail-boundary.spec.ts` — public detail excludes audit timeline, enforces C5/C6/C7
5. `kudos.public.archive-and-ageoff.spec.ts` — C3/C4 + archive search
6. `kudos.public.identity-media.spec.ts` — G1–G6, Graph photo cache hydration + eviction
7. `kudos.public.view-all-feed.spec.ts` — feed flyout, searchable body, full-excerpt rendering

Admin companion (`06-Admin-Companion-Stress-Test-Prompt.md` scope):

8. `kudos.admin.queue-tabs-and-filters.spec.ts` — queue buckets + filter model (search/ownership/admin-review-only/scheduled/aging)
9. `kudos.admin.governance-transitions.spec.ts` — A-state transitions via `submitKudosGovernanceAction()` + audit-event proof
10. `kudos.admin.ownership-overlays.spec.ts` — B1–B8 flag/claim/assign/reassign/review
11. `kudos.admin.prominence.spec.ts` — D1–D6 (+ D7 outcome assertion)
12. `kudos.admin.bulk-approve.spec.ts` — bulk path + refresh
13. `kudos.admin.detail-boundary.spec.ts` — admin detail includes audit timeline

Shared seams (`07-Shared-Component-and-Seam-Validation-Prompt.md` scope):

14. `kudos.shared.cache-invalidation.spec.ts` — `invalidatePeopleCultureCache()` after every mutation
15. `kudos.shared.writer-contract.spec.ts` — GUID binding, etag MERGE, one audit per action, role capability gate
16. `kudos.shared.people-search-adapter.spec.ts` — F8/F9/F10 adapter contract
17. `kudos.shared.workflow-enum-drift-guard.spec.ts` — exactly 7 states
18. `kudos.shared.list-host-override.spec.ts` — `kudosListHostUrl` foreign-host routing

Hosted / runtime (`08-Hosted-Validation-and-Closure-Prompt.md` scope):

19. `kudos.hosted.chrome-overlap.spec.ts` — H1/H2/H3
20. `kudos.hosted.keyboard-and-focus.spec.ts` — H4/H5/H7
21. `kudos.hosted.panel-scroll.spec.ts` — H6
22. `kudos.hosted.zoom-regression.spec.ts` — H8/H9
23. `kudos.hosted.legacy-mount-smoke.spec.ts` — legacy `PeopleCultureMerged` backward-compat single case

Priority tagging (applied per case, not per file):

- P0 cases are required in CI for every run.
- P1 cases run in the full nightly regression.
- P2 cases run in the hosted validation + drift pass.

Every spec MUST tag its cases with the matrix coordinates (e.g. `[A3][C1][E3][H1]`) so coverage reporting can reconstruct the matrix automatically.
