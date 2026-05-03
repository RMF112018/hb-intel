# Prompt 08 — Final Aggregate Validation and Unified Lifecycle Gap Remediation Closeout — Updated

## Objective

Perform the final repo-truth validation for the Wave 99 unified lifecycle remaining-gap remediation sequence and create one aggregate closeout document proving what was implemented across the committed prompt sequence, what was intentionally deferred, and how the work preserves the unified PCC architecture.

This prompt replaces the original Prompt 08 posture that assumed one large uncommitted feature batch. The work has now landed through a multi-commit prompt sequence. Prompt 08 is therefore a **final audit, validation, and aggregate closeout prompt**, not a new implementation prompt.

Do not create new product features, routes, cards, UI behavior, backend behavior, model contracts, package changes, manifest changes, or tenant/live-integration behavior.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 07D has completed and committed.

Expected completed baseline:

- Prompts 01–07D are committed on `main`.
- Prompt 07D finalized:
  - `UnifiedSearchRefusal.refusalReason: string -> PccHbiRefusalReason`;
  - Prompt 07 security / retention / permission closeout document.
- Prompt 06 completed:
  - Ask-HBI preview visible in Project Home read-model path;
  - Project Home Ask-HBI card starts idle;
  - no initial `unified-search` request on Project Home mount;
  - grounded answers require citations;
  - refusal / insufficient-evidence states remain explicit and safe.
- Prompt 07 completed:
  - knowledge reuse security / retention / permission posture documented;
  - model / fixture invariants hardened;
  - SPFx rendering / no-runtime / no-route guards hardened;
  - refusal taxonomy finalized.

If Prompt 07D has not completed, stop and report that Prompt 08 is blocked.

## Context Handling

Do not re-read files still in current context or memory. Re-open only files necessary to validate changed content, confirm acceptance criteria, or prepare the aggregate closeout.

Do not rely on prompt summaries alone. Use repo truth from `git log`, actual files, tests, and closeout docs.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -30
md5 pnpm-lock.yaml
git diff --stat
git diff --name-only
```

Expected:

- working tree clean before Prompt 08 starts;
- HEAD at or after the Prompt 07D commit;
- `pnpm-lock.yaml` MD5 remains:

```text
c56df7b79986896624536aab74d609f4
```

Classify any uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

If uncommitted files exist before Prompt 08 and are unrelated to Prompt 08, do not touch them. If they prevent clean validation or closeout, stop and report.

## Required Repo-Truth Audit

Prompt 08 must audit the committed sequence, not a single uncommitted diff.

### 1. Commit Sequence Audit

Use `git log --oneline -30` and any existing closeout docs to identify the completed prompt sequence.

Known commit anchors from the sequence include, but may not be exhaustive:

```text
dcd331940  Prompt 01 model contracts / fixtures
8e4c9db54  Prompt 02 read-model DTO map / envelopes
94df639e2  Prompt 02A model contract gap correction
8d55565bd  Prompt 03 backend canonical unified read-model routes
fe499218   Prompt 05C Project Readiness lifecycle context
bd2d56689  Prompt 06A unified search hook seam
e687d0377  Prompt 06B Ask-HBI grounding preview panel
f7bc6105b  Prompt 06C Project Home Ask-HBI integration
579ca2e18  Prompt 06D Ask-HBI grounding/security closeout
1d840cb36  Prompt 07A security / retention / permission architecture doc
21220bf4e  Prompt 07B model / fixture security invariants
1f7268f48  Prompt 07C SPFx knowledge reuse rendering guards
```

Prompt 07D commit must also be present before Prompt 08 proceeds.

Do not invent commit hashes. If any prompt hash is not visible in the latest `git log --oneline -30`, use available repo docs / closeout files to identify it, or state that it was not visible in the inspected range.

### 2. Changed-Files Audit

Review the actual files changed across the sequence using git ranges, commit inspection, or closeout docs. Do not rely only on commit messages.

At minimum, verify coverage in these areas:

- `packages/models/src/pcc/**`
- `backend/functions/src/hosts/pcc-read-model/**`
- `apps/project-control-center/src/api/**`
- `apps/project-control-center/src/surfaces/unifiedLifecycle/**`
- `apps/project-control-center/src/surfaces/projectHome/**`
- `apps/project-control-center/src/surfaces/projectReadiness/**`
- `apps/project-control-center/src/tests/**`
- `docs/architecture/blueprint/sp-project-control-center/**`

### 3. Existing Closeout Docs Audit

Inspect closeout docs created during the sequence, including:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Prompt_07_Security_Retention_Permission_Closeout.md
```

Also inspect any Prompt 06 / unified lifecycle closeout docs that exist in repo truth.

## Required Validation Gates

Run the strongest practical validation set for affected packages.

### Models

```bash
pnpm --filter @hbc/models build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

### Backend Functions

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

### SPFx Project Control Center

Use the correct package filter:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

Do **not** use:

```bash
pnpm --filter @hbc/project-control-center ...
```

### Targeted Prettier

Prompt 08 should author one aggregate closeout document. Run targeted Prettier check on that file after it is created.

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
```

If Prettier fails, run `pnpm exec prettier --write` only on the Prompt 08 closeout doc, then rerun the targeted check.

Do not run broad Prettier over the full PCC architecture folder unless targeted validation fails due to repo convention.

### Lockfile

```bash
md5 pnpm-lock.yaml
```

Expected unchanged:

```text
c56df7b79986896624536aab74d609f4
```

If any validation fails because of pre-existing unrelated issues, document exact evidence and do not hide it. If validation fails because of a Prompt 08-authored closeout doc formatting issue, fix only that doc.

## Required Acceptance Review

Before writing the aggregate closeout, confirm these architectural outcomes from repo truth.

### Unified PCC Architecture

Confirm:

- no new route or page creates preconstruction, operations, closeout, warranty, estimating, or other stage/department as a separate PCC workspace;
- unified lifecycle content is integrated into the existing Project Home and Project Readiness paths;
- role/stage lenses filter shared truth and do not become separate workspaces.

### Model Contracts and Fixtures

Confirm:

- lifecycle, memory, lenses, traceability, warranty, cross-project knowledge, and unified search / Ask-HBI response contracts exist;
- source lineage and evidence link metadata exist;
- security classification, redaction, allowed personas, and cross-project posture exist;
- cross-project references include security/redaction metadata;
- warranty trace responsibility is not asserted without evidence posture;
- `UnifiedSearchRefusal.refusalReason` is narrowed to `PccHbiRefusalReason` after Prompt 07D.

### Backend Read Models

Confirm:

- canonical GET-only backend read-model routes exist for unified lifecycle domains;
- no write routes were added;
- provider behavior remains fixture/mock-backed and read-only;
- no live tenant/external-system calls were introduced.

### SPFx Client / Fixture / Surface Seams

Confirm:

- SPFx client methods exist for canonical unified lifecycle / search read models;
- fixture client remains available and default-safe;
- Project Home read-model path includes unified lifecycle context and Ask-HBI preview;
- Project Readiness includes unified lifecycle context and Constraints Log readiness integration;
- no Project Readiness Ask-HBI card was added unless a later approved prompt explicitly did so;
- Project Home Ask-HBI starts idle on mount and does not fire `unified-search` automatically.

### Ask-HBI / Unified Search Grounding

Confirm:

- every grounded rendered answer has citations/source cues;
- refusal rows remain citation-free and explicit;
- non-available / restricted / degraded envelopes do not leak answer rows or synthetic secret content;
- HBI is not presented as source truth;
- no standalone Ask-HBI/search route or workspace exists;
- no live LLM/vector/search/external SDK integration was introduced.

### Security / Retention / Permission Posture

Confirm:

- `PCC_Knowledge_Reuse_Security_And_Retention_Model.md` exists;
- Prompt 07 closeout exists;
- security classes, redaction levels, persona/lens rules, pursuit/estimating sensitivity, executive notes, warranty/no-blame posture, closed-project references, cross-project search restrictions, source ownership, evidence links, HBI grounding, retention posture, reuse blockers, summary/raw access, and tenant-readiness gates are documented;
- tenant-hosted/live-integration evidence remains OPERATOR-PENDING and is not misrepresented as production ready.

### Guardrails

Confirm:

- no dependency/package/lockfile changes were introduced unless explicitly authorized;
- no SharePoint manifest bump was introduced unless explicitly authorized;
- no tenant mutation or live external-system write occurred;
- no Procore/Graph/PnP/Sage/CRM/Autodesk/Adobe/DocuSign runtime integration was added;
- import/source guards remain intact.

## Required Aggregate Closeout Document

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
```

If `phase-3/wave-99/` was created by Prompt 07D, use it. If Prompt 07D used a different discovered closeout path, use that same path and report the actual path used. Do not create a parallel closeout location.

The closeout must include the following sections.

### 1. Objective

Summarize the unified lifecycle gap remediation objective:

- keep PCC as one unified project operating layer;
- prevent departmental workspace fragmentation;
- create implementation seams for lifecycle continuity, project memory, traceability, warranty, cross-project knowledge, and Ask-HBI grounding;
- preserve fixture/default safety and read-only posture.

### 2. Baseline and Ending Repo Truth

Include:

- starting branch / HEAD for Prompt 08;
- ending branch / HEAD after Prompt 08 commit;
- lockfile MD5 before / after;
- note that this is an aggregate closeout over prior committed prompts, not a single feature batch.

Do not hard-code the final Prompt 08 commit hash into the closeout document before the commit exists. Use “this closeout commit” in the document and report the actual commit hash in the completion summary.

### 3. Prompt Sequence and Commit Evidence

Create a table with:

- prompt / phase label;
- commit hash;
- commit summary;
- primary files or package area;
- evidence status.

Include all visible prompt commits from Prompt 01 through Prompt 07D. If a commit is not visible in the inspected log range, state how it was verified or mark it as not visible in inspected range.

### 4. Files Changed by Category

Summarize by category:

- model contracts / fixtures / tests;
- backend provider / routes / tests;
- SPFx client / fixtures / hooks / surfaces / tests;
- Project Home integrations;
- Project Readiness / Constraints Log integrations;
- Ask-HBI grounding preview and security tests;
- architecture / closeout docs.

### 5. Model Contract Proof

Summarize evidence for:

- lifecycle stages/events/checkpoints;
- project memory/decision/assumption records;
- role/stage lenses;
- traceability graph/edges/clusters;
- warranty trace / no-blame responsibility posture;
- cross-project knowledge references;
- security/redaction/source-lineage/evidence metadata;
- Ask-HBI grounded/refusal response shapes;
- `PccHbiRefusalReason` finalization.

### 6. Backend Read-Model Proof

Summarize evidence for:

- canonical route IDs;
- GET-only posture;
- provider methods;
- deterministic mock/fixture responses;
- source-unavailable / backend-unavailable behavior;
- no live integrations / writes.

### 7. SPFx Project Home / Project Readiness Proof

Summarize evidence for:

- Project Home unified lifecycle cards;
- Project Home Ask-HBI card;
- idle-on-mount behavior;
- Project Readiness lifecycle context cards;
- Constraints Log readiness integration;
- no disconnected Constraints Log workspace;
- no separate stage/department workspace.

### 8. Ask-HBI / Unified Search Grounding Proof

Summarize evidence for:

- hook/controller seam;
- panel component;
- Project Home integration;
- citation/refusal safety;
- restricted/degraded leak prevention;
- source-truth disclaimer;
- no live LLM/vector/search integrations;
- no Ask-HBI/search route.

### 9. Security / Retention / Permission Proof

Summarize evidence from Prompt 07:

- 07A doc;
- 07B model invariants;
- 07C SPFx rendering / source guards;
- 07D refusal taxonomy finalizer and Prompt 07 closeout.

### 10. Validation Evidence

List validation commands and results from Prompt 08:

- models build/check/test;
- functions check/test;
- SPFx check/test;
- targeted Prettier;
- lockfile MD5.

If previous prompt validations are cited, separate them from Prompt 08 validations.

### 11. Architectural Confirmations

Explicitly confirm:

- no separate departmental PCC workspace was created;
- no source-of-record ownership conflict was introduced;
- no dependency/lockfile change occurred;
- no tenant mutation occurred;
- no live external-system write occurred;
- no production readiness claimed for OPERATOR-PENDING tenant/live-integration items.

### 12. Known Residual Gaps and Deferred Work

Carry forward deferred items:

- production auth/middleware;
- tenant permission validation;
- audit logging;
- legal/compliance retention periods;
- litigation-hold and records-disposition procedures;
- live HBI/vector/Graph/Procore/Sage integration gates;
- persona-aware query policy;
- user-facing permission explanations;
- telemetry/governance reporting;
- hosted SharePoint package validation, if applicable;
- additional routed surfaces/wiring only through future approved waves.

### 13. Prompt 08 Completion Statement

State whether Wave 99 unified lifecycle gap remediation is closed for the current fixture-backed / preview-safe implementation scope.

## Allowed Changes

Allowed:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
```

Allowed only if validation proves a narrow defect:

- formatting fix to the Prompt 08 closeout doc;
- extremely narrow correction to an existing closeout doc path reference if Prompt 07D used a different path and the aggregate closeout needs a pointer.

Not allowed:

- model source changes;
- backend source changes;
- SPFx source changes;
- tests, unless a validation command reveals a broken test caused by Prompt 08 documentation metadata, which is unlikely;
- package/dependency changes;
- `pnpm-lock.yaml` changes;
- SharePoint manifest changes;
- route/workspace changes;
- runtime behavior changes;
- tenant/live integration changes;
- broad formatting.

## Final Diff Review Before Commit

Before committing, inspect:

```bash
git diff --stat
git diff --name-only
git diff -- docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
```

Confirm the only intended changed file is the aggregate closeout document unless a narrow documented exception was required.

## Commit Instructions

If validation is acceptable and the closeout document is complete:

```bash
git add docs/architecture/blueprint/sp-project-control-center/phase-3/wave-99/Unified_Lifecycle_Gap_Remediation_Closeout.md
git commit
```

Recommended commit title:

```text
docs(pcc): close unified lifecycle gap remediation
```

Recommended commit description:

```text
Records the final aggregate closeout for the Wave 99 unified lifecycle gap remediation sequence.

- Summarizes the committed prompt sequence and evidence across models, backend read models, SPFx Project Home / Project Readiness integrations, Ask-HBI grounding, and security / retention / permission posture.
- Confirms PCC remains one unified project operating layer with no separate departmental workspace.
- Confirms grounded Ask-HBI answers require citations and refusals remain explicit.
- Confirms security/redaction/source-lineage/evidence posture and source-of-record boundaries.
- Records final validation results and unchanged lockfile posture.
- Carries OPERATOR-PENDING tenant/live-integration items forward to future work.
```

Do not push unless explicitly instructed.

## Required Response

Return:

1. Pre-edit repo truth.
2. Prompt 07D prerequisite confirmation.
3. Commit sequence audited.
4. Aggregate closeout doc path.
5. Files changed.
6. Validation results.
7. Lockfile MD5 before/after.
8. Architectural confirmations.
9. Known residual gaps / Prompt 08+ deferred work.
10. Commit hash if committed.
11. Whether push was performed. It should be `no` unless explicitly instructed.
