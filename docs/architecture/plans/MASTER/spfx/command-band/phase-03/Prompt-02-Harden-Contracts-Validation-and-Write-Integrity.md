# Prompt 02 — Harden Contracts, Validation, and Write Integrity

## Objective

Bring the Priority Actions contract, validation, and write behavior into honest alignment so the admin can no longer author states that the runtime only partially understands.

This prompt exists because the repo has strong contract scaffolding, but its actual enforcement depth still lags the declared model.

---

## First instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Repo seams to inspect

Primary seams:
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsValidation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsConfigListSource.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsItemsListSource.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsListWriter.ts`

Inspect as needed:
- descriptor modules for config/items list fields
- tests for normalization, validation, and writers
- any icon registry or shared type source needed to validate icon keys safely

---

## Governing references

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-config.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/priority-actions-band-items.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Checklist.md`
- `docs/architecture/plans/MASTER/spfx/command-band/phase-02/Closure-Scorecard.md`

---

## Current repo-truth problem

The repo declares a richer model than it enforces.

Examples:
- validation issue kinds exist that are not actually enforced
- config/runtime coherence is only partially protected
- the config model includes layout and device controls whose integrity is not fully validated
- icon key and grouping semantics are under-validated
- duplicate active config posture is declared as invalid in docs but not enforced in the current validation layer
- the write layer largely trusts upstream values once title/href are present

That gap makes the system easier to misuse and harder to prove closed.

---

## Required end state

The contract, validation, and write seams must together enforce a safe authored state that matches what the runtime can actually honor.

At minimum, the strengthened system must cover:
- config identity and activation sanity
- item identity and key uniqueness
- schedule coherence
- audience coherence
- icon-key validity or governed fallback behavior
- breakpoint / max-visible sanity
- group metadata coherence where grouping is supported
- write-payload normalization that does not quietly preserve malformed values

---

## Required tasks

### 1. Audit declared issue kinds against actual enforcement
Do a line-by-line comparison between:
- declared validation issue types
- actual validation logic
- documented list semantics
- runtime behavior

Close any declared-but-unenforced issue kinds that materially belong in this wave.

### 2. Enforce config validity more completely
Add validation for any materially relevant config errors, including where appropriate:
- duplicate active config rows for a band
- invalid or contradictory breakpoint caps
- unsupported layout combinations if the runtime cannot truthfully express them
- missing/invalid overflow labeling when overflow is enabled
- any field combinations that violate the documented list contract

### 3. Enforce item validity more completely
Add validation for any materially relevant item errors, including where appropriate:
- duplicate action keys
- invalid icon keys, or safe explicit fallback semantics if free-text icon keys remain allowed
- malformed audience mode / audience key combinations
- contradictory visibility states where the runtime would produce nonsense
- group metadata coherence if grouped rendering is supported

### 4. Tighten normalization and write mapping
Review normalization and writer mapping so the same authored meaning survives across:
- raw SharePoint row
- normalized runtime model
- admin draft model
- write payload

Do not let the system silently drift between these layers.

### 5. Add or update tests
Add focused tests that prove the hardened model.
The tests must cover the declared issue kinds you close, not just generic happy paths.

---

## Hard constraints

- do not redesign the public surface here
- do not redesign the admin IA here
- do not remove legitimate contract breadth merely because it is inconvenient
- if the runtime cannot honor a contract value honestly, either implement truthful support in later prompts or explicitly gate/validate it now so false affordances do not remain

---

## Proof of closure

Return evidence showing:

1. the issue kinds audited
2. which new validations were added and why
3. how config/runtime coherence is now stronger
4. how write payload integrity is now safer
5. tests proving the hardened model
6. exact files changed
7. confirmation that no unrelated webparts were modified
