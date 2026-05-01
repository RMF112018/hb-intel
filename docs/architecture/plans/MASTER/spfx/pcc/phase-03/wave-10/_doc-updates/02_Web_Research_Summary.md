# Web Research Summary

Generated: 2026-05-01

## Research Purpose

Research current permit-management, inspection-management, municipal permitting, and field inspection software patterns to improve PCC Wave 10 documentation beyond a spreadsheet clone.

## Sources Reviewed

| Source | Key Finding | Architecture Implication |
|---|---|---|
| Procore — Construction Permitting | Procore recommends maintaining a detailed permit log with submission dates, approval timelines, expiration dates, inspections, and job-card documentation; it also emphasizes early risk identification with the AHJ. URL: https://www.procore.com/library/construction-permitting | PCC should track permit lifecycle, expiration, inspection linkage, evidence/job-card requirements, and readiness risk. |
| Procore — Reinspect Closed Inspections | Reinspection creates a child inspection; line items carry over, and passed line items retain status. URL: https://support.procore.com/products/online/user-guide/project-level/inspections/tutorials/create-reinspection | PCC should model reinspection lineage, parent/child records, failed items, passed item preservation, and reinspection evidence. |
| OpenGov — Building Inspections | OpenGov supports mobile/offline inspection tools, configurable inspection types, checklists, fee rules, end-to-end workflow tracking, real-time statuses, attachments, photos, reports, dashboards, and status stages like Scheduled, Missed, Passed, and Failed. URL: https://opengov.com/products/permitting-and-licensing/building-inspection-software/ | PCC should have configurable templates, status tracking, evidence attachments, dashboard views, and fee-rule placeholders, but no AHJ runtime automation. |
| OpenGov — Building Permit Software | OpenGov describes connected workflows across planning, zoning, inspections, and permitting, with applications, payment, communication, inspections, and workflows in one system. URL: https://opengov.com/products/permitting-and-licensing/building-permit-software/ | PCC should unify permit and inspection tracking in one command center instead of creating disconnected modules. |
| Autodesk Build — Issues | Autodesk issues can reference sheets, forms, RFIs, and other items; categories/types can be configured; permissions and exports are managed. URL: https://help.autodesk.com/cloudhelp/ENU/Build-Issues/files/getting-started-with-issues/Issues_About.html | PCC failed inspection/correction items should link to evidence, related records, and responsible actions. |
| Autodesk Build — Issue Status Settings | Autodesk provides a preset status list and allows project admins to activate/deactivate statuses while preserving core statuses such as Draft, Open, and Closed. URL: https://help.autodesk.com/view/BUILD/ENU/?guid=Issues_Statuses_Settings | PCC should define a standard baseline status model with limited controlled configuration, not free-form status sprawl. |
| City of Miami Building Permit Fee Schedule | Miami fee schedule includes permit fees tied to estimated construction cost, minimum fees, revision/rework fees, application fees, expired/inactive application fees, TCO/CO fees, and reinspection fees. URL: https://www.miami.gov/Permits-Construction/Permitting-Resources/City-of-Miami-Building-Permit-Fee-Schedule | PCC must explicitly track application value, permit fee, revision, fee status, reinspection fee, and fee evidence. |
| GovWell — Inspection Tracking | GovWell surfaces Scheduled Today, Scheduled, Unscheduled, Inspection Requests, Cancelled, and All inspections linked to applications. URL: https://help.govwell.com/en/articles/11739824-how-do-i-keep-track-of-my-inspections | PCC should include scheduled/unscheduled/requested grouping and inspection stage clarity. |
| GovWell — Requesting vs Scheduling an Inspection | GovWell distinguishes inspections that can be requested from inspections booked/scheduled by the jurisdiction. URL: https://help.govwell.com/en/articles/10767511-requesting-vs-scheduling-an-inspection | PCC should separate `Ready to Request`, `Requested`, and `Scheduled` statuses; it must not imply AHJ scheduling automation. |
| CivicPlus — Permit Inspections | CivicPlus permit inspections include inspection number, type, dates, contractor info, status, comments/violation notes, and photos/documents. URL: https://www.civicplus.help/hc/en-us/articles/10606163960727-Permit-Inspections | PCC inspection records should include inspection number, type, date fields, contractor/owner context, comments, status, and document/photo evidence. |
| CivicPlus — Create & Manage Inspections | CivicPlus links inspections to record-level permitting and calendar scheduling; it notes status should not change from open until complete. URL: https://www.civicplus.help/hc/en-us/articles/9461417257495-Create-Manage-Inspections | PCC should link inspections to permit records and enforce status transition rules. |
| SafetyCulture — Actions | SafetyCulture actions can be created from inspection questions, include details/comments/media, and preserve timestamps/collaboration context. URL: https://help.safetyculture.com/en-US/003186/ | PCC failed inspection and corrective action workflows should generate linked actions/priority items with timestamps and evidence. |
| SafetyCulture — Issues | SafetyCulture issues support category-specific fields, location/photos/videos/files, linked inspections/actions, visibility controls, activity logs, and immutable comments/files. URL: https://help.safetyculture.com/en-US/000103/ | PCC should use evidence, activity/audit history, controlled visibility, and linked corrective-action records. |

## Research-Based Product Conclusions

1. A unified permit + inspection control surface will produce a better user experience than separate logs.
2. The first screen should be exception-first, not spreadsheet-first.
3. Permit, inspection, failed inspection, reinspection, fee, evidence, and AHJ launcher concepts should be first-class architecture objects.
4. Reinspection must preserve parent/child lineage and failed/passed item context.
5. Fees must be tracked as risk/cost exposure, even if accounting integration is deferred.
6. Status models should be standardized but configurable under governance.
7. Evidence-backed closeout should be required by default.
8. AHJ portals should remain launcher-only in this wave.
