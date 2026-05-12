# Phase 08 Prompt 10F — Document Control Legacy Card Reconciliation and Guardrail Migration

## Role

You are implementing **Phase 08 Prompt 10F** in the `RMF112018/hb-intel` repo.

Prompts 10B–10E should already have established the explorer model, ready-path shell, navigation behavior, and Procore/external reference posture. This prompt reconciles the old Document Control card composition with the new explorer-first target.

---

## Objective

Remove or retire the old ready-path lane-card / permissions / reviews dominance from the Documents surface while preserving essential guardrail copy and any legitimately reused model logic.

The final ready-path Documents experience must read as a **Document Control Explorer**, not a hybrid explorer-plus-dashboard-card compromise.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Do not touch Project Home surfaces, choreography, or unrelated tests. Preserve shared-file drift and keep the scope document-specific.

---

## Required Preflight

1. Record current branch, HEAD, git status, lockfile md5.
2. Confirm Prompts 10B–10E are present and green.
3. Classify any drift, including parallel Project Home drift.
4. Identify exactly which old Documents components remain rendered on the ready path and why.

---

## Required Reconciliation Decisions

### 1. Lane cards
The old ready-path lane cards should no longer function as the primary Documents surface.

Required action:
- remove them from the ready-path explorer composition if still rendered;
- preserve or delete underlying code only after confirming whether it remains referenced by non-ready branches, tests, or necessary supporting posture.

### 2. Permissions & Guardrails card
The bulky permissions/reference card should not remain as a competing ready-path page section in the explorer surface.

Required action:
- remove it from the ready path;
- migrate only directly useful browsing guardrails into the explorer shell where relevant:
  - no full OneDrive root;
  - project-scoped working files;
  - no external writeback;
  - launch-only Procore posture.

### 3. Reviews & Approvals card
The reviews card is not part of the explorer-first file-access flow.

Required action:
- remove it from the ready path;
- preserve reusable model/types only if still needed elsewhere or intentionally retained for later work;
- do not invent a new review queue panel inside the explorer during this prompt.

### 4. Loading/error state
Do not damage full-surface loading/error state behavior. If a whole-surface state card remains the cleanest degraded posture, preserve it.

### 5. Tests/docs
Update tests and surface comments so they describe the new explorer contract rather than stale card composition. Do not weaken assertions; replace obsolete product expectations with intentional new ones.

---

## Guardrail Migration Requirements

The explorer must still make the following user-facing safety ideas clear:

- Project Record is read-only reference in Prompt 10.
- My Project Files are project-scoped working files and are not the formal record merely by existing there.
- Procore remains launch/deep-link/reference posture only.
- PCC performs no source-system writeback.

These messages should be concise and placed where users need them, not buried in an admin-style reference dump.

---

## Tests Required

Add/update tests proving:
1. Old lane cards are not rendered as the ready-path primary Documents experience.
2. Permissions & Guardrails card is absent from ready path unless a non-ready branch intentionally preserves it, in which case the branch is tested precisely.
3. Reviews & Approvals card is absent from ready path unless a non-ready branch intentionally preserves it, in which case the branch is tested precisely.
4. Essential guardrail copy remains visible in the explorer.
5. Loading/error behavior remains intact.
6. No duplicate Documents header regression returns.
7. Bento direct-child and active-panel contracts remain green.

---

## Required Validation

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

---

## Closeout Requirements

Include:
- starting/ending HEAD;
- drift classification;
- files changed;
- what old ready-path cards were removed/reconciled;
- what guardrail copy was migrated and where;
- what code was retained intentionally;
- tests and validation results;
- Project Home parallel-work preservation note;
- readiness for Prompt 10G.
