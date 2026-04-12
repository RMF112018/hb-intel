# Prompt 10 — Model Reference Standard and Closure Governance
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

HB Kudos is intended to become the model standard for future homepage webparts. Finalize the documentation, closure criteria, and benchmark governance needed to make that claim credible and reusable.

## Primary files / areas to inspect

- `01-Audit-Report-HB-Kudos-Major-Findings.md`
- `docs/architecture/reviews/`
- `docs/reference/ui-kit/`
- `apps/hb-webparts/src/webparts/hbKudos/*`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/*`
- `e2e/webparts/kudos/hosted/*`

## Required work

1. Create or update the minimum documentation necessary to declare what makes HB Kudos the reference-standard homepage webpart after this package closes.
2. Define explicit closure criteria for UI-kit compliance, architecture quality, hosted validation, accessibility, and runtime-boundary discipline.
3. Add any concise benchmark or conformance notes needed so future homepage-webpart work can treat Kudos as a real standard instead of an informal example.
4. Ensure the final documentation is based on the repo’s actual implemented state, not aspirational language.
5. Provide a final closure summary that states whether HB Kudos is now fit to serve as the model implementation and identify any residual follow-up if one still exists.

## Non-goals / guardrails

- Do not generate bloated documentation that no one will use.
- Do not declare the feature a model benchmark unless the implemented state actually justifies it.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes if docs/config changes touch linted surfaces
- `pnpm typecheck` passes if code changes are included
- all targeted Kudos validation referenced in the closure summary has been run and reported
- final closure summary is concise, repo-truth-based, and specific

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
