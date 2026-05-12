# Phase 08 Prompt 10E — Document Control Explorer Procore Directory and External References

## Role

You are implementing **Phase 08 Prompt 10E** in the `RMF112018/hb-intel` repo.

The explorer model, shell, and navigation behavior should already exist from Prompts 10B–10D. This prompt fills in the governed Procore deep-link directory posture and preserves external launch references without distorting the source rail.

---

## Objective

Implement a professional, read-only / launch-only Procore directory experience inside the Document Control explorer, plus concise launch-only external references for Document Crunch and Adobe Sign.

---

## Critical Parallel-Work Rule

Project Home work may be occurring in parallel.

Stay inside Documents-surface scope unless a previously approved narrow shared-file seam requires an update. Never alter or revert unrelated Project Home work.

---

## Required Preflight

1. Record branch, HEAD, git status, lockfile md5.
2. Confirm Prompts 10B–10D are present and green.
3. Classify current drift, including any Project Home parallel drift.
4. Proceed only if Procore/external-reference work can be completed without unrelated scope expansion.

---

## Locked Procore Directory Categories

The `Procore` source root must expose the following categories:

```text
Documents
Drawings
Specifications
RFIs
Submittals
Change Orders
Commitments
Change Events
Inspections
Observations
Punch List
```

Each category should read as a directory destination in the explorer.

---

## Procore Category and Record Posture

### Required UX behavior
- Selecting `Procore` shows the category directory.
- Selecting a Procore category shows a governed category pane/list.
- The UI must make clear that PCC is providing deep-link/reference posture and not mirroring or writing back to Procore.

### Fixture / preview rows
Implement deterministic, professional preview rows for linked-record/item behavior where needed to demonstrate the model.

Rows may represent:
- document-like items;
- drawing/spec references;
- RFI/submittal/change/inspection/observation/punchlist records.

Do not fabricate live status beyond the prompt’s fixture/read-only context. Production-grade sample copy is acceptable only when it is clearly presented as governed preview/read-only surface content rather than live transactional data.

### Interaction posture
- If an actual deep-link launch is not supported in the current code posture, do not render fake active links.
- Use disabled/preview launch controls only when accompanied by visible reason copy.
- If the repo already has a launch-only link convention that is genuinely executable and safe, reuse it; do not invent a new external-launch runtime pattern.

---

## External References

`Document Crunch` and `Adobe Sign`:
- remain launch-only external references;
- do not become primary source rail roots;
- should appear in a compact, clear Document Control Home section or equivalent explorer-compatible location;
- must expose authority copy that PCC opens or references the source system and performs no writeback.

---

## Required Copy Posture

User-facing copy should make these distinctions clear:

- SharePoint Project Record = formal project file record.
- My Project Files = project-scoped working files.
- Procore = source-system linked records / deep-link access only.
- Document Crunch / Adobe Sign = external launch-only references.

Do not use user-facing:
```text
TODO
TBD
mock
fixture
placeholder
not implemented
developer
prompt
repo
```

---

## Tests Required

Add/update tests proving:
1. Procore root renders the locked category set.
2. Selecting a Procore category updates the main pane.
3. Procore no-writeback / launch-only copy renders.
4. Launch-like controls are honest; disabled/preview states include reason copy when not executable.
5. Document Crunch and Adobe Sign are present as external references in the selected design location.
6. Document Crunch and Adobe Sign are not source-rail roots.
7. One-click source switching remains intact after Procore category navigation.

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
- files changed;
- Procore category implementation summary;
- whether linked-record preview rows were implemented and why;
- external references treatment;
- false-affordance review;
- Project Home parallel-work preservation note;
- validation results;
- lockfile md5 before/after;
- readiness for Prompt 10F.
