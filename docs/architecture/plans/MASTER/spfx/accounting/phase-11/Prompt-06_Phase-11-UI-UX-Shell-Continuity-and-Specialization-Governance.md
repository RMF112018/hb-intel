# Prompt-06 — Phase 11 UI/UX Shell Continuity and Specialization Governance

## Objective

Reconcile Accounting’s SharePoint-hosted shell behavior against the current Project Setup comparison surface so the user experience feels like one intentional HB Intel application family rather than a loosely related set of app-specific experiences.

This prompt is not asking for a full redesign. It is asking for targeted continuity work that distinguishes:
- justified specialization
- from avoidable drift

The prompt should result in code and/or documentation updates that clarify and improve cross-app continuity where release-significant seams currently exist.

## Critical Working Rules

- Use the outputs of Prompts 01–05 as the behavioral baseline.
- Do not re-read files already in current context or memory unless needed to verify contradiction, inspect exact shell behavior, or capture evidence.
- Do not chase subjective polish. Focus on shell continuity, state treatment, and operational clarity.
- Preserve legitimate domain specialization.

## Required Scope

Inspect at minimum:
- `apps/accounting/src/router/root-route.tsx`
- current Accounting route/page surfaces that materially affect hosted shell behavior
- `apps/estimating/src/router/root-route.tsx`
- any relevant shared shell/UI-kit docs and references
- current UI/UX implementation summaries if present for SPFx surfaces

## Required Work

1. Compare Accounting and Project Setup shell behaviors, including:
   - project-scoped framing
   - workspace labeling
   - navigation/tool-picker posture
   - runtime-mode/status banners
   - warning/info/error treatment
   - back-to-project-hub continuity
2. Identify which differences are:
   - intentional and acceptable
   - acceptable with caveat
   - inconsistent and should be corrected
3. Implement only the corrections that materially improve continuity without distorting Accounting’s domain role.
4. Record any intentional differences so they do not continue to look like accidental drift.

## Required Outputs

### 1. Create a continuity memo at:
`docs/architecture/reviews/accounting-vs-project-setup-shell-continuity-review.md`

The memo must include:
- Executive Summary
- Shared Shell Behaviors
- Intentional Specialization
- Corrected Drift
- Remaining Acceptable Differences
- Exact Files Inspected

### 2. Create or update a phase-local guidance file at:
`docs/architecture/plans/MASTER/spfx/accounting/phase-11/06-Shell-Continuity-and-Specialization-Guidance.md`

### 3. Make any narrowly scoped code adjustments needed to align release-significant shell/state behavior.

## Hard Requirements

- Do not rely on generic “looks consistent” wording.
- State specifically which differences were corrected versus intentionally retained.
- Keep continuity work bounded and auditable.

## Completion Standard

This prompt is complete only when Accounting’s hosted shell behavior is documented and tuned enough that future reviewers can distinguish intentional specialization from unjustified drift without guesswork.
