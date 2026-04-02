# README — Admin SPFx IT Control Center Phase 1 Prompt Package

## What this package contains

This package is a **local-code-agent execution set** for **Phase 1 — Boundary hardening and program baseline** of the Admin SPFx IT Control Center effort.

Included files:

1. `Admin-SPFx-IT-Control-Center-Phase-1-Summary-Plan.md`
2. `Prompt-01-Phase-1-Repo-Truth-Audit-and-Authority-Set.md`
3. `Prompt-02-Phase-1-Architecture-Baseline.md`
4. `Prompt-03-Boundary-Matrix-and-Layer-Ownership-Doctrine.md`
5. `Prompt-04-Admin-Domain-Taxonomy-and-Release-Scope-Map.md`
6. `Prompt-05-Locked-Decisions-and-Phase-Boundary-Guards.md`
7. `Prompt-06-Doc-Alignment-and-Local-Guidance-Updates.md`
8. `Prompt-07-Validation-and-Phase-1-Exit-Reconciliation.md`

## Intended execution order

Run the prompt files in numeric order.

Do **not** skip ahead unless a prompt explicitly tells the agent to stop because repo truth materially differs from the assumptions captured here.

## How the local code agent should use these prompts

- Treat `docs/architecture/blueprint/current-state-map.md` plus verified live code as present-truth authority.
- Read only the smallest authoritative set needed for the current prompt.
- Do **not** re-read files that are still in active context or memory unless:
  - the prompt explicitly requires a fresh check,
  - the file changed,
  - the context became stale,
  - or the task widened.
- Prefer canonical repo docs over ad hoc commentary.
- Keep this phase architecture-safe and documentation-first.
- Do not implement later-phase runtime or UI capability merely because the folder names already exist.

## Required authority posture for the code agent

Use this order when signals disagree:

1. verified live code and configuration
2. `docs/architecture/blueprint/current-state-map.md`
3. relevant local package/app README and tests
4. admin Phase 1 docs created in this sequence
5. broader target-state architecture docs
6. historical phase/task plans

## Execution cautions

- This package is for **Phase 1 only**.
- Do not let execution drift into Phase 2+ contracts, backend APIs, or new UI capability unless a **minimal** compatibility stub is absolutely required and clearly documented.
- Do not rewrite healthy repo foundations just to make the docs read more cleanly.
- Do not move privileged logic into SPFx.
- Do not redefine `@hbc/features-admin` as the control plane.
- Do not update `current-state-map.md` with target-state claims.

## Expected repository outputs from executing this package

Expected outputs are mainly canonical architecture and doctrine files under:

- `docs/architecture/plans/MASTER/spfx/admin/`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/`

Plus tightly scoped README or guidance updates in:
- `apps/admin/`
- `packages/features/admin/`
- `backend/functions/`

## Validation posture

Use the smallest meaningful validation set.
For this phase, most changes should be documentation-only or local README updates.

Typical expectation:
- link/reference consistency checks
- minimal repo search/reconciliation
- `pnpm format:check` only if needed for touched markdown breadth

Do **not** run broad workspace tests by default for docs-only work unless the prompt explicitly requires it or repo truth changed in code.

## Completion standard

The package is complete when the repo has:
- one coherent Phase 1 baseline,
- one coherent boundary matrix,
- one coherent domain taxonomy,
- one coherent release-scope map,
- one coherent locked-decision / phase-boundary guard document,
- and no material contradiction across admin docs and local guidance.
