# Research Basis — Phase 14 Approvals / Checkpoints

## Purpose

This file summarizes the subject matter research basis that should inform the documentation update. It is included as reference for local code agents and reviewers.

## Microsoft / SharePoint / SPFx

- SharePoint Framework is the supported client-side extensibility model for SharePoint customizations and web parts.
- SPFx provides page integration and context, but custom UI still requires explicit accessibility behavior.
- SharePoint list-backed queues must respect threshold/index/query constraints.
- SharePoint permission scopes should not be used as the default per-record approval security model at scale.

Reference URLs:

- https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview
- https://learn.microsoft.com/en-us/sharepoint/dev/design/accessibility
- https://support.microsoft.com/en-us/office/working-with-the-list-view-threshold-limit-for-all-versions-of-sharepoint-4a40bbdc-c5f8-4bbd-b9b6-745daf71c132
- https://learn.microsoft.com/en-us/sharepoint/manage-permission-scope

## Approval Workflow Patterns

- Mature approval systems distinguish sequential, parallel-all, parallel-any/first-response, advisory review, acknowledgement, escalation, and admin verification.
- Power Automate is useful for terminology and edge-case reference, but this package blocks a Power Automate MVP runtime dependency.
- Workflow patterns such as sequence, parallel split, synchronization, discriminator, cancellation, milestone, and explicit termination are relevant to Phase 14.

Reference URLs:

- https://learn.microsoft.com/en-us/power-automate/set-up-sequential-approvals
- https://learn.microsoft.com/en-us/power-automate/all-assigned-must-approve
- https://learn.microsoft.com/en-us/power-automate/approvals-known-issues
- https://www.workflowpatterns.com/patterns/control/

## Construction Approval / Review Patterns

- Procore submittal workflows distinguish sequential and parallel approval behavior and current ball-in-court style ownership.
- Autodesk Docs Reviews provides useful patterns for review queue sorting/filtering and reviewer/approver workflows.
- Oracle Primavera Unifier emphasizes workflow history, comments, attachments, progress guides, routing, and project controls.

Reference URLs:

- https://support.procore.com/faq/whats-the-difference-between-sequential-and-parallel-approval-in-the-submittal-workflow
- https://help.autodesk.com/cloudhelp/ENU/Docs-Reviews/files/Reviews_Review_and_Approve.html
- https://www.oracle.com/construction-engineering/primavera-unifier-project-controls-facilities-asset-management/unifier-essentials-datasheet/

## Advanced Work Packaging / Readiness Gates

- Construction readiness gates should verify constraints, evidence, authority, and downstream handoff readiness before work release.
- A gate can be complete, yet low-confidence due to source freshness or evidence concerns.
- Phase 14 should separate completion, confidence, authority, and exposure.

Reference URLs:

- https://www.construction-institute.org/advanced-work-packaging-design-through-workface-execution-version-3-1
- https://www.oracle.com/construction-engineering/primavera-unifier-project-controls-asset-management/advanced-work-packaging-tour/

## UX and Accessibility

- Queue UX should prioritize visible filters, applied filter chips, sorting, result counts, and rapid action clarity.
- Modals/dialogs must trap focus and restore focus.
- Sortable tables should expose sort state to assistive technologies.
- WCAG 2.2 adds useful acceptance considerations such as focus not obscured, dragging alternatives, target size, and redundant-entry reduction.

Reference URLs:

- https://baymard.com/learn/ecommerce-filter-ui
- https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/dialog.html
- https://mulder21c.github.io/aria-practices/examples/table/sortable-table.html
- https://accessibility.psu.edu/guidelines/wcag2update/

## Auditability

- Business audit trail and compliance/security audit trail should be modeled separately.
- Application audit events should be structured, consistent, and useful for investigation.
- Microsoft Purview audit may exist at the tenant/service layer, but Phase 14 needs its own business audit records.

Reference URLs:

- https://learn.microsoft.com/en-us/purview/audit-solutions-overview
- https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
