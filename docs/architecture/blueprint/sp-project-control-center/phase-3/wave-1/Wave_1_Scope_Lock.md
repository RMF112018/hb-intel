# Phase 3 Wave 1 — Scope Lock

Generated: 2026-04-28
Prompt: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_01_Wave_1_Repo_Truth_Audit_and_Scope_Lock.md`
Companion audit: `Wave_1_Repo_Truth_Audit.md` (this directory)

## Purpose

This document locks the scope, locations, validation commands, and guardrails for **Phase 3 Wave 1 — PCC Shared Foundations**. It governs Prompts 02 through 07 of the Wave 1 prompt package.

This document does not implement code. It does not modify package, app, backend, tooling, infrastructure, manifest, CI/CD, or version files.

## Wave 1 Authorization Posture

- **Prompt 01 (this prompt):** Documentation-only. Authored.
- **Prompts 02–07:** Code authorization is **not auto-granted** by this scope lock. They remain documentation-only until the user explicitly authorizes Wave 1 code execution. See **W1-ODR-009 (carry-forward)** below.
- **Wave 2 and later:** Out of scope for Wave 1. No shell, backend, module, provisioning executor, tenant mutation, Graph/PnP, Procore runtime, or rollout work begins under Wave 1.

## Locked Decisions

The following decisions are now locked for Wave 1. They resolve the corresponding entries in `Wave_1_Open_Decision_Register.md`.

### Shared model location (resolves W1-ODR-001, W1-ODR-002)

```text
packages/models/src/pcc/
```

- `@hbc/models` is the canonical shared TypeScript model package and is already backend-consumed.
- No new package is created. App-local model folders are disallowed.
- Each PCC concept gets a sub-folder under `packages/models/src/pcc/`, consistent with existing domain-folder convention.

### Export strategy (resolves W1-ODR-003)

- `packages/models/src/pcc/index.ts` — PCC barrel.
- Re-export from `packages/models/src/index.ts` consistent with the existing root barrel pattern.
- Subpath export (e.g., `@hbc/models/pcc`) is allowed only if it matches an existing wildcard or domain export pattern in the package; if a new subpath is required, it must be raised as a separate decision before Prompt 07.

### Fixture location (resolves W1-ODR-004)

```text
packages/models/src/pcc/fixtures/
```

- Deterministic, non-secret, no real tenant URLs.
- No imports from `@hbc/project-site-template` validation fixtures or `@hbc/data-seeding` for Wave 1.

### Test strategy (resolves W1-ODR-005)

- Vitest tests at `packages/models/src/pcc/**/*.test.ts`.
- Type-level checks for shape stability.
- Value-level checks for registry contents.
- Source-scan guard tests where applicable (no-mutation, no-secret, no-Procore-runtime indicators).

### Feature/module flag posture (resolves W1-ODR-006)

- Pure model constants only.
- No runtime wiring (no shell config plumbing, no backend config, no live cohort/feature-flag service binding) in Wave 1.

### No-mutation guard strategy (resolves W1-ODR-007)

- Pure local guard tests inside `@hbc/models`.
- **Do not** import `@hbc/project-site-provisioning` from `@hbc/models` — that would invert the allowed dependency direction.
- If reuse of provisioning's no-mutation utility is later desirable, it must come through a non-runtime extraction decided separately.

### SPFx/backend boundary (resolves W1-ODR-008)

PCC shared models must not import any of:

- `@microsoft/sp-*`
- PnPjs (`@pnp/*`)
- Azure SDK packages
- backend runtime packages
- Procore SDKs or HTTP clients
- tenant-specific runtime configuration modules

Pure TypeScript only.

### PCC project status posture (resolves W1-ODR-011)

- Define PCC-namespaced status type(s) reflecting the contract values (`Active`, `On Hold`, `Closed`, `Archived`).
- Do **not** mutate or extend legacy `packages/models/src/project/ProjectEnums.ts` `ProjectStatus`.

### Persona/role posture (resolves W1-ODR-012)

- Define PCC persona types/registries.
- Optional mapping helper between PCC personas and existing `ProjectRole` is allowed.
- Do not mutate existing `ProjectRole` types.

### External system catalog breadth (resolves W1-ODR-013)

- Include user-required systems and contract-supported placeholders.
- Each entry carries explicit MVP / later / deferred posture.
- No Procore runtime, no Procore secrets, no mirror, no write-back.

### Documentation closeout path (resolves W1-ODR-014)

- Wave 1 docs (this scope lock + audit) live under:

  ```text
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/
  ```

- The `plans/MASTER/spfx/pcc/phase-03/wave-01/` area remains the prompt-sequence working area; it is not the closeout location for Wave 1 deliverables.

## Allowed Files (Wave 1, when Prompts 02–07 are authorized)

```text
packages/models/src/pcc/**
packages/models/src/index.ts                 # only to add the PCC barrel re-export
packages/models/README.md                    # only if PCC additions warrant a note
packages/models/src/pcc/**/*.test.ts
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/**
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/**   # working-area updates only when explicitly required
```

## Forbidden Files (every Wave 1 prompt, including Prompt 01)

```text
apps/**
backend/functions/**
packages/project-site-template/**
packages/project-site-provisioning/**
packages/** (any package other than @hbc/models, and even @hbc/models is restricted to src/pcc/** + barrel re-export)
tools/**
infra/**
.github/**
dist/**
*.sppkg
package.json
pnpm-workspace.yaml
turbo.json
tsconfig.base.json
```

No version bumps. No SPFx manifest edits. No CI/CD changes. No app catalog artifacts.

## Locked Validation Commands

### Prompt 01 (this prompt)

```bash
git status --short
# optional, only if repo formatting expects it for new Markdown
pnpm format:check
```

Do not run build/test/typecheck commands; no code changed.

### Prompts 02–07 (when authorized)

```bash
git status --short
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
# optional
pnpm --filter @hbc/models lint
```

Broader workspace runs are not required for Wave 1.

Forbidden validation actions for every Wave 1 prompt: tenant calls, Graph/PnP calls, app-catalog deployment, SPFx package upload, CI/CD trigger, Procore live calls.

## Wave 2+ Exclusion

The following are explicitly out of scope for Wave 1 and must not begin under any Wave 1 prompt:

- PCC shell UI (`apps/project-control-center/`)
- Project Home UI changes
- backend routes/APIs
- provisioning executor
- tenant mutation
- Graph/PnP live calls
- Procore runtime, secrets, mirror, write-back
- direct SPFx-to-Procore paths
- automated access execution
- automated Site Health repair execution
- production rollout
- app catalog deployment
- CI/CD deployment workflow changes
- package or SPFx manifest version bumps

## Carry-Forward Open Decision

**W1-ODR-009 — Whether Wave 1 (Prompts 02–07) may proceed with code now.**

- This scope lock does not authorize code execution for Prompts 02–07.
- Code execution requires explicit user authorization recorded either in a follow-up commit message, in the Wave 1 register (`Wave_1_Open_Decision_Register.md`), or in a follow-on planning prompt.
- Until then, Prompts 02–07 remain documentation-only.

All other entries (W1-ODR-001 through W1-ODR-008 and W1-ODR-010 through W1-ODR-014) are resolved above.

## Cross-References

- `Wave_1_Repo_Truth_Audit.md` — companion audit (this directory)
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/README.md` — Wave 1 prompt-package overview
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Prompt_01_Wave_1_Repo_Truth_Audit_and_Scope_Lock.md` — executing prompt
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Open_Decision_Register.md` — open decisions
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-01/Wave_1_Validation_Matrix.md` — validation matrix
- `docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md` — PCC contract source of truth
- `docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md` — strategic source
