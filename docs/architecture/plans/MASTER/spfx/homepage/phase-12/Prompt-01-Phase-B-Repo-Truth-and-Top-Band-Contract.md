# Prompt 01 — Phase B Repo Truth and Top-Band Contract

## Objective

Audit the live repo state for the homepage top band and produce the exact implementation contract for Phase B before any visual redesign work begins.

## Required Context

- Primary repo: `https://github.com/RMF112018/hb-intel`
- Treat **repo truth** as authoritative.
- Primary implementation targets are expected to be within:
  - `apps/hb-webparts`
  - `packages/ui-kit`
- Reconcile the exact target files and structure from the live repo before making changes.
- Do **not** re-read files that are already in your active context or memory unless needed to verify changed state.

## Scope

This prompt is planning and contract-definition only.

In scope:
- identify the exact homepage top-band files/components in `apps/hb-webparts`
- identify the exact shared-kit files/components/exports in `packages/ui-kit` that currently support or should support the top band
- define the target architecture for Phase B
- define the implementation sequence and change boundaries
- identify reuse opportunities vs homepage-local needs
- identify any blockers, risks, or hidden dependencies

Out of scope:
- broad homepage redesign
- code changes unrelated to the top band
- speculative architecture not grounded in repo truth

## Hard Requirements

- Produce a repo-truth-anchored Phase B implementation plan.
- Name the exact files, modules, exports, and composition seams involved.
- Define which concerns belong in `@hbc/ui-kit` versus the homepage/webpart layer.
- Identify whether new shared primitives, new variants, or both are required.
- Define acceptance gates for Prompts 02–06.
- Do not make code changes unless a tiny enabling refactor is absolutely necessary to clarify the contract; if so, keep it minimal and explain why.

## Design Intent

The top band must feel:

- premium
- confident
- elegant
- composed
- editorial in hierarchy
- operationally useful
- unmistakably branded
- materially above standard SharePoint page composition

Avoid flashy or gratuitous effects.

## Required Research / Audit Before Editing

Before editing code, perform a focused repo-truth review of the exact files you will touch and any directly related usage sites.

You must also verify:

- existing homepage composition and slot structure
- existing `@hbc/ui-kit` homepage exports and usage contracts
- current CTA, card, typography, metadata, and motion patterns
- theme/token constraints that affect top-band styling
- accessibility constraints relevant to this prompt

## Execution Instructions

1. Inspect the current homepage composition and identify the exact top-band ownership model.
2. Inspect the current Personalized Welcome Header implementation.
3. Inspect the current HB Hero Banner implementation.
4. Inspect the current `@hbc/ui-kit` homepage exports, card/surface primitives, typography utilities, CTA styles, metadata rows, and token constraints relevant to the top band.
5. Produce a clear Phase B contract that answers:
   - what stays local
   - what moves to shared kit
   - what new shared primitives/variants are required
   - what responsive and accessibility constraints must govern implementation
6. Produce a recommended implementation sequence for the remaining prompts.
7. Call out any likely regression points or coupling risks.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- Exact target files and ownership seams are identified.
- Shared-kit vs local-layer responsibilities are clearly defined.
- Required new primitives/variants are named and justified.
- Risks and blockers are identified explicitly.
- The plan is actionable enough to drive Prompts 02–06 without ambiguity.

## Risk Exposure

- Missing a hidden shared dependency could cause rework later.
- Over-centralizing homepage design in the shared kit could create unnecessary coupling.
- Under-centralizing could create duplicated styling and drift.
- Misreading composition ownership could cause integration churn.

## Standards / Best Practices

- Keep planning grounded in repo truth.
- Prefer narrow, well-named shared primitives over broad abstractions.
- Treat accessibility and responsive behavior as first-class design constraints.
- Document the contract so later prompts can stay focused and consistent.

## Guardrails

- Do not widen scope beyond this prompt.
- Do not introduce brittle one-off styling when a clean shared variant is warranted.
- Do not break existing runtime realism for SPFx/SharePoint hosting.
- Do not degrade accessibility to gain visual polish.
- Prefer maintainable composition over short-term visual hacks.

## Final Output Format

Return your response in this structure:

```text
Implementation Summary
Files Changed
Key Decisions
Assumptions
Open Issues
Acceptance Evidence
```
