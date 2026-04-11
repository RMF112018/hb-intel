# Prompt 00 — Authority and Scope Lock Report

Phase-14 · HB Kudos + HR Approval Companion implementation package (kudos/).

This report is the deliverable for
[`Prompt-00-Authority-and-Scope-Lock.md`](./Prompt-00-Authority-and-Scope-Lock.md).
It reconciles live repo truth against the locks in
[`Decision-Lock-Appendix.md`](./Decision-Lock-Appendix.md),
[`Schema-Reference-Appendix.md`](./Schema-Reference-Appendix.md),
[`Plan-Summary.md`](./Plan-Summary.md), and the live schema snapshot
[`../people-culture-kudos-sharepoint-schema-report.md`](../people-culture-kudos-sharepoint-schema-report.md),
then freezes the implementation target state for Prompts 01–06 of the kudos/ package.

No runtime code is modified by this report. Prompt-00 is an audit/scope-lock
artifact only, per the prompt's "do not start major code edits" rule.

---

## 1. Repo-truth file inventory

### 1.1 Webparts actually present in repo (apps/hb-webparts/src/webparts/)

| Webpart dir | Manifest id | End-state role (per Plan-Summary) | Current repo truth |
|---|---|---|---|
| `peopleCulture/` | `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` | **Transitional** merged surface — preserved only as backward-compat for already-provisioned pages | Live. Entry `PeopleCultureMerged.tsx` composes `HbcPeopleCultureSurface` + full `HbcKudosComposer*` flow from `@hbc/ui-kit/homepage`. Must not gain new responsibilities. |
| `peopleCulturePublic/` | `e39d9662-34c4-43e6-9425-5770f62da626` | Non-recognition public People & Culture surface (owned by the sibling `pc/` plan package) | Live. Strict boundary: does not import from `hbKudos/` or kudos primitives. Out of scope for kudos/ edits except as a boundary reference. |
| `peopleCultureCompanion/` | `7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e` | Non-recognition HR operating companion (owned by the sibling `pc/` plan package) | Live after pc/ Prompts 03–05. Does not moderate kudos. Out of scope for kudos/ except as a boundary reference. |
| `hbKudos/` | `f14e59a3-4d6b-43b2-952e-ba02dea11dad` | **End-state HB Kudos employee recognition webpart** | Scaffold seam only (`HbKudos.tsx` is an empty mount with a deferred-implementation comment block). This is where Prompt-02 lands. |
| `hbKudosCompanion/` | _not yet registered in package-solution.json_ | **End-state HR approval companion webpart** | README-only placeholder. This is where Prompt-03 lands, including manifest + mount registration. |
| `kudosPage/` | _internal support only_ | Not a homepage webpart; scaffolding for a moderation workspace view | Present as `KudosPage.tsx` + `KudosModerationWorkspace.tsx`. May be absorbed into the `hbKudosCompanion` surface in Prompt-03, not promoted to a homepage webpart. |

### 1.2 Homepage seams and data (apps/hb-webparts/src/homepage/)

- `webparts/communicationsContracts.ts` — canonical domain contracts for `KudosEntry`, `KudosRecipient`, `KudosRecipientType`, `KudosWorkflowStatus`, prominence, visibility, and scheduling.
- `data/peopleCultureSpListRegistry.ts` — binds `People Culture Kudos` and `Kudos Audit Events` by **list GUID** (not title).
- `data/peopleCultureListSource.ts` — `KUDOS_FIELDS`, `KUDOS_SELECT`, `RawKudosItem`, `mapKudos()` read path covering every workflow, scheduling, prominence, ownership, visibility, and engagement field per the schema appendix; four typed recipient fields are parsed via `extractPersonArray` + `buildTaxonomyRecipients`.
- `data/peopleCultureSubmissionSource.ts` — `submitKudosDraft()` write path for new pending entries. Documented free-text recipient limitation at lines 136–141.
- `data/useKudosComposer.ts` — composer state wiring; re-exports `KudosComposerDraft` / `KudosComposerValidationErrors` from `@hbc/ui-kit/homepage`.
- `helpers/peopleCultureNotificationBuilder.ts`, `helpers/peopleCultureTargetingGuardrails.ts`, `helpers/peopleCultureMilestoneGenerator.ts` — helpers owned by the pc/ track; kudos/ must not duplicate them and must not depend on non-recognition specifics.
- `__tests__/importDiscipline.test.ts` — active guardrail enforcing the locked homepage entry-point rules.

### 1.3 Shared UI (packages/ui-kit/src/)

- `HbcPeopleCultureSurface/` — premium celebratory surface, variants `default` + `people-culture-homepage`. Already used by the transitional merged webpart; may be reused by the new `hbKudos/` surface if the recognition frame fits, otherwise extended.
- `HbcKudosComposer/` — `Flyout`, `Form`, `Preview`, `Success`, `Error` components plus `KudosComposerDraft` and `KudosComposerValidationErrors` types. **Still carries a free-text `recipientNames: string` field** (lines 34–45 of `index.tsx`).
- `HbcAvatarStack/` — shared mixed-recipient avatar primitive.
- `HbcPremiumSurface`, `HbcPremiumSection`, `HbcPremiumBadge`, `HbcPremiumCta`, `HbcPremiumIcon` — premium frame primitives re-exported from `@hbc/ui-kit/homepage`.
- `HbcHomepageSectionShell`, `HbcHomepageSurfaceCard`, `HbcHomepageMetadataRow`, `HbcHomepageActionRow`, `HbcHomepageEyebrow`, `HbcHomepageCta`, `HbcHomepageIconFrame` — homepage layout primitives.

### 1.4 Doc/governance inputs

- `Plan-Summary.md`, `README.md`, `Decision-Lock-Appendix.md`, `Schema-Reference-Appendix.md` in this folder.
- `../people-culture-kudos-sharepoint-schema-report.md` — authoritative live schema snapshot for `People Culture Kudos` and `Kudos Audit Events`.
- `docs/reference/ui-kit/entry-points.md`, `Presentation-Lane-Standard.md`, and the SPFx doctrine files named in this prompt (read selectively; repo state is authority where they conflict).
- `docs/architecture/reviews/people-culture-data-schema-conformance-audit.md` — last conformance pass.

### 1.5 Legacy files named in older prompts that are **no longer authoritative**

- Any reference to a single merged "people & culture + kudos" end-state surface. The end-state is a **split**; the merged `peopleCulture/` is transitional only.
- Any reference to kudos moderation living inside `peopleCultureCompanion/`. That webpart does not moderate kudos; moderation belongs in `hbKudosCompanion/`.
- Any reference to an end-state plain-text recipient model. The recipient contract is already typed; the free-text path is a known transitional gap (see §5).
- Any assumption that new kudos governance storage lists must be created. The existing list pair is authoritative (see §6).

---

## 2. Authority resolution note

When documents and code disagree, apply in order:

1. Live source code under `apps/hb-webparts/src/webparts/{peopleCulture,hbKudos,hbKudosCompanion}`, `apps/hb-webparts/src/homepage/**`, and `packages/ui-kit/src/` relevant to recognition.
2. The live schema snapshot at `../people-culture-kudos-sharepoint-schema-report.md` plus `Schema-Reference-Appendix.md`.
3. This kudos/ plan package (`Plan-Summary.md`, `Decision-Lock-Appendix.md`, Prompts 00–06, and this report).
4. The sibling `pc/` plan package — consulted only for boundary clarity on `peopleCulturePublic/` and `peopleCultureCompanion/`, never to expand kudos scope.
5. Older phase-14 reviews under `docs/architecture/reviews/` — informational only where they do not conflict with the live code or the schema snapshot.
6. Pre-phase-14 homepage / UI-kit doctrine (`docs/reference/ui-kit/**`) — consulted only where the above sources are silent.

Stale review text must not override current repo truth. In particular, older audits that assume a merged end-state product or a string-based recipient model are superseded.

---

## 3. Homepage UI inventory

### 3.1 Already exported from `@hbc/ui-kit/homepage` and reusable as-is

- Recognition: `HbcPeopleCultureSurface` (and its types), `HbcKudosComposerFlyout/Form/Preview/Success/Error`, `HbcAvatarStack`.
- Premium frame: `HbcPremiumSurface`, `HbcPremiumSection`, `HbcPremiumBadge`, `HbcPremiumCta`, `HbcPremiumIcon`.
- Homepage layout: `HbcHomepageSectionShell`, `HbcHomepageSurfaceCard`, `HbcHomepageMetadataRow`, `HbcHomepageActionRow`, `HbcHomepageEyebrow`, `HbcHomepageCta`, `HbcHomepageIconFrame`, `HbcStatusBadge`, `HbcCard`, `HbcEmptyState`, `HbcSpinner`, `HbcSearch`.
- Re-exported motion / icons / utility surface: `motion`, `AnimatePresence` from `motion/react`; `clsx`, `cva`, `VariantProps`; `Separator` from Radix; governance-relevant lucide icons (`AlertTriangle`, `AlertCircle`, `CheckCircle2`, `Clock`, `Shield`, `Calendar`, `Users`, `Info`, `Settings`, `Mail`, `Link2`, `FileText`, `ExternalLink`, …).

### 3.2 Missing or insufficient shared primitives — must be created/extended in the shared kit first

These recognition/governance patterns repeat across the future `hbKudos/` and `hbKudosCompanion/` webparts and are not currently adequate in the shared kit:

- **Typed-recipient kudos composer** — `HbcKudosComposer` currently exposes `recipientNames: string`. A shared replacement/extension must accept a typed multi-bucket model keyed to `individual | team | department | projectGroup`.
- **Recognition archive card/list** — premium card for a scrollable feed of past kudos (spotlight ≠ archive row).
- **Mixed-recipient summary / bucket presentation** — summarizes recipients across the four buckets without duplicating the composer.
- **Governance queue item shell** — a homepage-safe row primitive for moderation queues (headline + state + aging + ownership + inline actions).
- **Governance toolbar / filter / preset bar** — shared bar primitive for HR companion filters, presets, and bulk-safe action affordances.
- **Workflow state / aging / ownership chips** — reusable chip family tied to the `KudosWorkflowStatus` union, claim ownership, and aging buckets.
- **Governance detail section** — shared structural panel for detail-panel sections (moderation notes, scheduling, prominence, audit snippet).
- **Audit timeline presentation block** — renders `Kudos Audit Events` rows in a governance-safe timeline.
- **Inline governance action bar** — approve / reject / request revision / schedule / pin / feature / remove cluster, role-aware.

Prompt-02 must not start building the employee-facing archive surface until the typed-recipient composer extension and the recognition archive primitive are lined up. Prompt-03 must not start building the HR companion until the governance queue shell, chips, toolbar, and action bar are lined up. This rule is a hard precondition for the shared-first stance in the plan package.

---

## 4. Shared-vs-local classification table

| Concern | Bucket | Owner |
|---|---|---|
| Premium recognition frame (hero/spotlight/section shells) | **A** — use existing | `@hbc/ui-kit/homepage` (`HbcPeopleCultureSurface`, `HbcPremiumSection`, `HbcHomepageSectionShell`) |
| Premium badges / CTAs / icons | **A** — use existing | `HbcPremiumBadge`, `HbcPremiumCta`, `HbcPremiumIcon`, `HbcStatusBadge` |
| Mixed-recipient avatar strip | **A** — use existing | `HbcAvatarStack` |
| Kudos composer flyout/form/preview shell | **A** — use existing frame | `HbcKudosComposer*` |
| Kudos composer **typed recipient input** | **B** — extend shared | new shared primitive; blocks Prompt-02 closure |
| Recognition archive card / scroll list | **B** — create shared | new shared primitive under `packages/ui-kit/src/` |
| Mixed-recipient summary / bucket chip strip | **B** — create shared | new shared primitive |
| Governance queue row | **B** — create shared | new shared primitive |
| Governance toolbar / filter / preset bar | **B** — create shared | new shared primitive |
| Workflow state / aging / ownership chips | **B** — create shared | new shared primitive |
| Governance detail section | **B** — create shared | new shared primitive |
| Audit timeline block | **B** — create shared | new shared primitive |
| Inline governance action bar | **B** — create shared | new shared primitive |
| SharePoint list reads/writes | **C** — keep local | `apps/hb-webparts/src/homepage/data/peopleCulture*Source.ts` + `peopleCultureSpListRegistry.ts` |
| Workflow state machine (approve/reject/schedule/claim/remove/restore) | **C** — keep local | new writer module under `apps/hb-webparts/src/homepage/data/` (Prompts 03–05) |
| Role resolution and permission checks | **C** — keep local | helper module(s) under `apps/hb-webparts/src/homepage/helpers/` keyed to webpart properties |
| Notification routing | **C** — keep local | local helper; may reuse the pc/ notification builder pattern without coupling |
| View-model adaptation | **C** — keep local | thin adapters inside each webpart entry |
| Manifest + mount registration | **C** — keep local | `PeopleCultureWebPart.manifest.json`, new `HbKudosWebPart.manifest.json` fields, new `HbKudosCompanionWebPart.manifest.json`, and `apps/hb-webparts/src/mount.tsx` |

"Bucket" letters map to Prompt-00 §3 (A use / B extend / C keep local).

---

## 5. Recipient-model compliance note

**Locked rule:** the final HB Kudos submission/editing model must be typed against `IndividualRecipients`, `TeamRecipients`, `DepartmentRecipients`, and `ProjectGroupRecipients`. Plain-text comma-delimited recipients are not final-state compliant.

**Current repo truth:**

- Domain contract is already typed: `KudosRecipient { id, name, recipientType, media? }` + `KudosRecipientType = 'individual' | 'team' | 'department' | 'projectGroup'` (`communicationsContracts.ts:152-166`). `KudosEntry.recipients: KudosRecipient[]`.
- Read path (`peopleCultureListSource.ts#mapKudos`) normalizes all four live list fields — `IndividualRecipients` (UserMulti), `TeamRecipients`, `DepartmentRecipients`, `ProjectGroupRecipients` (taxonomy) — into `KudosRecipient[]`. Compliant.
- Write path (`peopleCultureSubmissionSource.ts#submitKudosDraft`) currently skips the four recipient fields on submission with a documented justification at lines 136–141: the composer still collects free-text; HR assigns typed recipients during review.
- Shared UI (`HbcKudosComposer`) still exposes `recipientNames: string` (`packages/ui-kit/src/HbcKudosComposer/index.tsx:34-45`).

**Freeze:**

- The contract and read path are compliant — do not regress them.
- The composer and submission writer are **not** final-state compliant. Prompt-02 must replace the free-text composer input with a typed multi-bucket people-picker + taxonomy control (promoted as a shared primitive per §3), and Prompt-02/03 must extend `submitKudosDraft` to write the four typed recipient fields directly.
- Prompt-06 must not claim final closure while either the composer or the submission writer still flows through a free-text recipient model.

---

## 6. List-schema alignment summary

**Authoritative sources:** `Schema-Reference-Appendix.md` and `../people-culture-kudos-sharepoint-schema-report.md`.

**Live list pair used by Phase-14:**

- `People Culture Kudos` — primary system of record for content, workflow, recipients, homepage visibility, scheduling, prominence, removal/restore, admin review, claim/ownership, visibility mode, engagement counts.
- `Kudos Audit Events` — durable event journal for workflow transitions, claim/reassignment, scheduling/prominence actions, moderation notes, audit reconstruction.

**Binding discipline:** `peopleCultureSpListRegistry.ts` binds both lists by GUID. Do not introduce title-based lookups.

**Currently aligned:**

- Read select set (`KUDOS_FIELDS`, `KUDOS_SELECT`, `RawKudosItem`) covers every workflow, scheduling, prominence, ownership, visibility, and engagement field in the schema snapshot.
- Submission writer writes `KudosId`, `Headline`, `Excerpt`, `Details`, `SubmittedDate`, `SubmittedById`, `WorkflowStatus=pending`, `WasEverPublished=false`, `ProminenceIntent=standard`, `HomepageEnabled=false`, `IsPinned=false`, `IsFeatured=false`, `IsScheduled=false`, `CelebrateCount=0`.
- Choice unions match the schema: `KudosWorkflowStatus` covers `pending | revisionRequested | approved | approvedScheduled | rejected | withdrawn | removedUnpublished`.
- `KudosEventType` enum (in the test harness) covers the 15+ audit event types in the schema appendix.

**Gaps to close in Prompts 01–05 (no new lists required):**

- Production writers for all governance transitions beyond initial submission — approve, reject, request revision, resubmit, withdraw, schedule/unschedule, pin/unpin, feature/unfeature, flag-for-admin-review/clear, admin-review closeout, claim/reassign, remove/restore, celebrate. Today these exist only as test-harness patch builders under `scripts/testing/people-kudos-workflow/peopleKudosWorkflowHelpers.ts`. They must move into production webpart code and each transition must write a matching row to `Kudos Audit Events`.
- Typed-recipient writes on submission (see §5).
- Notification hook points at the code paths where audit events are written, so submitter/recipient notifications are emitted only on real publish (not on pending-state transitions).

**Do not:** introduce a new SharePoint list, change field internal names, or derive governance state from presentation-only fields. The existing pair is sufficient.

---

## 7. Implementation scope lock

This is the frozen target state Prompts 01–06 must honor.

### 7.1 Product surfaces

- **HB Kudos employee webpart** — `apps/hb-webparts/src/webparts/hbKudos/` becomes the end-state recognition product: featured spotlight, pinned/standard feed, archive/browse, submission flow, celebrate interaction, role-aware detail panel. Transitional `peopleCulture/` remains untouched except for the minimum needed to keep already-provisioned instances rendering through the existing merged surface.
- **HR approval companion webpart** — `apps/hb-webparts/src/webparts/hbKudosCompanion/` becomes the end-state moderation/governance workspace: queues, approval/reject/revision behavior, admin review, scheduling, prominence governance, claim/reassign, audit timeline, bulk-safe governance actions, operational filters/presets/overdue handling. This is a new manifest; it must be added to `apps/hb-webparts/src/mount.tsx` and `apps/hb-webparts/config/package-solution.json` `componentIds`.
- **Shared detail panel** — hybrid recognition + governance panel, homepage-safe, shared with both webparts.
- **Non-recognition `peopleCulturePublic/` and `peopleCultureCompanion/`** — owned by the pc/ package. Kudos must not import from them, must not extend them, and must not move kudos logic into them.

### 7.2 Shared-first rule (hard precondition)

Prompts 02 and 03 must land their required shared primitives from §3.2 **before** any premium local implementation. Local inline premium shells for the repeated patterns listed in §3.2 are prohibited. Thin webpart-local composition shells that only wire data into shared primitives remain allowed.

### 7.3 Homepage entry-point rules (locked)

Homepage webparts in this package use `@hbc/ui-kit/homepage` as the primary UI entry point. Imports from `@hbc/ui-kit` (bare), `@hbc/ui-kit/primitives`, `@hbc/ui-kit/app-shell`, and `@hbc/ui-kit/fluent` are prohibited in webpart source. `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`, and `@hbc/ui-kit/branding` may be used only when the homepage entry point does not expose what is needed. `importDiscipline.test.ts` remains the active guardrail.

### 7.4 Recipient and storage rules (locked)

- Typed recipient model is the final-state contract (§5).
- `People Culture Kudos` and `Kudos Audit Events` are the only governing stores (§6).
- Production writers for governance transitions must each emit a matching audit event.
- List binding stays GUID-based.

### 7.5 Governance / permissions frame (from `Decision-Lock-Appendix.md`)

- Mixed authority by action; admin-only set covers pin, unpin, feature, unfeature, edit published, remove published, schedule, change/cancel schedule, restore removed, final admin-review closeout.
- One shared role model governs both the `hbKudos/` main webpart and the `hbKudosCompanion/` webpart.
- Access to the HR approval companion is restricted to HR reviewers + Kudos admins.
- Role assignment is configured through webpart properties and resolves to real SharePoint principals/groups, enforced in both UI and mutation code paths.

### 7.6 Out of scope for the kudos/ package

- Changes to `peopleCulturePublic/`, `peopleCultureCompanion/`, or pc/ helpers beyond read-only reuse of existing shared primitives.
- New SharePoint lists or field renames.
- Rebuilding shared surfaces outside the recognition/governance families listed in §3.
- Any change to the homepage entry-point exports beyond additive exports for new shared recognition/governance primitives.
- Promoting `kudosPage/` into a homepage webpart. If any of its logic is needed, it should be folded into `hbKudosCompanion/`.

### 7.7 Closure guardrails Prompt-06 must enforce

Prompt-06 may not claim closure if any of the following are still true:

- The composer or submission writer flows through a free-text recipient model.
- A homepage webpart in scope imports from a prohibited `@hbc/ui-kit` entry point.
- A repeated recognition/governance pattern in §3.2 is implemented as a local premium shell instead of a shared primitive.
- Governance transitions remain absent from production webpart code and live only in the test harness.
- A governance transition fires without emitting a matching `Kudos Audit Events` row.

---

**Lock status:** ✅ Scope locked. Prompts 01–06 of the kudos/ package may proceed against the frozen target state above.
