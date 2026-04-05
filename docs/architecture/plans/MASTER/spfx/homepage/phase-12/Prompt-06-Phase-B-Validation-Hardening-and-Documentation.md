# Prompt 06 — Phase B Validation, Hardening, and Documentation

## Objective

Validate, harden, and document the completed Phase B top-band redesign so it is stable, understandable, and ready for follow-on premiumization work.

## Required Context

- Primary repo: `https://github.com/RMF112018/hb-intel`
- Treat **repo truth** as authoritative.
- Primary implementation targets are expected to be within:
  - `apps/hb-webparts`
  - `packages/ui-kit`
- Reconcile the exact target files and structure from the live repo before making changes.
- Do **not** re-read files that are already in your active context or memory unless needed to verify changed state.

## Scope

In scope:
- functional and visual validation of the completed top band
- accessibility checks
- reduced-motion verification
- responsive verification
- cleanup and hardening
- documentation of the top-band contract and usage rules

Out of scope:
- new feature design beyond what is required to stabilize the completed Phase B work

## Hard Requirements

- Verify the completed implementation against the Phase B acceptance gates.
- Remove dead styling, temporary logic, or leftover scaffolding introduced during implementation.
- Document the top-band contract clearly enough for future phases.
- Capture any residual issues honestly rather than hiding them.

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

1. Audit the completed Phase B implementation end to end.
2. Verify:
   - semantic structure
   - keyboard navigation
   - focus-visible behavior
   - contrast and readability
   - reduced-motion handling
   - responsive behavior
   - CTA and metadata consistency
3. Clean up any temporary or redundant implementation details.
4. Update or add documentation covering:
   - new shared primitives/variants
   - intended usage
   - local vs shared ownership
   - constraints for future homepage phases
5. Summarize final acceptance status and remaining issues, if any.

## Deliverables

You must deliver all of the following:

1. The code changes required by this prompt.
2. A concise implementation summary.
3. A file-level change list.
4. Explicit assumptions.
5. Open issues or follow-ups, if any.
6. Acceptance evidence tied directly to this prompt.

## Acceptance Criteria

- The top band passes a reasonable implementation-quality review.
- Accessibility and responsive behavior have been checked explicitly.
- Documentation exists for the new top-band contract and shared primitives.
- Temporary implementation residue has been removed.
- Remaining limitations, if any, are called out clearly.

## Risk Exposure

- Visual success can hide accessibility or responsive regressions unless explicitly checked.
- Shared primitives can remain under-documented and cause drift later.
- Small leftover hacks can become long-term debt if not removed now.

## Standards / Best Practices

- Validate what shipped, not what was intended.
- Prefer honest documentation over implied conventions.
- Leave the repo cleaner than you found it.
- Capture unresolved issues explicitly for future phases.

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
