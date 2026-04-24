# Production Readiness Gap Register

Date: 2026-04-24

| ID | Gap | Severity | Evidence / reason | Remediation |
|---|---|---|---|---|
| G-01 | Runtime config is property-pane driven and can drift | Blocker | `functionAppUrl` and `apiAudience` are free-text webpart props; manifest defaults do not include them | Add governed runtime config source, independent accepted origin, deploy proof, and fail-closed tests |
| G-02 | Accepted backend origin is not independent | Blocker | It is derived from the same `functionAppUrl` value | Use a separately governed accepted origin or environment binding manifest |
| G-03 | Permission matrix not surfaced in UI | High | Backend roles differ by preview/ingest/replay | Add capability model from auth bootstrap / backend response and disable/label actions by role |
| G-04 | UI date validation is weaker than backend | High | UI regex accepts invalid calendar dates | Share validator semantics or duplicate exact plain-date validation |
| G-05 | Inspection number semantics drift | High | UI says non-negative; parser expects positive | Enforce positive integer and update text/tests |
| G-06 | Reporting period status is not enforced by UI | High | UI says open required but defaults to first period | Require explicit open period or correct product copy/backend contract |
| G-07 | `uploadedByUpn` fallback is not authoritative | High | Hardcoded fallback can misstate identity | Derive from SPFx/user claims or remove as trusted value; backend claims should own identity |
| G-08 | Client telemetry is insufficient for production support | High | Support details exist, but no governed browser telemetry/tracing | Add telemetry events for preview/commit/replay/read failures and correlation propagation |
| G-09 | Legacy SharePoint REST ingestion code remains in shared adapter | Medium/High | Backend is graph-only; direct REST commit helpers still exist | Remove/quarantine/mark non-production; add tests preventing command bypass |
| G-10 | Provisioning route is not represented in app architecture | Medium | Backend route exists but app does not wrap/call it | Document as admin-only external workflow or build separate admin provisioning UI |
| G-11 | Replay/supersede UX lacks preview parity | Medium/High | Replay mutation fires directly with optional supersede | Add replay impact preview/confirmation before supersede |
| G-12 | CORS/network failures are classified but not preflighted | Medium | `httpStatus 0` maps to network-cors | Add deploy/runbook verification and optional route readiness check |
| G-13 | Package/version authority can drift | Medium | Manifest/version constants duplicated | Centralize version source and add package truth verification |
| G-14 | Read-side data plane remains mixed | Medium | SharePoint REST read side, graph-native command side | Either govern as intentional or plan BFF/read projection migration |
| G-15 | File validation remains advisory | Medium | Extension/MIME checks are not sufficient | Keep client checks, rely on backend parser, add support text and tests |
