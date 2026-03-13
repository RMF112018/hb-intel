# MVP-Project-Setup-T06 — SharePoint Template and Permissions Bootstrap

**Phase Reference:** MVP Project Setup Master Plan  
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap  
**Decisions Applied:** D-03 through D-06, D-10, D-14 + R-01, R-04, R-05, R-06  
**Estimated Effort:** 1.0 sprint-weeks  
**Depends On:** T02, T05  
> **Doc Classification:** Canonical Normative Plan — SharePoint-template/permissions task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Implement the MVP’s one-template SharePoint provisioning strategy, department-driven pruning behavior, and hybrid permission bootstrap under an app-governed authorization model.

---

## Required Paths

```text
backend/functions/src/functions/provisioningSaga/steps/*
backend/functions/src/services/*
packages/models/src/provisioning/*
packages/auth/src/backend/*
docs/architecture/adr/*
```

---

## Template Strategy

### Baseline

- provision from one maintained base project template
- base template contains both department-specific library variants
- provisioning selects the request department and removes the nonapplicable library
- project type does not create structural branching in MVP

### Native-vs-custom rule

- use site template / site script actions for repeatable site-scoped configuration when feasible
- use custom saga steps for behaviors the native template layer does not cover cleanly or for logic already standardized in the backend
- document which artifacts are native-template-driven vs custom-step-driven

---

## Department Behavior

`department` must drive at minimum:

- retained primary document library
- default background access set
- any department-specific link or getting-started language differences approved for MVP

Do **not** introduce department-specific site architectures beyond those locked behaviors.

---

## Hybrid Permission Bootstrap

### Required access sets

1. **Project team**
   - request-listed group members

2. **Structural owners**
   - OpEx manager
   - required admin / standards ownership principals

3. **Department background access**
   - approved leadership/shared-services access by department

4. **Excluded in MVP**
   - external users
   - ad hoc sharing links as part of provisioning

### Governance rules

- end-user permissions in SharePoint are not the authorization source of truth
- nonstandard grants must be represented as app-governed records or explicit follow-on access workflows
- default deny remains the invariant
- least privilege should guide service-principal and automation access
- long-term design should favor `Sites.Selected` / selected-scope app access for post-create automation where workable

---

## Technical Implementation Rules

- Step 6 must no longer be just `groupMembers + OpEx`
- permission writes must be deduplicated and idempotent
- site principal assignment failures must be recoverable and evented
- permission bootstrap should be separable from later user-managed access changes
- if Graph and SharePoint APIs differ in required coverage, choose the least-throttled supported path and document why

---

## Verification Commands

```bash
pnpm --filter @hbc/functions test -- permissions
pnpm --filter @hbc/functions test -- provisioningSaga
rg -n "department|library|Sites.Selected|setGroupPermissions|OpEx|shared-services|leadership" backend/functions packages/models packages/auth
```
