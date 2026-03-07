# Phase 5 Auth/Shell Documentation Overview

- **Status:** Phase 5.18 documentation package
- **Date:** 2026-03-06
- **Scope:** `@hbc/auth` + `@hbc/shell` technical and operational documentation baseline

## Purpose

This overview indexes the final Phase 5 documentation package and defines how each
reference document maps to locked Option C decisions and Phase 5 release criteria.

## Documentation Package Map

1. Package purpose and boundaries:
   - `packages/auth/README.md`
   - `packages/shell/README.md`
2. Core contracts and architecture references:
   - `docs/reference/auth-shell-architecture-contracts.md`
   - `docs/reference/auth-shell-store-contracts-and-state-diagrams.md`
   - `docs/reference/auth-shell-provider-adapter-and-runtime-modes.md`
3. Governance and policy references:
   - `docs/reference/auth-shell-governance-and-policies.md`
4. Validation and release package references:
   - `docs/reference/auth-shell-validation-and-release-package.md`
   - `docs/architecture/release/PH5-final-release-checklist-and-signoff.md`
5. Deferred-scope roadmap:
   - `docs/reference/auth-shell-deferred-scope-roadmap.md`

## Coverage Matrix (Required by PH5.18)

- Architecture overviews for auth/shell: covered in package READMEs + architecture contracts doc.
- Store contracts/state diagrams: covered in store contracts/state diagrams doc.
- Provider/adapter behavior + runtime detection/override docs: covered in provider/adapter runtime doc.
- Role mapping + permission model: covered in architecture contracts + governance docs.
- Override governance/admin process + emergency policy: covered in governance/policies doc.
- Shell-status hierarchy + degraded-mode policy: covered in governance/policies + store/state docs.
- SPFx host boundary + protected feature registration contract: covered in architecture contracts doc.
- Test matrix + release checklist docs: covered in validation/release package doc.
- Deferred-scope roadmap notes: covered in deferred-scope roadmap doc.

## Traceability

- `docs/architecture/plans/PH5.18-Auth-Shell-Plan.md` §5.18
- `docs/architecture/plans/PH5-Auth-Shell-Plan.md` (locked Option C + final definition of done)
- `docs/architecture/plans/PH5.17-Auth-Shell-Plan.md` (release gating continuity)
- `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` §§1e, 1f, 2b, 2c, 2e
- ADR references: `ADR-0053` through `ADR-0071`
