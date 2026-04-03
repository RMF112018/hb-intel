# Prompt-12 — Program Ripple Map and Phase Dependency Reconciliation

## Objective

Audit the current program and repo surfaces for the **upstream and downstream ripple** caused by the Phase 9 redirect to **Hybrid Identity Administration**, and produce the canonical ripple map.

This prompt must prevent the follow-on work from guessing where the Phase 9 redirect actually changes the surrounding development program.

## Important execution rules

- Read the smallest authoritative set required.
- Do **not** re-read files that are still in active context or memory unless they changed or the prompt requires a fresh check.
- Keep this prompt evidence-first.
- Do not start broad implementation in this prompt.
- Distinguish clearly between:
  - confirmed current doc/repo truth,
  - confirmed contradictions,
  - required corrections,
  - and optional follow-on refinement.

## Mandatory authority set

Start with:
1. `CLAUDE.md`
2. `docs/architecture/blueprint/current-state-map.md`
3. current Admin target architecture doc
4. current Admin end-state plan
5. current Phase 9 hybrid-identity summary plan / README / prompt package docs
6. `docs/architecture/plans/MASTER/spfx/admin/README.md`
7. any phase docs already created for:
   - Phase 1
   - Phase 2
   - Phase 5
   - Phase 6 / 6A
   - Phase 7
   - Phase 10
   - Phase 11
   - Phase 12
   - Phase 13
8. any current repo surfaces whose naming or behavior still materially reflects Entra-only assumptions

## Create

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-program-ripple-map.md`

## Required sections in the document

1. Purpose
2. Authority set actually used
3. Confirmed current program assumptions Phase 9 depended on
4. Confirmed contradictions introduced by the old Entra-only framing
5. Upstream phases affected
6. Downstream phases affected
7. Canonical correction list by phase
8. Repo/code surfaces that need naming or contract alignment
9. Explicit non-ripple items
10. Minimal unresolved items to carry forward

## Minimum findings that must be checked and captured if still true

- Upstream phases still prepare for broad Entra administration rather than hybrid identity.
- Adapter/service assumptions still point too narrowly at Graph / Entra.
- Setup / install / preflight work does not yet fully account for no-code IT connection setup and hybrid identity readiness.
- Provisioning hardening still references Entra setup rather than hybrid identity readiness where relevant.
- Downstream governance/safety/observability language still assumes Entra-only identity control.
- Canonical planning docs still require reconciliation where they use outdated identity phrasing.
- The repo may already have route/page names, model names, or local docs that still imply an Entra-only lane.

## Required output quality

The ripple map must clearly separate:
- real affected phases,
- real affected repo surfaces,
- required corrections,
- optional cleanups,
- and later-phase items that should not be pulled forward casually.

## Validation

Before finishing:
- verify all referenced paths exist,
- remove speculation disguised as fact,
- ensure the document is specific enough to drive Prompts 13–17.

## Completion condition

Stop after the program ripple map document is complete.
Do not implement broad changes in this prompt.
