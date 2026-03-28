# FIN-03 — Financial Module Lane Ownership Matrix

## Document Purpose

This document defines capability-level ownership between the PWA and SPFx lanes for the Financial module.

It exists to prevent blurred implementation, duplicate depth, unsupported SharePoint behavior, and ambiguous workflow ownership.

This document should be read with:
- `FIN-01 — Financial Module Operating Posture and Surface Classification`
- `FIN-02 — Financial Module Action Posture and User-Owned Work Matrix`
- `FIN-04 — Financial Module Route and Context Contract`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRM-00-Financial-Runtime-Model.md`

---

## 1. Locked Lane Doctrine for Financial

### 1.1 PWA Lane
The PWA is the **authoritative full-depth Financial operating lane**.

The PWA owns:
- multi-step workflows
- complex editing
- review custody
- version derivation and immutable-state progression
- richer recovery and draft behavior
- deeper routing and section ownership
- cross-surface workflow coordination
- project-scoped operating surfaces beyond simple contextual summaries

### 1.2 SPFx Lane
SPFx is the **broad operational companion lane** for Financial.

SPFx owns:
- contextual entry within SharePoint project site experience
- lighter operational access and summary visibility
- in-context navigation to current financial posture
- shallow or controlled edits that fit supported SharePoint patterns
- launch into canonical PWA routes when workflow depth or route durability is required

### 1.3 Locked Rule
If a Financial interaction requires:
- multi-step guided workflow
- complex reconciliation
- draft resilience / recovery
- version lifecycle transition
- dense or progressive editing
- heavy cross-surface coordination
- review/publication custody

that interaction belongs to the **PWA**, even if SPFx provides the contextual launch point.

---

## 2. General Lane Principles

### 2.1 Same Semantics, Different Depth
Where both lanes expose the same capability, the semantic meaning must remain the same even if depth differs.

### 2.2 No Unsupported SPFx Behavior
SPFx implementations must remain within supported SharePoint Framework patterns. Financial workflows must not depend on brittle DOM-coupled page manipulation or unsupported host mutation strategies.

### 2.3 Canonical Route Rule
Deep Financial workflows launched from SPFx must open canonical PWA Financial routes rather than relying on hidden store mutation or non-durable context handoff.

### 2.4 Source-of-Truth Rule
Lane choice does not alter source-of-truth or write-boundary ownership. The same domain authority rules apply regardless of entry lane.

---

## 3. Capability-Level Lane Matrix

| Capability | PWA Ownership | SPFx Ownership | Locked Outcome |
|---|---|---|---|
| Financial posture summary | primary rich experience | broad contextual summary | both, same semantics |
| Financial home triage | primary | contextual preview / launch | PWA primary |
| Budget import start | yes | optional contextual launch or shallow start | PWA primary |
| Import preview / exception resolution | yes | no | PWA only |
| Reconciliation / activation | yes | no | PWA only |
| Forecast working version editing | yes | limited or none | PWA primary / likely PWA only |
| Candidate designation / derivation | yes | no | PWA only |
| Checklist visibility | yes | yes | both |
| Checklist resolution | yes | limited only if simple and supported | PWA primary |
| GC/GR editing | yes | optional shallow access if proven simple | PWA primary |
| Cash Flow editing | yes | optional shallow access if proven simple | PWA primary |
| Buyout status summary | yes | yes | both |
| Buyout deeper workflow | yes | launch only | PWA primary |
| Review / PER custody | yes | no except status visibility | PWA only |
| Publication / export control | yes | optional status / launch | PWA primary |
| History / audit inspection | yes | yes | both |
| Report artifact visibility | yes | yes | both |
| Cross-project financial navigation | yes | no | PWA only |
| Draft recovery / unsaved work continuity | yes | no | PWA only |

---

## 4. Surface-Level Lane Assignment

## 4.1 Financial Landing / Home

### PWA
- authoritative project-scoped financial operating home
- richer posture, next move, unresolved items, deeper workflow entry

### SPFx
- contextual financial summary and direct launch surface inside SharePoint project context
- may surface top issues, pending review, and current posture
- must not become a shadow full-depth Financial app

### Locked Outcome
PWA owns the real operating home. SPFx provides contextual companion entry.

---

## 4.2 Budget Import and Reconciliation

### PWA
Owns the full import lifecycle:
- run creation
- parsing preview
- exception resolution
- mapping and reconciliation
- activation of baseline

### SPFx
May provide:
- baseline status visibility
- “start import” or “resume import” launch
- shallow import history visibility

### Locked Outcome
Any meaningful reconciliation or activation work belongs to PWA.

---

## 4.3 Forecast Summary / Versioning

### PWA
Owns:
- create / derive version
- edit working state
- designate candidate
- submit for review
- view/edit deeper financial sections

### SPFx
May provide:
- current version posture
- limited visibility into status and readiness
- launch to current working version

### Locked Outcome
Version lifecycle mutation belongs to PWA.

---

## 4.4 Forecast Checklist

### PWA
Owns full checklist resolution and linked workflow navigation.

### SPFx
May provide:
- checklist posture visibility
- unresolved count / blocked status
- direct launch to resolve

### Locked Outcome
SPFx may inform; PWA resolves.

---

## 4.5 GC/GR and Cash Flow

### PWA
Owns full-depth editing and scenario-sensitive updates.

### SPFx
May provide:
- posture summary
- last-updated / completeness visibility
- launch into editor

### Locked Outcome
Unless a narrow, clearly supported shallow edit case is explicitly defined later, treat mutation ownership as PWA-only.

---

## 4.6 Buyout

### PWA
Owns:
- detailed buyout progression
- savings posture updates
- disposition workflow
- integration with related procurement / commitment posture

### SPFx
May provide:
- buyout status visibility
- unresolved actions summary
- launch into buyout workflow

### Locked Outcome
Broad visibility in both lanes; deep ownership in PWA.

---

## 4.7 Review / PER / Publication / Export

### PWA
Owns:
- review custody
- approve / hold / return transitions
- publication initiation
- export artifact control
- error handling / rerun / audit trace

### SPFx
May provide:
- status visibility
- launch to current review / publication surface
- artifact visibility after completion

### Locked Outcome
Review and publication custody belong to PWA.

---

## 4.8 History / Audit

### PWA
Owns richer timeline, comparison, and traceability experiences.

### SPFx
May provide broad history visibility where useful to project-site users.

### Locked Outcome
Both lanes may expose history, but PWA remains the deeper analysis lane.

---

## 5. Launch-to-PWA Rules

SPFx must launch to PWA when any of the following are true:

- the workflow spans more than one step
- the user must retain draft state or recovery state
- the user must resolve exceptions or reconciliation detail
- a version lifecycle transition is involved
- review custody or publication is involved
- the action depends on richer project-scoped routing
- cross-project navigation or portfolio context is required

Launches should target canonical routes defined in FIN-04.

---

## 6. Lane-Specific Runtime Expectations

## 6.1 PWA Expectations
- full route durability
- project-safe context ownership
- progressive disclosure
- rich edit/review workflows
- draft and recovery handling where needed
- full cross-surface continuity

## 6.2 SPFx Expectations
- supported SharePoint-hosted contextual UX
- lighter operational access
- strong launch affordances
- no fake full-depth duplicate workflows
- no unsupported customization patterns

---

## 7. Test and Acceptance Expectations by Lane

### PWA
Must prove:
- section routing works
- project switching remains safe
- deep workflows remain durable on refresh
- draft or recovery-sensitive surfaces behave correctly
- review/publication transitions behave correctly

### SPFx
Must prove:
- contextual Financial posture is accurate
- launches open the correct canonical PWA destinations
- summary posture matches PWA semantics
- no unsupported host manipulations are required

---

## 8. Acceptance Standard for This Document

This document is satisfied when:
- every major Financial capability has a locked lane owner
- PWA vs SPFx ambiguity is materially reduced for implementation planning
- launch-to-PWA conditions are explicit
- both lanes preserve common semantics without pretending to offer equal workflow depth
- FIN-04 can map concrete route ownership from the lane rules defined here
