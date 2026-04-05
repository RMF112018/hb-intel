# Phase 00 Prompt Package — UI Kit / Doctrine / SPFx Contract Reconciliation

## Objective
This package instructs the local code agent to execute **Phase 00** of the HB Central SharePoint shell blueprint effort inside the live `hb-intel` repo.

Phase 00 exists to eliminate repo-truth ambiguity **before** broader homepage or shell-extension implementation proceeds.

The package is intentionally limited to three outcomes:

1. **Repo-truth reconciliation**
2. **`@hbc/ui-kit` export/import contract lock**
3. **SPFx-hosted homepage doctrine overlay establishment**

This package should be executed **before** any broader SharePoint shell blueprint implementation package.

---

## Why Phase 00 Must Happen First
The current repo direction is strong, but the audit identified several contradictions that will create drift or regressions if the next phases start before this cleanup is complete.

Examples of issues this phase must resolve include:

- references to a homepage-specific `@hbc/ui-kit/homepage` entry point that are not fully aligned with the published package contract
- inconsistent guidance on whether homepage surfaces may import broad `@hbc/ui-kit`
- inconsistent language around SPFx constraints for shell-related surfaces
- UI-kit reference documentation that does not yet read as a clean, production-ready doctrine set for premium SPFx-hosted homepage work
- documentation taxonomy and repo-truth gaps that can mislead future agent work

---

## Package Contents

1. `Phase-00-Implementation-Summary.md`  
   Phase overview, sequence, required outputs, and closure definition.

2. `Phase-00-01-Repo-Truth-Reconciliation.md`  
   Prompt to reconcile actual repo/package truth, documentation truth, and SharePoint shell blueprint truth.

3. `Phase-00-02-UI-Kit-Export-and-Import-Contract-Lock.md`  
   Prompt to lock the UI-kit entry-point/export/import contract and enforce it in repo docs and usage.

4. `Phase-00-03-SPFx-Homepage-Doctrine-Overlay-Plan.md`  
   Prompt to establish the SPFx-hosted homepage doctrine overlay and clarify what remains binding vs directional.

5. `Phase-00-Risk-Exposure.md`  
   Risks, failure modes, and the specific regressions this phase must prevent.

6. `Phase-00-Standards-and-Best-Practices.md`  
   Standards and best-practice rules that govern this phase.

---

## Execution Order

Run the prompts in this exact order:

1. `Phase-00-01-Repo-Truth-Reconciliation.md`
2. `Phase-00-02-UI-Kit-Export-and-Import-Contract-Lock.md`
3. `Phase-00-03-SPFx-Homepage-Doctrine-Overlay-Plan.md`

Supporting references:
- `Phase-00-Risk-Exposure.md`
- `Phase-00-Standards-and-Best-Practices.md`

---

## Mandatory Phase Rules

- Work in the live repo as repo truth.
- Do **not** treat stale docs or prior assumptions as authoritative if they conflict with current code.
- Do **not** re-read files that are already in the agent’s active context or memory unless needed to verify a specific change or resolve a contradiction.
- Do **not** broaden scope into homepage polish or shell-extension implementation beyond what is necessary to lock contracts and doctrine.
- Do **not** weaken the quality bar in order to “resolve” contradictions quickly.
- Do **not** leave ambiguous guidance in place if a clearer and more authoritative statement can be written now.

---

## Required End State

Phase 00 is complete only when all of the following are true:

- the repo has one clear and accurate statement of the UI-kit entry-point model
- the repo has one clear and accurate statement of homepage vs shell-extension responsibilities
- homepage import rules are explicit, enforceable, and documented
- SPFx-specific constraints for premium homepage surfaces are documented clearly
- stale or contradictory doctrine language is removed, superseded, or rewritten
- future implementation phases can proceed without ambiguity about package boundaries or design-system usage

---

## Expected Deliverable Types Produced by the Agent

The prompts in this package should result in repo-ready outputs such as:

- updated or newly added markdown governance documents
- corrected reference docs
- clarified package export definitions
- clarified import restrictions
- guardrail documentation for future phases
- any narrow supporting code/config updates necessary to make the contract real

---

## Implementation Discipline

The agent should prefer:
- exact repo-truth reconciliation
- targeted, high-confidence changes
- explicit supersession notes where older docs are replaced
- durable documentation structure over patchwork wording edits
- minimal but sufficient code/config changes to align package truth with documentation truth

The agent should avoid:
- speculative refactors
- cosmetic redesign work
- large unrelated cleanup passes
- “temporary” wording that leaves room for conflicting interpretations later

---

## Closure Artifact Recommendation

At the end of Phase 00, the agent should leave behind a concise closure summary that confirms:

- what contradictions were found
- what was changed
- what was intentionally left unchanged
- what assumptions are now locked for Phase 01
- any residual follow-up items that belong to later phases rather than this one
