# Prompt 05 — Closeout Validation

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to validate the Wave 10 documentation update and produce closeout.

## Global Guardrails

- Do not re-read files that are still within current context or memory.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless explicitly authorized and consistent with repo governance.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package or deploy SPFx.
- Do not mutate tenant or external systems.
- Do not introduce secrets/app settings.
- Do not perform live AHJ, Procore, Microsoft Graph, Adobe, Document Crunch, Sage, Compass, or other external operations.
- Use targeted docs validation first.
- Keep AHJ interactions to launcher links only unless a later implementation phase explicitly authorizes more.
- Preserve workbook source traceability.
- Preserve Wave 10 relationship to Wave 8 Project Readiness and Wave 14 Approvals / Checkpoints.
- Preserve repo-truth citations and actual file paths.


## Required Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <all touched markdown files>
```

If source files were touched unexpectedly, stop and report.

## Required Closeout File

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-10/Wave_10_Documentation_Closeout.md
```

## Closeout Must Include

- files changed
- what was updated
- what was intentionally not implemented
- validation results
- lockfile checksum before/after
- no package/dependency changes
- no source code changes unless explicitly authorized
- no runtime implementation
- no tenant mutation
- no AHJ runtime integration
- no Procore runtime integration
- no Microsoft Graph / SharePoint mutation
- no SPFx package/deployment changes
- workbook traceability confirmation
- target architecture confirmation
- unresolved risks/open items
- recommended next implementation prompt

## Commit Format

Commit summary:

```text
docs(pcc): define wave 10 permit and inspection control center
```

Commit description:

```text
Updates Phase 3 Wave 10 planning, blueprint, roadmap, source mapping, and closeout documentation to define the unified Permit & Inspection Control Center.

Expands the prior Permit Log posture into a governed permit lifecycle, required inspection readiness, AHJ launcher, fee exposure, failed/reinspection workflow, evidence-backed closeout, Priority Actions, Project Readiness, and Approvals / Checkpoints architecture.

Grounds the module in the company permit and inspection log templates while preserving source traceability. Adds required permit revision, application value, permit fee, and re-inspection fee fields.

Documentation-only. No source code, package, lockfile, manifest, deployment, tenant, AHJ, Procore, Microsoft Graph, SharePoint mutation, or external-system runtime changes.
```
