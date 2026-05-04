# Live Integration and Security Gates — Estimating Workbench

## Blocked Until Later Explicit Gates

- SharePoint list creation/mutation.
- Tenant app catalog or deployment changes.
- Procore read/write integration.
- Sage read/write integration.
- Autodesk/BuildingConnected integration.
- Active project workbook import.
- HBI live vector/search/LLM behavior.
- Package install or lockfile mutation.

## Required Gates Before Live Runtime

1. Documentation contract closeout.
2. Security and permission model review.
3. SharePoint list schema dry-run package.
4. Non-production tenant list/library provisioning proof.
5. SPFx hosted visual validation.
6. Bundle/dependency review.
7. Performance threshold review using expected estimate line-item volumes.
8. Handoff validation proof.
9. Source-of-record review for Sage/Procore mapping.
10. Production rollout approval.

## Sensitive Data Controls

- Vendor pricing, internal recommendation, fee/markup, contingency, and owner strategy fields are sensitive.
- Estimator scratchpads are not automatically downstream-visible.
- Executive read-only views must suppress editing and may redact pre-award sensitive data.
- HBI may not answer from redacted fields unless actor permission allows source access.
