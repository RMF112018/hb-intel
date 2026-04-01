# Phase 9 — Gap 1 Resolution Summary

## Gap being resolved

**Gap 1 — SPFx permission declaration gap**

The Project Setup Requests package does not currently declare `solution.webApiPermissionRequests` in the authoritative estimating `package-solution.json`, even though the frontend is designed to use SPFx audience-scoped token acquisition in production mode.

## Why this matters

Without the manifest declaration:
- the standard SPFx package-driven API permission request flow is not triggered
- uploading the `.sppkg` to the App Catalog will not surface the pending permission request through SharePoint API access
- the package can remain code-capable but still fail to activate production token acquisition through the supported deployment path
- operator documentation can misleadingly describe API approval as a prerequisite without tying it to the package declaration that is supposed to trigger that approval request

## Resolution strategy

Phase 9 resolves this gap in five steps:

1. **Freeze the correct permission request values**
   - determine the exact API app `resource`
   - determine the exact delegated `scope`
   - document the evidence for both values

2. **Add the missing declaration**
   - update the authoritative estimating `package-solution.json`
   - avoid duplicative or downstream-only edits

3. **Verify packaging propagation**
   - rebuild the Project Setup package
   - confirm the declaration remains intact through the actual packaging path
   - verify there is no stripping, overwrite, or silent mutation

4. **Reconcile docs**
   - correct the deployment/operator narrative
   - ensure docs explain the real order of operations for SharePoint API approval
   - reconcile the `apiAudience` contradiction between the validation report and the existing Phase 8 remediation report

5. **Publish closure evidence**
   - summarize what changed
   - record the selected `resource` and `scope`
   - document the verification steps run
   - identify remaining environment/operator prerequisites, if any

## Deliverables expected from Phase 9

- updated `apps/estimating/config/package-solution.json`
- updated audit/review documentation reflecting the implemented truth
- package build verification evidence
- a final Gap 1 closure record

## Success criteria

Gap 1 is considered cleanly resolved when all of the following are true:
- the authoritative estimating `package-solution.json` contains the correct `solution.webApiPermissionRequests` declaration
- the implemented `resource` and `scope` are supported by repo truth and documented evidence
- the package build and artifact verification confirm the declaration survives the packaging pipeline
- the deployment docs truthfully describe how the SharePoint API access approval step is triggered
- the `apiAudience` narrative is reconciled with current repo truth
- no unrelated auth or architecture work is introduced under the guise of this gap closure

## Out-of-scope items

The following are not part of Gap 1 closure unless they become direct blockers:
- full RBAC convergence
- Entra app-role redesign
- broader backend host refactoring
- SharePoint list schema remediation for other gaps
- Teams production support
- generalized production readiness remediation outside the permission-declaration flow
