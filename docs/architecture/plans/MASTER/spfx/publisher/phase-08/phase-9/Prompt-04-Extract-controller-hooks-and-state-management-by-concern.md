# Prompt 04 Extract controller hooks and state management by concern

You are working in the live local HB Intel repo.

Objective:
Execute the required work for **Workstream I — Component Refactor and Maintainability**.
For this step, your specific objective is to:

> separate workflow state, preview state, readiness state, and entity-edit state into clearer controller seams or hooks by concern

Workstream objective:
Reduce complexity and improve maintainability by splitting the monolithic Publisher surface into stable workflow-focused modules.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Binding authority:
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
3. The live repo implementation under `apps/hb-webparts/src/webparts/articlePublisher/`
4. The live repo implementation under `apps/hb-webparts/src/homepage/data/publisherAdapter/`


Primary repo-truth files and seams to review for this step:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/mount.tsx`

Expected workstream documentation location in the repo:
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-i-component-refactor-and-maintainability/`
- Save this step's closure evidence under: `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-i-component-refactor-and-maintainability/step-04/`

Mandatory compliance:
- Treat the live local repository as the implementation source of truth.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not perform unrelated refactors.
- Do not preserve weak existing UX patterns merely because they already exist.
- Preserve the existing working publish / republish / archive / withdraw lifecycle unless the prompt explicitly instructs otherwise.
- Follow the governing doctrine documents even when the current implementation does not.
- Where the repo already contains a governed reusable primitive or interaction model that fits the requirement, prefer reusing it over inventing a one-off replacement.


Execution requirements:
- Start from repo truth, not prior summaries.
- Audit the exact current implementation footprint relevant to this step before changing code.
- Identify every file that must change to close the step properly.
- Make the minimum necessary architecture changes, but do not artificially constrain yourself to superficial edits if the correct answer requires structural UI work.
- Where the current Publisher still behaves like an admin console rather than a premium editorial product, correct that behavior in the scope of this step.
- Where the current UI still exposes raw internal values or manual data work to authors, remove that friction if it falls inside the scope of this step.
- Where the current implementation already has a strong underlying service or workflow seam, preserve it and improve the product layer on top of it.

Required implementation posture:
- The resulting experience must move materially toward the desired end-state Publisher:
  - low-friction
  - premium and engaging
  - editorial rather than CRUD-like
  - author-confident
  - SharePoint/SPFx safe
- Do not leave placeholder UX, fake affordances, or temporary wording in the final output.
- Do not silently defer obvious follow-on fixes inside the touched surface when they are necessary for closure of this step.

Validation requirements:
- Add or update tests where appropriate for the affected behavior.
- Perform a final scrub of the touched files for stale comments, stale naming, contradictory labels, and drift.
- Validate that any modified UI states have credible empty/loading/error behavior.
- Validate that any modified interactions remain keyboard-safe and accessible.

Required final deliverables for each prompt:
- Code changes required for the step
- Any supporting shared primitives, adapters, tests, or docs needed to fully close the step
- A concise closure report saved in the repo workstream folder proving exactly what changed, what was validated, and what remains
- No “partial completion” framing unless a hard blocker is real and explicitly proven


Definition of completion for the prompt:
- The requested step is fully implemented in repo truth
- The implementation is doctrine-compliant
- The implementation is host-safe for SharePoint/SPFx
- The implementation is author-safe with good empty/loading/error states
- Obvious drift or contradictory legacy behavior in the touched area is closed, not left behind


Required final response from the code agent:
1. Summary of what was changed
2. Exact files changed
3. Validation performed
4. Closure report path
5. Any real blockers remaining
