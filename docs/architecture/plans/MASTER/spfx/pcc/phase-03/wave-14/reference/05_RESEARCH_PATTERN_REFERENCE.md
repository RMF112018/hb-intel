# Research Pattern Reference

Research completed: `2026-05-04`

This research informs product and implementation patterns only. Do not clone external tools, do not add runtime dependencies from research alone, and do not use Power Automate or commercial construction systems as Wave 14 runtime dependencies.

## Summary of Research Themes

1. Enterprise approval platforms distinguish sequential, parallel-all, first-responder/parallel-any, custom-response, group/role, acknowledgement, expiration, and cancellation patterns.
2. Construction platforms emphasize Ball-In-Court/current-action-owner visibility, workflow templates, reviewer vs approver roles, revision/return loops, status history, and terminal decision states.
3. SharePoint-backed queue architecture must avoid fetch-all queries, must use indexed/filterable columns, and should not rely on default item-level unique permissions for high-volume queue security.
4. SPFx UX must preserve keyboard/screen-reader accessibility, discoverable disabled-action reasons, non-color-only status indicators, focus management, and accessible table/grid sorting.
5. Auditability should be append-only for decision history, with command execution future-gated and read-only projections separated from mutation.
6. HBI/AI must remain advisory/citation/summarization only with explicit human decision control, refusal behavior, and auditability.

## Source Inventory

| Source | URL | Implementation Use |
| --- | --- | --- |
| Power Automate — approval types and multi-approver behavior | https://learn.microsoft.com/power-automate/all-assigned-must-approve | Everyone must approve, first-to-respond, custom responses, all-responses behavior; use as reference only, not runtime dependency. |
| Power Automate — sequential approvals | https://learn.microsoft.com/en-us/power-automate/set-up-sequential-approvals | Pre-approval then next-level approval pattern; use to inform route-mode semantics. |
| Power Automate — group approvals | https://learn.microsoft.com/en-us/power-automate/group-approvals | Group/role approval semantics, first responder and everyone-responds examples. |
| SharePoint Online limits | https://learn.microsoft.com/en-us/office365/servicedescriptions/sharepoint-online-service-description/sharepoint-online-limits | List/library size, unique security scope limits, and inheritance-breaking constraints. |
| SharePoint list view threshold guidance | https://support.microsoft.com/en-us/office/working-with-the-list-view-threshold-limit-for-all-versions-of-sharepoint-4a40bbdc-c5f8-4bbd-b9b6-745daf71c132 | Indexed columns and filtered views for threshold-safe list/query design. |
| SPFx web part accessibility | https://learn.microsoft.com/en-us/sharepoint/dev/design/accessibility | Keyboard navigation, screen-reader behavior, contrast, and non-color-only indicators. |
| SPFx Office UI Fabric / Fluent UI guidance | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/use-fabric-react-components | Microsoft ecosystem component guidance; SPFx historically references Fabric/Fluent UI. |
| Microsoft Graph permissions reference | https://learn.microsoft.com/en-us/graph/permissions-reference | Least-privilege posture, Sites.Selected/ListItems.SelectedOperations, and mutation-risk awareness. |
| Microsoft Graph create SharePoint list item | https://learn.microsoft.com/en-us/graph/api/listitem-create?view=graph-rest-1.0 | POST listItem write operation requires Sites.ReadWrite.All; in Wave 14 this remains prohibited. |
| Procore Submittals | https://support.procore.com/products/online/user-guide/project-level/submittals | Ball-in-court, submitter/approver groups, workflow templates, revisions, closeout, and related items. |
| Procore Workflows tool | https://support.procore.com/products/online/user-guide/company-level/workflows | Custom approval workflow templates and assigned reviewers; use as construction workflow reference. |
| Procore Custom Workflows | https://support.procore.com/products/online/custom-solutions/workflows/get-started-with-custom-workflows | Sequential approval paths, workflow states/actions, and Ball-In-Court responsibility. |
| Autodesk Docs Reviews — review and approve files | https://help.autodesk.com/view/DOCS/ENU/?guid=Reviews_Review_and_Approve | Reviews queue, Next Action By, sorting/filtering by status/workflow/current step. |
| Autodesk Docs — create/edit approval workflows | https://help.autodesk.com/cloudhelp/ENU/Docs-Reviews/files/getting-started-reviews/Reviews_Create_Edit.html | Workflow edits apply only to future reviews; informs policy versioning / no retroactive mutation. |
| Oracle Primavera Unifier — workflows | https://docs.oracle.com/en/industries/construction-engineering/primavera-unifier/26/user-help/aboutworkflows-73172a.html | Workflow records route business process forms, record actions, use terminal statuses. |
| Kahua approvals configuration | https://support.kahua.com/support/solutions/articles/24000060086-approvals-configuration-approvals | Configurable review/signature workflows, approval order, thresholds, and response requirements. |
| ServiceNow Ask for Approval step | https://www.servicenow.com/docs/r/build-workflows/workflow-studio/ask-approval-action-designer.html | Anyone/all/percentage/# approvals, due-date automation, manual approvers; service-management queue reference. |
| ServiceNow approver experience | https://www.servicenow.com/docs/r/order-management/sales-and-order-management/approving-approval-requests.html | Approver is responsible only for assigned steps and can track overall process. |
| WAI-ARIA Authoring Practices | https://www.w3.org/TR/2021/NOTE-wai-aria-practices-1.2-20211129/ | Reference patterns for dialog, grids, alerts, tabs, disclosure, keyboard behavior. |
| MDN aria-sort | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-sort | Sortable table/grid headers should expose current sorted column/order. |
| Testing Library — queries | https://testing-library.com/docs/queries/about | Accessible queries, especially getByRole with accessible names, should be preferred. |
| Playwright accessibility testing | https://playwright.dev/docs/next/accessibility-testing | Axe integration detects many but not all accessibility issues; combine automation with manual assessment. |
| TanStack Table sorting | https://tanstack.com/table/latest/docs/guide/sorting | Headless sorting state and manual server-side sorting support. |
| TanStack Table pagination | https://tanstack.com/table/v8/docs/guide/pagination | Manual server-side pagination and consistency between pagination/filtering/sorting. |
| TanStack Virtual | https://tanstack.dev/virtual | Headless virtualization for massive scrollable elements; adopt only if queue scale requires it. |
| Ajv JSON schema validator | https://ajv.js.org/ | JSON Schema/JTD validator; candidate for JSON command/read-model contract validation if gated. |
| Zod schema documentation | https://zod.dev/api | TypeScript schema validation; repo already has zod dependency in some packages, but Wave 14 should not add dependencies without authorization. |
| XState API | https://xstate.js.org/api | State machine/statechart library; defer unless complexity justifies dependency. |
| Vitest | https://vitest.dev/ | Vite-native test runner used by repo package scripts. |
| Azure Architecture Center — Event Sourcing pattern | https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing | Append-only event store improves auditability but carries complexity; use selectively. |
| NIST SP 800-162 ABAC | https://csrc.nist.gov/pubs/sp/800/162/upd2/final | ABAC evaluates subject/object/operation/environment attributes against policy/rules. |
| NIST AI Risk Management Framework | https://www.nist.gov/itl/ai-risk-management-framework | Govern/map/measure/manage risk framing supports HBI no-authority and human decision controls. |

## Design Implications for Wave 14

### Approval Routing

- Implement route-mode helpers for `single-approver`, `sequential`, `parallel-all`, `parallel-any`, `advisory-review`, `acknowledgement-only`, `escalation-review`, and `admin-verification`.
- Store policy version on each request; do not retroactively mutate in-flight requests when policy templates change.
- Preserve current-action-owner / Ball-In-Court semantics across queues, details, and Priority Actions.

### Queue and UX

- Use server-side paging/filter/sort in read-model contracts.
- Avoid fetch-all queue reads.
- Present disabled action reasons for stale source, missing authority, missing evidence, policy mismatch, superseded request, route not current, and read-only MVP posture.
- Provide queue slices for needs-my-decision, waiting-on-others, escalated, returned/revision-requested, recently decided, admin verification, and stale/superseded.

### SharePoint / Microsoft 365 Posture

- Use SharePoint list/index/storage design as future planning only during this implementation.
- Do not add direct SPFx list mutation or Graph/PnP mutation.
- Do not rely on default item-level unique permissions for queue security.
- Use backend read-model filtering and redaction as the MVP security posture.

### Audit and Security

- Model business audit and security/compliance audit separately.
- Use append-only audit event records with actor, role, action, state transition, reason, evidence, source reference, redaction markers, and unauthorized/writeback flags.
- Treat event sourcing as a selective audit/history pattern, not a requirement to introduce an event-store dependency in MVP.

### Dependency Posture

- Use existing repo dependencies first.
- `@tanstack/react-table` and `@tanstack/react-virtual` are candidates only if explicit dependency approval is later granted.
- `ajv`, `zod`, and `xstate` are candidates only after repo-level package posture is reviewed and approval is granted.
- Testing should prioritize existing Vitest and Testing Library coverage; Playwright/axe should remain optional unless already repo-standard.
