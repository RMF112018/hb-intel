# 06 — SPFx UX and Accessibility Contract

## Navigation Placement

Site Health should appear in the PCC navigation as `Site Health` with surface ID `site-health`. It may also surface aggregate cards on Project Home.

## Required Screens

1. Site Health Home
2. Health Overview Dashboard
3. Health Findings Queue
4. Health Finding Detail Drawer
5. Template Compliance View
6. Provisioning Status View
7. List and Library Compliance View
8. Permission and Access Posture View
9. Settings Health Integration View
10. External Source Health View
11. Admin Verification Queue
12. Repair Request Drawer
13. Evidence and Traceability Panel
14. Audit and Health History
15. HBI Health Explanation Panel
16. Mobile Responsive Health View

## Component Inventory

| Component | Purpose |
|---|---|
| `PccSiteHealthSurface` | Surface shell and route-level state |
| `SiteHealthOverviewCards` | Overall health, worst severity, stale sources, repair-readiness summary |
| `SiteHealthCategoryNav` | Category filtering and counts |
| `SiteHealthFindingsTable` | Queue/table view with sorting, filters, pagination |
| `SiteHealthFindingDrawer` | Detail drawer for selected finding |
| `SiteHealthEvidencePanel` | Evidence list and traceability details |
| `SiteHealthDriftDiffPanel` | Desired-state vs observed-state diff |
| `SiteHealthPermissionPosturePanel` | Permission posture with redaction |
| `SiteHealthSettingsIntegrationPanel` | Wave 16 settings health references |
| `SiteHealthExternalSourcePanel` | Wave 15 external source health references |
| `SiteHealthAdminVerificationQueue` | Review queue for authorized personas |
| `SiteHealthRepairRequestDrawer` | Future-gated request drawer with disabled reasons |
| `SiteHealthAuditHistoryTable` | Business audit/history display |
| `SiteHealthHbiPanel` | Grounded explanation and refusal copy |

## Findings Queue Columns

- Severity
- Status
- Category
- Finding
- Affected object
- Owner persona
- Detected
- Last observed
- Source status
- Action mode
- Evidence count

## Default Filters

- Project: current project
- Status: unresolved
- Severity: warning, high, critical, blocked
- Source status: all
- Category: all
- Date range: last 90 days

## Accessibility Rules

- Use native HTML tables for static tabular data where possible.
- Use grid behavior only when the table becomes a composite interactive widget.
- Status chips must include text labels and not rely on color alone.
- Drawer/dialog interactions must trap focus, support `Escape`, and restore focus to the triggering control.
- Loading and stale-source messages use polite live-region semantics.
- Critical blocking alerts use alert semantics only when immediate user attention is required.
- Disabled actions must include visible disabled reasons.
- Keyboard users must be able to open, review, and close drawers without pointer input.
- Mobile views must preserve all required information through stacked cards and detail drawers.

## Empty, Loading, Error, and Degraded States

| State | Required Behavior |
|---|---|
| Empty healthy | Show all checks healthy and no findings |
| Empty no access | Show authorized summary only; no raw detail |
| Loading | Preserve layout and announce loading politely |
| Backend unavailable | Show degraded banner, empty arrays, disabled actions |
| Source unavailable | Show source-specific stale/degraded warning |
| Forbidden | Show redacted summary and escalation route where allowed |
| Fixture only | Label fixture mode and preserve demo behavior |
