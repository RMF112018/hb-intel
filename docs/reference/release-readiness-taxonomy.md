# Release Readiness Taxonomy

**Type:** Reference Document (Diátaxis)
**Created:** 2026-03-09
**Governed by:** PH7.9 — Release Semantics & Readiness Taxonomy

---

## 1. Taxonomy Definitions

### Code-Ready

All source code, tests, and documentation for the feature or phase are complete and pass CI. **This level is met when:** build, lint, type-check, and test suites pass on `main`.

### Environment-Ready

Target infrastructure (Azure, SharePoint, CI/CD pipelines) is provisioned and configured for the deployment target. **This level is met when:** all infrastructure checklist items are verified in the target environment.

### Operations-Ready

Monitoring, alerting, runbooks, and support handoff are complete. **This level is met when:** the operations team confirms readiness for production support.

### Production-Ready (Composite)

All three levels — Code-Ready, Environment-Ready, and Operations-Ready — are satisfied. **Only use this term when all three are true.** A final release decision (equivalent to the PH5 "APPROVED FOR PRODUCTION" statement) requires all three levels to be signed off and dated.

### N/A / Deferred

For components where a readiness level is genuinely inapplicable at the current stage — for example, a pure library package with no deployment surface, or a feature whose environment has not yet been provisioned. Fields that are N/A or Deferred **must** be recorded as such with a one-line rationale; they must not be left blank or fabricated.

---

## 2. Language Rules

The following rules govern how readiness language is used across plans, completion notes, commit summaries, and sign-off artifacts:

1. **"Production-ready"** must not be used to describe code-only completion. Use "Code-Ready" instead.
2. **Implementation Objective** lines that describe deliverables should use the specific readiness level being targeted (typically "Code-Ready" for plan-scoped work).
3. **Completion Statements** should explicitly state which readiness level was achieved.
4. **Commit summaries** should not claim "production-ready" unless all three levels are verified.
5. **Release/sign-off artifacts** must use the per-level date fields defined in the release sign-off template.

### Grandfather Clause

The following two carve-outs are **not subject to retroactive enforcement**:

1. **"Production-Ready Code:" section headings** used throughout Phase 4C and Phase 5C plan files (e.g., `PH5C.3`, `PH5C.4`, `PH5C.8`) are a formatting artifact labelling code blocks intended for copy-paste. They are not readiness claims. These are Historical Foundational documents (per the PH7.10 classification) and must not be modified.

2. **Existing ADR Context sections** that use "production-ready" (e.g., ADR-0063, ADR-0052, ADR-0020) are permanent, append-only records and are not subject to retroactive amendment under the new language rules.

---

## 3. Anti-Pattern: "Production-Ready" as Implementation Objective

### Before (Original — PH6 Provisioning Plan)

> **Implementation Objective:** Deliver a production-ready SharePoint site provisioning system where an Estimating Coordinator submits a Project Setup Request, a Controller approves and triggers provisioning, and all relevant stakeholders see real-time or start/finish progress across seven HB Intel apps — with full security, observability, testing, and rollback coverage.

### Why This Is Problematic

This objective conflates Code-Ready (source code, tests, documentation complete) with Production-Ready (all three levels satisfied). At the time of writing, the PH6 plan targeted code completion and CI verification — it did not provision production infrastructure or complete operations handoff. Using "production-ready" implies a scope that was not fully in play.

### Correct Replacement Phrasing

> **Implementation Objective:** Deliver a **Code-Ready** SharePoint site provisioning system… Full Production-Ready status requires Environment-Ready and Operations-Ready gates, which are tracked separately per the Release Readiness Taxonomy.

---

## 4. Grandfathered-Language Registry

The following historical patterns are **not violations** of the language rules. Contributors auditing old documents must consult this registry before filing issues:

| Pattern | Location | Rationale |
|---------|----------|-----------|
| "Production-Ready Code:" section headings | PH4C and PH5C plan files (e.g., `PH5C.3`, `PH5C.4`, `PH5C.8`) | Formatting artifact labelling code blocks for copy-paste. Not a readiness claim. Historical Foundational documents — do not modify. |
| "production-ready" in ADR Context sections | ADR-0063, ADR-0052, ADR-0020, and others | ADRs are permanent, append-only records. Context sections reflect the language used at the time of the decision. |

---

## 5. Release Sign-Off Template

The following template is used for future phase release sign-off documents. A standalone copy is maintained at `docs/architecture/release/release-signoff-template.md`.

### Staged Sign-Off Model

Sign-off for each readiness level is recorded **when that level is achieved**, not all at once. A release doc may be open with Code-Ready captured while Environment-Ready is still pending. The Production-Ready field is filled only when all three levels have been captured.

### Sign-Off Roles

| Role | Responsible For |
|------|----------------|
| **Architecture Owner** | All three gates (Code-Ready, Environment-Ready, Operations-Ready) |
| **Product Owner** | Code-Ready and Production-Ready |
| **Operations/Support Owner** | Operations-Ready only |

Environment-Ready is a factual infrastructure checklist — no named sign-off is required, but the date must be recorded.

### Template

```markdown
# Phase [X] Release Sign-Off

## Readiness Levels

| Level | Status | Date | Evidence / Notes |
|-------|--------|------|------------------|
| Code-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to CI evidence_ |
| Environment-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to infra checklist_ |
| Operations-Ready | ☐ Achieved / ☐ N/A / ☐ Deferred | YYYY-MM-DD | _Link to ops confirmation_ |
| **Production-Ready** | ☐ All three achieved | YYYY-MM-DD | _Filled only when all above are complete_ |

> For any N/A or Deferred entry, provide a one-line rationale below the table.

## Named Sign-Offs

### Architecture Owner
- **Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Code-Ready ☐ | Environment-Ready ☐ | Operations-Ready ☐

### Product Owner
- **Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Code-Ready ☐ | Production-Ready ☐

### Operations/Support Owner
- **Name:** ___
- **Decision:** APPROVED / NOT APPROVED
- **Date:** YYYY-MM-DD
- **Scope:** Operations-Ready ☐

## Final Release Decision

- **Release Decision:** APPROVED FOR PRODUCTION / BLOCKED
- **Decision Date:** YYYY-MM-DD
- **Decision Basis:** All readiness levels achieved and all required sign-offs are APPROVED.
```

---

## 6. Adopter Guidance: N/A and Deferred

### When to Use N/A

Use **N/A** when a readiness level is genuinely inapplicable to the component:

- A pure shared library package (`@hbc/ui-kit`, `@hbc/utils`) has no deployment surface → Environment-Ready and Operations-Ready are N/A.
- A documentation-only phase has no code → Code-Ready may be N/A.

### When to Use Deferred

Use **Deferred** when a readiness level applies but cannot be completed at this stage:

- Infrastructure has not yet been provisioned → Environment-Ready is Deferred.
- Operations team has not yet been onboarded → Operations-Ready is Deferred.

### Required Rationale

Every N/A or Deferred entry **must** include a one-line rationale. It must not be left blank. Example:

> Environment-Ready: **Deferred** — Azure Function App provisioning is scheduled for Phase 8 CI/CD deployment.

### Transitioning from Deferred

When a deferred level is later achieved, update the release sign-off document with:
1. Change the status from "Deferred" to "Achieved."
2. Record the date and link to evidence.
3. If all three levels are now achieved, fill in the Production-Ready row.

---

> **Note:** The architectural decision to adopt this taxonomy is recorded in ADR-0083. See [ADR index](../architecture/adr/).
