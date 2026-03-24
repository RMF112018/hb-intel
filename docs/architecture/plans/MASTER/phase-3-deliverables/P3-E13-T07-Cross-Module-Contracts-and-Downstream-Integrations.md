# P3-E13-T07 — Cross-Module Contracts and Downstream Integrations

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E13-T07 |
| **Parent** | [P3-E13 Subcontract Execution Readiness Module](P3-E13-Subcontract-Execution-Readiness-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07 of 8 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Financial Contract

### 1.1 Buyout line linkage

Each readiness case must link to the governing buyout intent through `linkedBuyoutLineId` where the case is part of Financial / Buyout execution control.

### 1.2 Execution gate contract

Financial must consume either the active `ExecutionReadinessDecision` or a derived `ReadinessGateProjection` sourced from it. The gate contract must include at least:

- `linkedBuyoutLineId`
- `readinessCaseId`
- `executionReadinessOutcome`
- `decisionIssuedAt`
- `decisionVersion`
- `blockingReasonCode`
- `supersededByCaseId` when relevant

### 1.3 Gate rule

Financial must not allow contract-status progression to `ContractExecuted` unless the active gate projection indicates that execution is allowed for the current identity and current award path.

Financial must not:

- infer readiness from raw item rows,
- write readiness records,
- mutate exception outcomes,
- bypass supersede / void lineage.

---

## 2. Startup Boundary

Startup may hold:

- reference links,
- summary posture,
- dependency visibility where startup operations care about subcontract execution status.

Startup may not hold:

- the readiness workflow,
- readiness evaluation ledgers,
- exception routing,
- readiness decision issuance.

Readiness stays in this module even when startup work references its outputs.

---

## 3. Reports, Health, And Work Queue

### 3.1 Reports

Reports may consume published readiness summaries or gated projections when a report requires them. Reports must not be treated as the readiness ledger.

### 3.2 Health

Health receives derived readiness outputs such as:

- blocked readiness count,
- overdue specialist review count,
- overdue exception approval count,
- renewal-due count,
- ready-for-execution count.

### 3.3 Work Queue

Work Queue receives routed actions including:

- missing item assembly,
- specialist review due,
- exception approval due,
- renewal due,
- blocked execution resolution.

These are projections. The source-of-truth workflow remains in the readiness module.

---

## 4. Related Items And Activity

### 4.1 Required relationship pairs

At minimum, Related Items must support:

- readiness case -> buyout line,
- readiness decision -> buyout line,
- approved exception / precedent reference -> originating readiness case,
- superseded case -> successor case.

### 4.2 Required activity events

At minimum, activity publication must include:

- case created,
- case submitted,
- deficiency issued,
- deficiency resolved,
- exception iteration submitted,
- exception action approved / rejected / returned,
- readiness decision issued,
- case renewed,
- case superseded,
- case voided.

---

## 5. Future External Inputs

Future Procore, vendor-master, licensing, insurance, or external risk systems may later provide:

- artifact references,
- external factual posture,
- prequalification advisories,
- identity hydration,
- alerting inputs.

They remain input contributors only. They must not displace:

- the parent readiness case,
- specialist evaluation ownership,
- exception governance,
- or the project-level readiness decision.

That boundary is required to preserve Project Hub as the governed operating layer.
