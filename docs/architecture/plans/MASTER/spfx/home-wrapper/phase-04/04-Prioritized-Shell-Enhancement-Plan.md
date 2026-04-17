# 04 — Prioritized Shell Enhancement Plan

## Workstream 1 — Lock shell-owned boundaries and non-goals
**Why first:** prevents drift and stops the local code agent from spending Wave 01 energy on hosted modules.

**Primary closure signals**
- shell-owned vs child-owned boundary is explicit
- comments / docs / symbols do not invite module redesign
- future control-panel work is clearly bounded

---

## Workstream 2 — Encode the entry-stack policy contract and budgets
**Why second:** this is the most important missing architectural seam.

**Must define**
- hero height budgets by entry class
- visible primary action budgets by entry class
- overflow posture by entry class
- first-lane-first-view requirement
- short-height behavior

**Primary closure signals**
- typed policy artifact exists
- policy is shell-facing and reusable by hero/actions/shell seams
- protected vs configurable policy boundaries are explicit

---

## Workstream 3 — Align breakpoint state model and diagnostics to the governing spec
**Why third:** after the entry-stack policy exists, the shell’s runtime state and diagnostics can be aligned to it and made inspectable.

**Primary closure signals**
- state model aligns cleanly to the governing matrix
- short-height logic is inspectable
- diagnostics show why a state was selected and why a band paired or stacked

---

## Workstream 4 — Harden presets, overrides, protected decisions, and persistence
**Why fourth:** the repo already contains partial implementation here; Wave 01 should close the remaining governance gaps.

**Primary closure signals**
- presets are clearly approved and described
- override bounds are explicit
- invalid persisted state normalizes predictably
- protected rules remain non-overrideable

---

## Workstream 5 — Strengthen production orchestration and shared policy seams
**Why fifth:** production still mounts top-band surfaces independently, so future unified control needs shared shell-facing policy references now.

**Primary closure signals**
- `mount.tsx`, `ReferenceHomepageComposition.tsx`, and shell seams reference the same shell-facing policy model
- no hero/actions redesign was required
- future unified governance can be built without ad hoc coupling

---

## Workstream 6 — Add shell harness, breakpoint matrix, and inspectable proof
**Why sixth:** shell closure requires more than code changes and unit tests.

**Primary closure signals**
- a bounded preview/harness path exists
- the breakpoint matrix is executable
- first-screen states can be inspected and documented

---

## Workstream 7 — Extend automated tests and closure evidence
**Why seventh:** existing tests should be preserved and extended only after the shell seams stabilize.

**Primary closure signals**
- shell unit tests cover the new policy and diagnostics
- proof artifacts demonstrate device-class closure
- remaining gaps, if any, are explicit and shell-only

## Stop conditions

Do not call Wave 01 complete if any of the following remain true:
- hero/action/first-lane budgets are still implicit
- the shell can pair or stack without inspectable reasoning
- persisted shell input can override protected rules
- production top-band seams still lack shared shell-facing policy references
- proof consists only of “it compiled” or “the screenshots looked okay”
