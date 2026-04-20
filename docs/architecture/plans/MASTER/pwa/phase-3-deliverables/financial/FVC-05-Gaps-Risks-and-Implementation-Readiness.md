# FVC-05 — Forecast Versioning + Checklist Gaps, Risks, and Implementation Readiness

| Property | Value |
|----------|-------|
| **Doc ID** | FVC-05 |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | Gaps, Risks, and Implementation Readiness |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-27 |

---

*This file reconciles the proposed Forecast Versioning + Checklist model against current repo truth and identifies what still must be completed before this capability can operate as a full replacement for the current monthly forecast confirmation workflow.*

---

## 1. Readiness Summary

### 1.1 What is already strong

| Area | Status |
|------|--------|
| Version-state model | Strong |
| Derivation rules | Strong |
| Confirmation transition logic | Strong |
| Access rules | Strong |
| Checklist template | Strong |
| Confirmation-gate core logic | Strong |
| Candidate designation logic | Strong |
| Publication-promotion stub | Strong enough for current phase |

### 1.2 What is still blocking full runtime completion

| Area | Status |
|------|--------|
| PWA version-history and checklist surfaces | Blocking |
| Runtime façade exposure | Blocking |
| Candidate/publication history visibility | High |
| Lifecycle-event persistence | High |
| Full downstream publication integration | Medium |
| Cutover proof against current monthly workflow | Medium |

---

## 2. Locked Decisions Supported by Repo Truth

These should be treated as effectively locked unless intentionally reopened.

### 2.1 One Working version at a time

This is a core ledger rule and should not be weakened.

### 2.2 No unlock-in-place editing

ConfirmedInternal versions remain immutable. Edits happen by deriving a new Working version.

### 2.3 PER cannot see Working

This is a central review-boundary principle and should remain intact.

### 2.4 Checklist is regenerated per Working version

Checklist completion does not carry forward as “already done” on a newly derived Working version.

### 2.5 Candidate designation is explicit and singular

Only one ConfirmedInternal version should be the reporting candidate at a time.

### 2.6 Publication is downstream-driven

PublishedMonthly should remain tied to reporting publication, not an arbitrary PM-only action.

---

## 3. High-Impact Gaps

### 3.1 No real runtime version-history surface yet

The source logic exists, but the app does not yet clearly expose version history as a real operating view.

**Impact**

- users cannot fully leverage the ledger model
- derivation and supersession remain conceptually correct but operationally opaque

### 3.2 No real checklist workflow surface yet

The template and gate logic exist, but the current repo does not yet prove a full PM working experience around checklist completion and blocker review.

**Impact**

- gate logic cannot replace the current honor-system workflow until surfaced

### 3.3 Candidate/publication history is still more implicit than visible

The source logic can designate and publish, but users need explicit runtime visibility of:

- current candidate
- prior candidate
- published monthly lineage

**Impact**

- weak reporting-cycle clarity
- harder troubleshooting when publication behavior is questioned

### 3.4 Publication handoff still depends on downstream integration

The promotion function exists, but the full event contract with reports publication remains an integration item.

**Impact**

- PublishedMonthly behavior is not fully operational end-to-end yet

### 3.5 No strong lifecycle audit surface yet

Even if lifecycle events are happening correctly, the app still needs durable and visible history around them.

**Impact**

- weaker governance
- harder debugging
- weaker cutover evidence

---

## 4. Operational Risks

### 4.1 Hidden re-edit pressure risk

Users may push for unlocking confirmed versions if derivation and version history are not surfaced cleanly.

**Mitigation**

- make derivation fast and obvious
- show clear lineage
- make the value of immutability visible

### 4.2 Checklist-fatigue risk

If the checklist feels disconnected from the Working version, PMs may treat it as bureaucratic rather than useful.

**Mitigation**

- show blocker lists clearly
- tie checklist items to real readiness context
- show progress and gating status visually

### 4.3 Candidate confusion risk

If the current report candidate is not obvious, PM and reviewers may act on the wrong confirmed version.

**Mitigation**

- visibly mark the candidate
- preserve candidate history
- distinguish confirmed vs candidate vs published states clearly

### 4.4 Publication ambiguity risk

If PublishedMonthly transition is not visibly tied to reporting publication, users may misunderstand whether a confirmed version is “official.”

**Mitigation**

- visibly distinguish ConfirmedInternal from PublishedMonthly
- surface publication run linkage
- preserve publication handoff records

### 4.5 Review-boundary erosion risk

If PER visibility rules are not enforced carefully in runtime UX, the Working-draft isolation principle may erode.

**Mitigation**

- enforce hidden behavior in both service and UI layers
- audit access-sensitive transitions where useful

---

## 5. Recommended Missing Runtime Artifacts

These are the most important operational additions beyond current repo truth:

| Artifact | Why it matters |
|---------|----------------|
| `ForecastVersionLedgerView` | Makes the ledger visible and usable |
| `ForecastVersionLifecycleEvent` | Makes lifecycle history auditable |
| `ChecklistCompletionLedger` | Makes checklist behavior traceable |
| `ChecklistReadinessProjection` | Makes blockers and readiness obvious |
| `ConfirmationAttemptRecord` | Preserves failed/successful confirmation attempts |
| `ReportCandidateAuditRecord` | Preserves candidate designation history |
| `VersionPublicationHandoffRecord` | Connects the version to final publication outcome |

---

## 6. Recommended Sequencing

### 6.1 Minimum path to runtime readiness

| Step | Work Item |
|------|-----------|
| 1 | Formalize the versioning/checklist runtime façade |
| 2 | Build version-history and current-Working surfaces |
| 3 | Build checklist interaction and blocker UX |
| 4 | Expose candidate/publication visibility |
| 5 | Add lifecycle and checklist audit history |
| 6 | Complete downstream publication handoff integration |

### 6.2 Minimum path to process-replacement readiness

Process replacement should occur only after:

- users can operate the checklist and confirmation flow inside the app
- version history is clear and trusted
- derivation from confirmed state is frictionless
- candidate/publication status is visible and understandable
- monthly cycles prove that the new ledger replaces the old informal process cleanly

---

## 7. Overall Readiness Call

### 7.1 Ready now

The repo is ready now for:

- formalizing the Forecast Versioning + Checklist package
- building the runtime façade and surfaces
- proving the checklist/confirmation flow as a real PM operating workflow

### 7.2 Not ready yet

The repo is not yet ready for:

- claiming full end-to-end process replacement
- relying on publication behavior without downstream integration completion
- retiring the informal monthly confirmation process entirely

### 7.3 Overall assessment

**Assessment: strong deterministic core, incomplete operational shell**

That is a strong implementation position.

---

## 8. Final Recommendation

Treat Forecast Versioning + Checklist as a first-class operating workflow, not just a rules package behind the scenes.

Do not continue treating it as:

- only a state enum collection
- only helper functions
- only a hidden prerequisite to reporting

It is the governance backbone of the monthly financial forecasting process and should be surfaced accordingly.

---

*End of package*
