# Prompt 00 — Repo-Truth Revalidation and Gap Confirmation

## Objective

You are working in the live repo at:

```text
/Users/bobbyfetting/hb-intel
```

Revalidate repo truth before making any changes. Confirm the current branch, HEAD, lockfile posture, recent commits, and the exact implementation state of the unified lifecycle architecture seams.

Do not implement code in this prompt unless explicitly instructed after the audit output is reviewed. This prompt produces the execution baseline for Prompts 01–08.

## Required Commands

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` is not present at repo root, stop and report that as a repo-truth issue.

## Context Handling

If files are already available in your current context or memory, do not re-read them unnecessarily. Use existing context first and only re-open files where repo truth must be verified or prior context is stale, incomplete, or contradictory.

## Required Targeted Inspection

Verify whether the following doctrine docs exist and are current:

- `docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Lifecycle_Spine.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Role_And_Stage_Lens_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`

Verify whether the following implementation seams already exist:

- TypeScript contracts for lifecycle events.
- TypeScript contracts for project memory records.
- TypeScript contracts for role/stage/task lenses.
- TypeScript contracts for traceability edges.
- TypeScript contracts for warranty trace records.
- TypeScript contracts for cross-project references.
- Backend read-model routes for lifecycle, memory, traceability, warranty trace, cross-project references, and unified search/HBI grounding.
- SPFx read-model clients for those endpoints.
- SPFx fixtures and preview UI for lifecycle timeline, project memory, related records, warranty trace mode, closed-project reference mode, and unified search/HBI grounding.
- Project Readiness UI integration for Constraints Log.
- Security/retention/permission documentation for cross-project knowledge reuse.

## Required Output

Return a concise but complete audit report with:

1. Branch/HEAD/lockfile status.
2. Recent commit summary relevant to PCC unified lifecycle work.
3. Confirmed docs present.
4. Confirmed implementation seams present.
5. Gaps still open.
6. Files likely to change in Prompts 01–08.
7. Any blockers before continuing.

## Stop Condition

Stop after the audit report. Do not edit files in this prompt unless the user explicitly authorizes proceeding.
