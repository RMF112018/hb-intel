# W0-G5-T02 — Requester Parity Contract and Lighter Presentation Rules

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` §G5.1; SPFx Group 4 task plans

**Status:** Proposed
**Stream:** Wave 0 / G5
**Locked decisions served:** LD-01, LD-02, LD-06

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/step-wizard` | `packages/step-wizard/` | Parity contract depends on Step Wizard behavior being stable | The step sequence, state machine states (`not-started`, `in-progress`, `complete`, `blocked`, `skipped`), and step ordering modes (`sequential`, `parallel`, `sequential-with-jumps`) defined in `PH7-SF-05` must be implemented and stable before the parity contract is locked. If the Step Wizard is still changing its state model, the parity contract will drift. |

### Gate Outcome

If `@hbc/step-wizard`'s step states and ordering modes are not yet stable, defer the parity contract table in this task until Step Wizard stabilizes. The parity contract may be drafted speculatively but must not be treated as locked until the Step Wizard implementation is verified.

---

## Objective

Produce a locked, explicit requester parity contract that defines:
1. Which workflow elements must be semantically identical between the SPFx requester experience and the hosted PWA
2. Which presentation details may differ between SPFx and PWA
3. Which requester actions must have identical outcomes regardless of surface
4. The draft payload type shape that both surfaces share

This task does not implement UI. It defines the contract that implementation in T01, T03, T04, T05, and T06 must honor.

---

## Scope

- Document the parity contract as a committed artifact in `docs/architecture/plans/MVP/G5/` or a referenced location agreed with the architecture owner
- Define the full list of requester-facing workflow lifecycle states that the PWA must represent
- Define the complete set of requester-required actions and their expected outcomes
- Define which presentation elements may be lighter in the PWA
- Define which presentation elements must remain identical
- Define the step structure for the project setup request flow (step IDs, labels, order, required/optional status)
- Specify the draft payload type that `@hbc/session-state` must persist (in coordination with T03)
- Identify any SPFx Group 4 behavior that the PWA must replicate exactly vs. may simplify

---

## Exclusions / Non-Goals

- Do not implement any UI in this task. T02 is a planning and contract-definition task.
- Do not define the SPFx experience — that belongs to Group 4. T02 only documents what the PWA must match.
- Do not define testing verification criteria. That belongs to T08.
- Do not specify save/resume mechanics. That belongs to T03.

---

## Governing Constraints

- The parity contract may not relax any workflow lifecycle meaning. Lighter presentation is permitted; different lifecycle semantics are not (LD-02).
- The step structure in the parity contract must be derived from the SPFx Group 4 implementation, not invented independently for the PWA.
- The draft payload type must be compatible with `@hbc/session-state`'s `IDraftEntry` interface (see `PH7-SF-12`).
- The parity contract is a living document during Wave 0 but must be locked before T03, T04, and T05 close.

---

## Parity Contract (To Be Finalized During T02 Execution)

The following tables define the contract. Items marked `[DERIVE FROM G4]` require inspection of the SPFx Group 4 implementation before they can be finalized.

### Workflow Lifecycle States — Identical Across Surfaces

The hosted PWA must represent all of the following states with the same lifecycle meaning as the SPFx surface. Visual treatment may differ; the meaning may not.

| State | Meaning | PWA Required? |
|---|---|---|
| `not-started` | Request has not been initiated by the requester | Yes — entry point |
| `draft` | Request initiated but not yet submitted | Yes — save/resume context |
| `submitted` | Requester has completed required inputs and submitted | Yes — terminal requester action |
| `provisioning` | Backend provisioning is in progress | Yes — status visibility |
| `clarification-needed` | Workflow paused; requester action required | Yes — clarification-return context |
| `provisioning-complete` | Provisioning succeeded; project is accessible | Yes — completion summary context |
| `provisioning-failed` | Provisioning failed after retries | Yes — failure state display |
| Additional states | `[DERIVE FROM G4]` | Verify against G4 implementation |

### Required Requester Actions — Identical Outcomes Across Surfaces

These actions must produce identical backend outcomes regardless of whether the requester takes them in SPFx or the hosted PWA.

| Action | Trigger | Backend Outcome | Must Be Identical? |
|---|---|---|---|
| Start new request | Requester initiates from `/project-setup` | Creates a draft record via `@hbc/provisioning` | Yes |
| Complete a step | Requester fills required fields and advances | Step state transitions to `complete` | Yes |
| Save draft | Requester saves without completing all steps | Draft persisted via `@hbc/session-state`; no backend submission yet | Yes (semantics); mechanism may differ |
| Submit request | Requester completes all required steps | Request submitted to backend; state transitions to `submitted` | Yes |
| Respond to clarification | Requester provides required clarification input | Clarification response submitted; workflow resumes | Yes |
| View request status | Requester opens the status list | Returns RBAC-filtered list of own requests | Yes (data); presentation may differ |

### Presentation Elements — May Be Lighter in PWA

The following presentation choices may be different in the hosted PWA. "Lighter" means simpler, more focused, or with fewer decorative elements — it does not mean less informative.

| Element | SPFx Behavior | PWA Permissible Variation |
|---|---|---|
| Navigation chrome | SharePoint ribbon and navigation | PWA app shell nav — simpler, no ribbon |
| Step progress indicator | Full step header with icons and labels | Compact progress indicator is acceptable if step count and current position are clear |
| Step transition animation | `[DERIVE FROM G4]` | Reduced or simplified animation acceptable |
| Secondary action affordances | Full action bar | Inline or bottom-sheet action menu acceptable on mobile |
| Help / guidance text | `[DERIVE FROM G4]` | Contextual tooltips or expandable guidance acceptable |
| Branding / header | Full SharePoint-context header | PWA-context header (lighter treatment acceptable) |

### Presentation Elements — Must Remain Identical

| Element | Rule |
|---|---|
| Step sequence and step IDs | Same steps, same order, same IDs — no steps added, removed, or reordered in the PWA |
| Required vs. optional field designation | A field that is required in SPFx is required in PWA. Marking a required field optional in the PWA would break the workflow contract. |
| Validation rules | Step validation logic must be identical — the same inputs that pass in SPFx must pass in PWA; the same inputs that fail must fail |
| Error and validation message meaning | The semantic meaning of validation errors must be the same; the exact wording may differ for the PWA context |
| Clarification-state display | When the workflow is in `clarification-needed`, the requester must be shown the clarification request prominently in both surfaces |
| Blocked step behavior | A blocked step in the SPFx Step Wizard must also be presented as blocked in the PWA Step Wizard |

### Draft Payload Type (To Be Finalized in T03)

The draft payload persisted by `@hbc/session-state` must include at minimum:

```typescript
interface RequestDraftPayload {
  /** Stable request ID or ephemeral draft key */
  requestId: string | null;
  /** Step state map: stepId → { status, fieldValues } */
  steps: Record<string, {
    status: StepStatus; // from @hbc/step-wizard
    fieldValues: Record<string, unknown>;
    lastSavedAt: string; // ISO 8601
  }>;
  /** Workflow lifecycle state at last save */
  workflowState: WorkflowState; // subset of provisioning lifecycle
  /** Surface identifier for audit/debugging */
  surface: 'pwa' | 'spfx';
  /** Draft version for conflict detection */
  draftVersion: number;
}
```

This type must be finalized in coordination with T03 and must be compatible with `IDraftEntry` from `@hbc/session-state`.

---

## Acceptance Criteria

1. **Parity contract exists as a committed document.** The parity contract tables (lifecycle states, required actions, lighter vs. identical presentation) are committed in `docs/architecture/plans/MVP/G5/` or an agreed canonical location.

2. **All `[DERIVE FROM G4]` items are resolved.** No placeholder values remain in the parity contract after T02 closes.

3. **Draft payload type is specified.** The `RequestDraftPayload` type (or equivalent) is defined and agreed with T03.

4. **No SPFx workflow semantics are weakened.** The contract does not reduce lifecycle state coverage, remove required actions, or mark required fields as optional.

5. **Step structure is explicit.** The parity contract includes a complete list of step IDs, labels, order, and required/optional status for the project setup request flow.

---

## Validation / Readiness Criteria

Before T02 is closed:

- The parity contract has been reviewed against the current SPFx Group 4 implementation (not just the plan)
- All lifecycle states verified against `@hbc/provisioning` source (failure modes, state transitions)
- The draft payload type has been reviewed by the T03 implementer and agreed as compatible
- No items remain as `[DERIVE FROM G4]` or `[TO BE CONFIRMED]`

---

## Known Risks / Pitfalls

**SPFx Group 4 may not be complete when T02 runs.** If G4 has not been implemented, the parity contract cannot be derived from live SPFx code. In that case, derive it from the G4 task plans, but flag all such items clearly and require re-verification once G4 is complete.

**Step Wizard state model drift.** If `@hbc/step-wizard` is still evolving its state model (step statuses, ordering modes), the parity contract will need to be updated when Step Wizard stabilizes. Lock the Step Wizard interface before locking the parity contract.

**Presentation vs. semantics confusion.** It is easy to inadvertently relax a workflow semantic while intending to simplify a presentation. Every "may be lighter" decision should be reviewed against the question: "Does this change what the requester is committing to or what the backend expects?"

---

## Progress Documentation Requirements

During active T02 work:

- Record when the SPFx Group 4 inspection was performed and what source was used (live code vs. plan)
- Record the Step Wizard gate check outcome
- Track `[DERIVE FROM G4]` items as an explicit list and update this file as each is resolved

---

## Closure Documentation Requirements

Before T02 is closed:

- The parity contract document must be committed (not just drafted in a working file)
- All `[DERIVE FROM G4]` items must be resolved and verified
- The draft payload type must be agreed and recorded in a location accessible to T03
- This task file's Status header must be updated to "complete"
- If any Wave 0 plan language about G5.1 or G5.2 is found to be inaccurate relative to the parity contract, a note must be added to `W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md` under a "Known Corrections" section
