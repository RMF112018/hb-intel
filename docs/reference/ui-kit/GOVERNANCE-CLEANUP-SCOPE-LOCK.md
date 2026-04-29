# Governance Cleanup Scope Lock (Prompts 02-09)

## Prompt 01 Lock Purpose

This document locks execution scope and guardrails before governance cleanup prompts continue.

This lock is documentation/governance-only and does not authorize product/runtime implementation changes.

## Authority and Package Relationship

- Existing package `docs/architecture/plans/MASTER/ui-kit/wave-02/` is prior planning/source material and remains unmodified in Prompt 01.
- Active Prompt-01 execution evidence for this run is under `docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/`.
- To avoid competing authorities for this run, Prompt-01 inventory/scope decisions are anchored to `governance-cleanup-2026-04` while preserving `wave-02` as historical/scoping input.

## Path Scope

### Allowed Write Paths

- `docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**`
- `docs/reference/ui-kit/GOVERNANCE-CLEANUP-SCOPE-LOCK.md`

### Forbidden Mutation in Prompt 01

- app/runtime source (including `apps/**` implementation code)
- backend, infra, CI/CD, and deployment scripts
- SPFx manifests, package-solution files, `.sppkg`
- package versions and lockfiles
- tenant/provisioning/Graph/PnP/Procore operations
- `packages/ui-kit/src/branding/**` binary asset changes
- font binary files and font package relocation

## Current vs Target Brand Archive Posture

1. **Current repo truth:** brand archive currently exists at `docs/reference/brand/HB-Brand-Guide.zip`.
2. **Target governance posture:** source archive territory should be `docs/reference/brand/source/`.
3. **Deferred action:** any move/copy/reconciliation to align current path with target source territory is explicitly deferred to a later authorized prompt.

## Brand and Asset Handling Rules

- Preserve `docs/reference/brand/` governance docs and treat live repo truth as authoritative.
- Stable reusable corporate brand assets belong in `@hbc/ui-kit/branding`, not app-local folders.
- Product code must not import raw assets from `docs/reference/brand/`.
- `docs/reference/brand/source/` is reserved as source-of-truth archive territory in governance posture, even if currently absent.
- Do not delete historical planning/governance docs in this prompt; prefer explicit authority/supersession notes.

## Hard Font Guardrail (Prompt 01)

Prompt 01 may document font posture only. Prompt 01 must **not**:

- extract font binaries;
- inventory binary font contents by filename;
- move/copy font files;
- create `@font-face` declarations;
- expose fonts via new theme exports.

If license/internal-use permission is unclear for any future prompt, stop before any font copy/move and record a blocker.

## SPFx Import-Policy Proof Scope (Read-Only)

Read-only proof scope for import-policy/governance references:

- `apps/hb-webparts/**`
- `apps/project-sites/**`
- `packages/spfx/**`

Evidence should cite policy/config/docs; no consumer runtime mutation is authorized by Prompt 01.

## Prompt 02-09 Boundary Reminder

Until explicitly expanded by a later authorized prompt:

- governance/documentation alignment remains primary;
- no product UI implementation work;
- no backend/tenant/CI-CD/deployment mutation;
- no brand/font binary redistribution or unmanaged font introduction.

## Prompt 01 Validation Commands

Required validation for Prompt 01 output:

```bash
git status --short
pnpm exec prettier --check docs/reference/ui-kit/GOVERNANCE-CLEANUP-SCOPE-LOCK.md docs/architecture/plans/MASTER/ui-kit/governance-cleanup-2026-04/**/*.md
```
