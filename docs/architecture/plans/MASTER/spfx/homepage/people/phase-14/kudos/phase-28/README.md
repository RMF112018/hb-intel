# HB Kudos Repo-Truth Audit Remediation Package

Repo: `https://github.com/RMF112018/hb-intel.git`  
Branch: `main`  
Date: April 12, 2026

## Objective
Close the HB Kudos audit findings from the repo-truth review of the live `main` branch. This package is intentionally serialized by finding. The local code agent must close one finding completely before moving to the next.

## Governing authority
Primary doctrine:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Supporting authority:

- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- `apps/hb-webparts/.eslintrc.cjs`

## Scope
Relevant code footprint includes, at minimum:

- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- `apps/hb-webparts/src/homepage/shared/`
- `packages/ui-kit/src/HbcKudosComposer/`
- `apps/dev-harness/src/harness/kudosHarness.ts`
- `e2e/webparts/kudos/`

## Execution order
Run prompts in numeric order. Do not skip ahead. Do not blend unrelated findings together.

1. `01-Prompt-Doctrine-Token-Closure.md`
2. `02-Prompt-Companion-Workspace-Structural-Redesign.md`
3. `03-Prompt-Companion-Action-Ergonomics-Quick-Triage.md`
4. `04-Prompt-Dialog-Semantics-and-Task-Shell-Accessibility.md`
5. `05-Prompt-Assignee-Resolution-UX-Upgrade.md`
6. `06-Prompt-Manifest-FullBleed-and-Packaging-Intent.md`
7. `07-Prompt-Static-Guardrails-and-Doctrine-Drift-Prevention.md`
8. `08-Prompt-Final-Validation-and-Closure.md`

## Guardrails
- One finding only per prompt.
- Exhaustive scrub of the full footprint for that finding.
- No superficial patching.
- No “good enough for now.”
- Do not re-read files that are still within your active context or memory.
- Preserve strong existing architecture where it is already correct.
- Public surface: selective remediation only.
- Companion surface: structural redesign is allowed and expected where the existing composition is materially limiting quality.

## Required closure standard for every prompt
Before declaring a finding closed, the agent must:
- list all files touched
- explain why each file was in scope
- state what was removed
- state what was replaced
- state what remains intentionally unchanged
- prove the original finding is no longer present anywhere in the audited footprint
