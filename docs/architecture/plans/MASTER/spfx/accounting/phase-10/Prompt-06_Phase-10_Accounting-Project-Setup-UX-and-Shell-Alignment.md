# Prompt-06 — Phase 10 Accounting Project Setup UX and Shell Alignment

## Objective

Reduce unjustified UX drift between Accounting and Project Setup so the two SPFx surfaces feel materially more like one governed SharePoint-hosted HB Intel application family.

## Context

The audit found that the shell lineage is shared, but runtime trust-state behavior, theme posture, and environment-state communication still diverge enough to feel app-specific rather than seamless.

## Working Rules

- Treat the live repo as the source of truth.
- Do not re-read files that are already in your active context or memory unless you need to verify a contradiction, confirm exact wording, or inspect a file you have not yet opened.
- Do not rely on stale phase documents when repo truth disagrees.
- Do not make assumptions about production readiness that are not evidenced in code, build artifacts, tests, or docs.
- Keep changes narrowly scoped to the objective of this prompt unless a directly dependent correction is required.
- When you change behavior, also update the governing docs and validation evidence that define or prove that behavior.
- Prefer additive, explicit, and test-backed changes over hidden fallbacks.
- If you discover that a requested change is already fully implemented in repo truth, do not re-implement it. Instead, document the repo truth, close the gap in the affected docs, and continue to the next unresolved item.

## Required Repo Focus

- `apps/accounting/src/App.tsx`
- `apps/accounting/src/router/root-route.tsx`
- `apps/accounting/src/pages/`
- shared shell/ui-kit references
- corresponding Project Setup files in `apps/estimating/src/`
- UI doctrine and UI-kit governance docs in `docs/reference/ui-kit/` and ADR/UI doctrine paths


## Tasks

1. Audit current Accounting shell/theming/trust-state behavior against the governed Project Setup SPFx pattern.
2. Implement the highest-value alignment changes, including where appropriate:
   - explicit light-theme forcing in SPFx-hosted Accounting surfaces
   - intentional environment banners or readiness messaging
   - more consistent shell title / framing / terminology treatment
   - consistent handling of warning, empty, loading, and error states
3. Preserve intentional surface-specific differences, but remove unjustified drift.
4. Update or add tests where practical for shell/theme/environment-state behavior.
5. Record which divergences remain intentional and why.


## Deliverables

- Accounting shell/UX alignment changes
- any needed theme or environment-state tests
- a short UX reconciliation note documenting what was aligned versus what remains intentionally specialized


## Acceptance Criteria

- Accounting and Project Setup feel more like one governed app family
- SPFx-hosted Accounting no longer relies on ambiguous SharePoint/OS theme behavior if that risk exists
- environment-state communication is more consistent and less surprising across the two surfaces


## Output Format

Provide:
1. the UX alignment changes made
2. the files changed
3. any intentional divergences left in place and why
4. any tests or screenshots/evidence generated

