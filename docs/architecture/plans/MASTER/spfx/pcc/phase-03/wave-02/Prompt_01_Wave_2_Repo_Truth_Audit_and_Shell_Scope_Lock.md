# Prompt 01 — Wave 2 Repo Truth Audit and Shell Scope Lock

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Conduct a fresh repo-truth audit and create the Wave 2 scope lock for the PCC SPFx Shell Frame. This prompt is documentation-first and must not implement shell code unless the current prompt explicitly says to do so. It must close the proof gates for beginning Wave 2 implementation.

## Required Audit Targets

Inspect at minimum:

```text
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
docs/architecture/blueprint/sp-project-control-center/**
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md
packages/models/src/pcc/**
apps/project-sites/**
packages/spfx/src/webparts/projectSites/**
apps/hb-webparts/src/webparts/hbHomepage/**
docs/reference/ui-kit/doctrine/**
docs/reference/spfx-surfaces/**
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

## Required Findings

Document:

- whether Wave 1 closeout is present and complete;
- whether `@hbc/models/pcc` exposes the required shared foundations;
- whether `PCC_MVP_SURFACE_IDS`, `PCC_MVP_SURFACES`, and `PCC_FIXTURES` exist;
- whether `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png` exists and is readable;
- whether `apps/project-control-center/` already exists;
- which existing SPFx app pattern should be followed;
- what files are allowed and forbidden for Wave 2;
- whether local Vite preview is supported by repo precedent;
- whether dev-harness wiring should be allowed or deferred;
- whether any current repo state conflicts with the closed decisions.

## Required Deliverables

Create/update documentation under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/
```

Deliver:

```text
Wave_2_Repo_Truth_Audit.md
Wave_2_Scope_Lock.md
Wave_2_Decision_Closure_Register.md
Wave_2_UIUX_Basis_of_Design.md
Wave_2_Wireframe_and_Layout_Contract.md
```

The Decision Closure Register must incorporate the closed decisions from `01_Wave_2_Decision_Closure_Register.md` in this package.

## Non-Negotiable Decisions

- Target: `apps/project-control-center/`, unless repo truth shows a material conflict.
- Design reference: `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`.
- Layout: flexible bento/masonry-style grid, not homepage paired rows.
- Data: Wave 1 fixtures only, no live backend/Graph/PnP/Procore.
- Security: persona/capability metadata is display-only.

## Validation

Run documentation-safe validation:

```bash
git status --short
pnpm format:check
```

If no code changed, do not run broad build/test commands unless repo conventions require documentation validation.

## Closeout

Write a closeout section confirming:

- implementation code was not started;
- no backend/provisioning/tenant/Graph/PnP/Procore/deployment work occurred;
- whether Prompt 02 may proceed.
