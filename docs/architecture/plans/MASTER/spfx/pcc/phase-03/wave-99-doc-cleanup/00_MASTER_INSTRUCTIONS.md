# 00 — Master Instructions: PCC Unified Lifecycle Documentation Update

## Role

You are a local code agent operating in the live repo:

```text
/Users/bobbyfetting/hb-intel
```

You are supporting HB Intel / Project Control Center architecture documentation.

## Objective

Make documentation-only updates that lock the PCC target architecture as a unified, lifecycle-aware, companywide project operating layer.

The PCC must not evolve into disconnected departmental workspaces for Business Development, Estimating, Preconstruction, Operations, Accounting, Closeout, Warranty, Executive Oversight, or IT. It must remain one project-first operating layer where role, stage, and task context are expressed through lenses, views, source lineage, traceability, and governed permissions.

## Scope

Documentation only.

Allowed:
- Create new Markdown architecture docs under:
  - `docs/architecture/blueprint/sp-project-control-center/`
- Amend existing PCC architecture Markdown docs under:
  - `docs/architecture/blueprint/sp-project-control-center/`
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/`
  - existing Phase 3 wave folders, only where needed for cross-reference alignment
- Add a documentation closeout file under:
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/`

Not allowed:
- Runtime source-code changes.
- SPFx implementation changes.
- Backend function changes.
- Model/package TypeScript changes.
- Fixture changes.
- Test changes, except running existing doc validation if applicable.
- Package/dependency changes.
- Lockfile changes.
- Broad formatting sweeps.
- Tenant mutation.
- SharePoint/Graph/Procore/Sage/CRM writeback.
- New modules or feature implementations.

## Context Efficiency

Do not re-read files that are still within your current context or memory. Use the current context first. Re-open files only where repo truth must be verified, where the content may be stale, or where contradiction exists.

## Non-Negotiable Architecture Thesis

The documentation updates must state and enforce this thesis:

PCC is one unified project operating layer. Work centers organize governed capabilities. Workflow modules represent task/control patterns. Role and stage lenses change what a user sees and can act on, but they do not create separate departmental workspaces. Project memory, lifecycle events, source lineage, evidence links, and traceability connect information across the full project lifecycle.

## Required Guardrails to Embed

- No separate departmental PCC workspaces.
- No duplicate source-of-record claims.
- No source-system writeback without an explicit future gate.
- No Procore/Sage/CRM/Graph mutation from this package.
- No cross-project leakage of sensitive pursuit, executive, financial, warranty, HR, or privileged information.
- No treating HBI/AI answers as source truth without source citations.
- No warranty responsibility or obligation conclusions without evidence lineage.
- No hidden module-specific architecture that bypasses the unified shell.
- No production rollout or tenant mutation.
- No package/dependency/lockfile changes.

## Required Output Style

Write concise but complete architecture documentation.

Use the repository's existing tone:
- formal,
- operational,
- implementation-aware,
- source-of-record disciplined,
- clear about MVP vs later phases,
- explicit about guardrails.

Avoid aspirational marketing language. Make the docs useful to future implementers and reviewers.

## Commit Discipline

Do not commit until all prompts in the sequence are completed and the final validation prompt authorizes commit preparation.

When ready, use a documentation-only commit message similar to:

```text
docs(pcc): define unified lifecycle architecture
```

Commit body should summarize:
- new unified lifecycle doctrine docs,
- existing architecture doc alignment,
- no runtime code changes,
- validation commands run,
- lockfile unchanged.
