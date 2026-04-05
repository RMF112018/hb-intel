# Prompt 04 — Capture Completion and Refresh the Rollout Handoff

## Objective

After `PriorityActionsRailWebPart` is packaged and validated, update the rollout documentation so the new state of the hb-webparts migration is explicit and the next target is clear.

---

## Context

The rollout handoff currently records the validated hero proof case and a recommended tiered migration order. Once PriorityActionsRail is complete, the handoff must reflect that it is no longer just a recommendation — it is part of the proven rollout path.

---

## Scope

Primary documentation outputs:

- completion note for the PriorityActionsRail package
- refreshed rollout handoff
- refreshed package/version reference if needed

Likely file locations:

- `docs/architecture/plans/MASTER/spfx/webparts/phase-2/`
- existing rollout handoff markdown file for hb-webparts

---

## Hard constraints

Do **not** rewrite the broader architecture.
Do **not** change migration tiers unless evidence now requires it.
Do **not** mark a webpart validated without actual package inspection and tenant evidence.
Do not re-read files that are already in your active context unless needed for verification.

---

## Required updates

### 1. Completion note
Create a concise completion note that records:

- target webpart
- manifest ID
- files changed
- package version
- package inspection result
- tenant validation result
- whether any target-specific console/runtime issues remain

### 2. Rollout handoff refresh
Update the rollout handoff so it clearly states:

- `HbHeroBannerWebPart` is validated
- `PriorityActionsRailWebPart` is validated, if tenant evidence proves that
- the next recommended target is `LeadershipMessageWebPart`
- the rollout remains on Path A sequential single-webpart proof cases

### 3. Deferred items
Reconfirm that the following stay deferred:

- full `mount.tsx` restoration
- shim infrastructure removal
- multi-webpart batch packaging
- homepage composition architecture

---

## Deliverable

Provide a concise completion note with:

1. docs changed
2. validated webparts list after this package
3. next recommended target
4. deferred items unchanged
5. confirmation that the rollout model remains sequential single-target proof cases
