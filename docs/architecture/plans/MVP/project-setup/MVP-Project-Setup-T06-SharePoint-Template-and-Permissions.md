# MVP-Project-Setup-T06 — SharePoint Template and Permissions Bootstrap

**Phase Reference:** MVP Project Setup Master Plan
**Spec Source:** `MVP-Project-Setup.md` + MVP Blueprint + MVP Roadmap
**Decisions Applied:** D-03 through D-06, D-10, D-14 + R-01, R-04, R-05, R-06
**Estimated Effort:** 1.0 sprint-weeks
**Depends On:** T02, T05
> **Doc Classification:** Canonical Normative Plan — SharePoint-template/permissions task; sub-plan of `MVP-Project-Setup-Plan.md`.

---

## Objective

Implement the MVP's one-template SharePoint provisioning strategy, department-driven pruning behavior, and hybrid permission bootstrap under an app-governed authorization model.

---

## Required Paths

```text
backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts
backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts
backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts
backend/functions/src/services/sharepoint-service.ts
backend/functions/src/services/service-factory.ts
packages/models/src/provisioning/*
docs/architecture/adr/*
```

> **Corrected path note:** Backend identity and SharePoint service work lives in `backend/functions/src/services/` and `backend/functions/src/middleware/`. The path `packages/auth/src/backend/*` does not exist in this repo and must never be referenced.

---

## Template Strategy

### Baseline

- provision from one maintained base project template
- base template contains both department-specific library variants (e.g., Commercial and Luxury Residential document libraries)
- provisioning selects the request `department` and removes the non-applicable library in **step 3** (`step3-template-files.ts`)
- project type does not create structural branching in MVP

### Department pruning (assigned to step 3)

Department-based library removal must be performed as a pruning action within `step3-template-files.ts`:

1. After template files are applied, read `status.department` (sourced from the associated request)
2. Identify the non-applicable library name based on the department
3. Delete or skip provisioning the non-applicable library artifacts
4. The pruning step must be idempotent: if the library is already absent, no-op

Document which library is removed for each department value in `backend/functions/README.md`.

### Native-vs-custom rule

- use site template / site script actions for repeatable site-scoped configuration when feasible
- use custom saga steps for behaviors the native template layer does not cover cleanly or for logic already standardized in the backend
- document which artifacts are native-template-driven vs custom-step-driven

---

## Department Behavior

`department` (from `IProjectSetupRequest.department`) must drive at minimum:

- retained primary document library (department-specific)
- default background access set (department-specific; see step 6 expansion below)
- any department-specific link or getting-started language differences approved for MVP

Do **not** introduce department-specific site architectures beyond those locked behaviors.

---

## Hybrid Permission Bootstrap

The current `step6-permissions.ts` only grants access to `groupMembers + OPEX_UPN`. T06 must expand step 6 to provision three distinct, deduplicated access sets.

### Required access sets

**Set 1 — Project team**
- `status.groupMembers` (from the request; already present in step 6)

**Set 2 — Structural owners**
- `OPEX_UPN` env var (already present in step 6)
- any additional required admin / standards ownership principals defined in backend environment configuration (e.g., `STRUCTURAL_OWNER_UPNS` as a comma-separated list)

**Set 3 — Department background access**
- an approved per-department access list, sourced from environment configuration or a config lookup table
- applied based on `status.department` (must be present on `IProvisioningStatus` after T02 model additions)
- example: all `commercial` projects grant background read to `commercial-leadership@company.com`
- the per-department list must be documented in `backend/functions/README.md`

### Idempotency requirement

- before each permission write, check current group membership
- skip the write if the principal is already a member with the expected permission level
- log each skip as a non-error idempotent event

### Implementation pattern

```ts
// In step6-permissions.ts
const projectTeam = status.groupMembers ?? [];
const structuralOwners = [
  OPEX_UPN,
  ...(process.env.STRUCTURAL_OWNER_UPNS?.split(',').map(s => s.trim()) ?? []),
].filter(Boolean);
const deptBackground = getDepartmentBackgroundAccess(status.department);

const allMembers = Array.from(new Set([...projectTeam, ...structuralOwners, ...deptBackground]));
await services.sharePoint.setGroupPermissions(status.siteUrl, allMembers, OPEX_UPN);
```

Add `getDepartmentBackgroundAccess(department: ProjectDepartment): string[]` as a utility in the step or a shared config module.

### Governance rules

- end-user permissions in SharePoint are not the authorization source of truth
- nonstandard grants must be represented as app-governed records or explicit follow-on access workflows
- default deny remains the invariant
- least privilege should guide service-principal and automation access
- long-term design should favor `Sites.Selected` / selected-scope app access for post-create automation where workable

---

## Excluded in MVP

- external users
- ad hoc sharing links as part of provisioning

---

## Verification Commands

```bash
pnpm --filter @hbc/functions test -- permissions
pnpm --filter @hbc/functions test -- provisioningSaga

# Confirm step6 has all three access sets
rg -n "projectTeam\|structuralOwners\|deptBackground\|getDepartmentBackgroundAccess\|department" backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts

# Confirm department pruning in step3
rg -n "department\|prune\|remove.*library\|delete.*library" backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts

# Confirm idempotent permission check
rg -n "idempotent\|already.member\|checkMembership\|skipWrite" backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts

# Confirm no reference to packages/auth/src/backend
rg -rn "packages/auth/src/backend" backend/ && echo "ERROR: invalid path reference found" || echo "OK: no invalid path references"

# Confirm Sites.Selected is documented
rg -n "Sites.Selected\|selected-scope\|least.privilege" backend/functions/README.md
