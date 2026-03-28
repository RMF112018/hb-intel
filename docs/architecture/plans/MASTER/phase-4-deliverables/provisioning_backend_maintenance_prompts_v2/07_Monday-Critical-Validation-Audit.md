# Monday-Critical Validation Audit

**Date:** 2026-03-28
**Scope:** Provisioning saga + SPFx Estimating/Accounting/Admin surfaces
**Backend version:** @hbc/functions v0.0.54

---

## 1. Validation Matrix

| ID | Finding | Status | Severity | Affected Files | Evidence | Monday Relevance |
|----|---------|--------|----------|----------------|----------|------------------|
| F1 | Request persistence incomplete: `department`, `estimatedValue`, `clientName`, `startDate`, `contractType`, `projectLeadId`, `viewerUPNs`, `addOns` submitted by Estimating form but not persisted by submit handler | **VALIDATED** | **Blocker** (department), **High** (others) | `projectRequests/index.ts:42-54`, `project-requests-repository.ts:92-111`, `NewRequestPage.tsx:128-142` | Handler builds IProjectSetupRequest with only 11 fields; form submits 8 additional fields that are silently dropped. Repository `toListItem` and `fromListItem` also lack these columns. | `department` drives Step 6 viewer group population. All others are displayed by Accounting review — blank values degrade reviewer experience. |
| F2a | Backend list endpoint has no requester scoping | **PARTIALLY VALIDATED** | **Low** (for Monday SPFx path) | `projectRequests/index.ts:71-85`, `project-requests-repository.ts:56-85` | `listRequests(state?)` returns all requests globally. No `submittedBy` filter parameter. | NOT blocking for Monday SPFx: Estimating detail uses requestId lookup, Accounting correctly sees all, Admin uses provisioning runs. PWA "My Requests" is affected but out of scope. |
| F2b | Repository does not support requester filtering | **VALIDATED** | **Low** (for Monday) | `project-requests-repository.ts:56-85` | Only supports `state` filter. `select()` clause at line 60-76 has no `SubmittedBy` filter capability. | Deferred — no Monday SPFx surface requires server-side requester filtering. |
| F3 | Saga compensation incomplete: Step 6 Entra ID group cleanup not implemented | **VALIDATED** — Acceptable design choice | **Low** | `step6-permissions.ts:110-114`, `saga-orchestrator.ts:420-435` | Explicitly documented as intentional. Comment: "Orphaned groups are inert and can be cleaned up manually." Compensation chain covers steps 7->4->3->2->1. | Not a Monday blocker. Orphaned Entra groups have no operational impact. Manual cleanup is documented. |
| F4 | Step 5 timer continuity incorrect | **NOT VALIDATED** — Implementation is correct | **N/A** | `saga-orchestrator.ts:214-245`, `timerFullSpec/handler.ts:48-158` | Saga continues with steps 6-7 after Step 5 deferral (line 242: "continuing with steps 6 and 7"). Timer picks up deferred jobs nightly. Request record reconciled to Completed on timer success (handler.ts:274). | No deficiency. Step 5 deferral and timer retry work as designed. |
| F5 | Accounting approval test stale: does not validate project number flow | **VALIDATED** — 2 tests currently failing | **High** | `ProjectReviewDetailPage.test.tsx:86-109,247-266` | Test G4-T03-006 clicks Approve without entering project number. Button is disabled when `projectNumber` is empty (`disabled={!isProjectNumberValid}`), so `handleApprove` never fires. Assertion expects `advanceState('req-1', 'ReadyToProvision', undefined)` but it's never called. Test G4-T03-013 fails for same reason — approve never fires, no error banner appears. | **Currently breaking CI.** Component code is correct — project number validation works. Tests must enter a valid project number before clicking Approve. |
| F6 | Repository `toListItem`/`fromListItem` don't round-trip all model fields | **VALIDATED** — Deepens F1 | **Blocker** (with F1) | `project-requests-repository.ts:92-133` | `toListItem` writes 14 columns. Model has 25+ fields. `fromListItem` reconstructs only the 14 stored columns. Even if submit handler persisted all fields, repository would drop them on read. `listRequests` `select()` clause at line 60-76 also excludes them. | Blocking: both handler persistence AND repository mapping must be updated together. |

---

## 2. Deficiency Register (validated + Monday-relevant only)

| Priority | ID | Deficiency | Classification |
|----------|----|-----------|----------------|
| 1 | **F5** | Two accounting approval tests currently failing — test doesn't enter project number before clicking Approve | True defect (test-only) |
| 2 | **F1+F6** | Request persistence gap — 8 form fields (including `department`) silently dropped by submit handler + repository mapping | True defect (code) |

---

## 3. Recommended Remediation Order

### Fix 1: Accounting approval tests (F5)
**Estimated risk: Very low**

Update tests G4-T03-006 and G4-T03-013 to enter a valid project number in the modal before clicking Approve:
- Find the project number input via `getByPlaceholderText('##-###-##')` or `getByRole('textbox')`
- `fireEvent.change(input, { target: { value: '25-001-01' } })`
- Then click Approve
- Assert `advanceState` called with `{ projectNumber: '25-001-01' }`
- For the error test, also enter the project number so the approve fires and the rejection can occur

### Fix 2: Request persistence gap (F1 + F6)
**Estimated risk: Medium — touches handler + repository + SharePoint schema**

Three layers need updating in this order:
1. **Submit handler** (`projectRequests/index.ts:42-54`): Add `department`, `groupLeaders`, `estimatedValue`, `clientName`, `startDate`, `contractType`, `projectLeadId`, `viewerUPNs`, `addOns` from `body`
2. **Repository `toListItem`** (`project-requests-repository.ts:92-111`): Add SharePoint column mappings for all new fields (JSON-serialize arrays)
3. **Repository `fromListItem`** (`project-requests-repository.ts:113-133`): Add deserialization for all new fields
4. **Repository `listRequests` select clause** (`project-requests-repository.ts:60-76`): Add new columns to select

**SharePoint schema note:** The new columns must exist in the Projects list on the target SharePoint site. This is a deployment prerequisite — column creation may need to happen before or alongside the code deployment.

---

## 4. "Do Not Fix Before Monday" List

| ID | Finding | Reason to defer |
|----|---------|-----------------|
| F2a/F2b | Requester scoping (server-side filtering) | No Monday SPFx surface needs it. Estimating uses requestId lookup. Accounting/Admin correctly see all. PWA "My Requests" is out of scope. Risk of unintended side effects outweighs value. |
| F3 | Step 6 Entra ID group compensation | Documented intentional design choice. Orphaned groups are inert. Implementing group deletion adds risk to the Monday-critical compensation chain. |
| F6 (SharePoint columns) | New SharePoint list columns for persisted fields | If the target Projects list doesn't already have the columns, column creation is a SharePoint admin action. The handler + repository code can be deployed, but columns must exist first. Confirm column availability before claiming this fix is complete. |

---

## Ready for Remediation

The next prompt should address exactly these two issues and nothing else:

1. **Fix the 2 failing accounting approval tests** (F5) — enter project number `25-001-01` in the modal input before clicking Approve in tests G4-T03-006 and G4-T03-013.

2. **Fix the request persistence gap** (F1 + F6) — update the submit handler to capture all Estimating form fields, update the repository `toListItem`/`fromListItem`/`select()` to round-trip them, noting that SharePoint column creation is a deployment prerequisite.
