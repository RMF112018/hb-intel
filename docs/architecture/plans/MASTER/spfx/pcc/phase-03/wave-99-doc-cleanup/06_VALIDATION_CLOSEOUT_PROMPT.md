# 06 — Validation and Documentation Closeout Prompt

## Objective

Validate the documentation-only update package, create a closeout artifact, and prepare a commit summary. Do not commit unless instructed by the user.

## Required Validation Commands

From `/Users/bobbyfetting/hb-intel`, run:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
```

Run Prettier check on all created/modified Markdown files only. Do not run broad formatting unless the repo standard explicitly requires it and the user authorizes it.

Example pattern:

```bash
pnpm exec prettier --check <touched-doc-1> <touched-doc-2> ...
```

If any touched doc fails, run:

```bash
pnpm exec prettier --write <failing-docs-only>
pnpm exec prettier --check <same-docs>
```

Then rerun:

```bash
git diff --check
git status --short
md5 pnpm-lock.yaml
```

## Required Closeout File

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/Unified_Lifecycle_Documentation_Update_Closeout.md
```

## Required Closeout Sections

1. Objective
2. Scope
3. Baseline Repo State
4. Documents Created
5. Documents Modified
6. Architecture Decisions Captured
7. Guardrails Added
8. Source-of-Record Alignment
9. Runtime / Model / Backend / SPFx Non-Change Statement
10. Validation Commands and Results
11. Lockfile MD5 Before / After
12. Remaining Gaps
13. Recommended Next Documentation Package
14. Recommended Future Implementation Sequence
15. Commit Recommendation

## Required Remaining Gaps to Include

Unless your repo-truth inspection proves these were fully resolved elsewhere, include these as remaining or future-phase gaps:

- First-class TypeScript model contracts for lifecycle events, memory records, lenses, traceability, knowledge references, and warranty trace records are not implemented by this documentation-only package.
- Runtime PCC UI does not yet include project memory panels, lifecycle timelines, traceability views, warranty trace mode, closed-project reference mode, or unified HBI search.
- Backend read models do not yet expose lifecycle/memory/traceability/search endpoints.
- Constraints Log and Buyout Log implementation seams may still require later alignment between primary governance location, Project Readiness rollups, and surface affinity.
- Cross-project knowledge reuse requires additional security, retention, and permission modeling before implementation.
- Warranty traceability requires evidence requirements and source-system integrations before it can support production claims analysis.
- HBI grounding requires retrieval, citation, permission filtering, refusal, and audit rules before user-facing deployment.

## Commit Summary Draft

Prepare but do not run commit unless user instructs.

Recommended commit summary:

```text
docs(pcc): define unified lifecycle architecture
```

Recommended commit body:

```text
Defines the PCC unified lifecycle architecture as a documentation-only update.

- Adds governing doctrine for PCC as one project operating layer, not departmental workspaces.
- Adds lifecycle spine, project memory, role/stage lens, traceability, knowledge reuse, warranty traceability, and HBI grounding architecture docs.
- Aligns existing PCC architecture docs and Phase 3 registers to reference the unified lifecycle doctrine.
- Clarifies surfaces vs work centers vs workflow modules vs lenses.
- Clarifies readiness signal rollups for Constraints Log and Buyout Log without changing source ownership.
- Adds guardrails for source-of-record boundaries, HBI grounding, cross-project security, and warranty evidence.
- Adds documentation closeout with validation results.

No runtime source, model, backend, SPFx, package, dependency, or lockfile changes.
```

## Final Response to User

Return:

- concise summary of work completed;
- list of files created;
- list of files modified;
- validation results;
- lockfile MD5 before/after;
- any remaining gaps;
- commit recommendation.
