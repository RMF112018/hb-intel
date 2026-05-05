# 10 — Research Pattern Reference

Use these public sources as pattern inputs only. Do not clone external tools or imply that PCC is becoming those systems.

## Microsoft / SharePoint / SPFx

| Source | URL | Implementation Relevance |
| --- | --- | --- |
| SharePoint list view threshold and indexed columns | https://support.microsoft.com/en-us/office/working-with-the-list-view-threshold-limit-for-all-versions-of-sharepoint-4a40bbdc-c5f8-4bbd-b9b6-745daf71c132 | Supports indexed fields, filtered queries, avoiding broad scans. |
| SPFx client-side web parts overview | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/overview-client-side-web-parts | Supports browser/client-side constraints and read-model consumption from SPFx. |
| Microsoft Graph throttling guidance | https://learn.microsoft.com/en-us/graph/throttling | Supports avoiding polling/scans and handling degraded/throttled states. |
| Microsoft 365 admin roles / least privilege | https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/about-admin-roles | Supports least-privilege role posture and limited admin authority. |

## Secrets / Configuration

| Source | URL | Implementation Relevance |
| --- | --- | --- |
| Azure Key Vault references for App Service / Functions | https://learn.microsoft.com/en-us/azure/app-service/app-service-key-vault-references | Supports secret-reference-only storage and no raw secret exposure. |
| Azure App Configuration feature flags | https://learn.microsoft.com/en-us/azure/azure-app-configuration/manage-feature-flags | Supports feature-flag management, labels, history, and centralized config concepts. |

## Approval / Change Governance

| Source | URL | Implementation Relevance |
| --- | --- | --- |
| LaunchDarkly requesting approvals | https://launchdarkly.com/docs/home/releases/approval-requests | Supports request/reviewer/comment/pending-change patterns. |
| LaunchDarkly approval settings | https://launchdarkly.com/docs/home/releases/approval-config | Supports environment-specific approval requirements, self-approval settings, and approval counts. |
| LaunchDarkly reviewing approvals | https://launchdarkly.com/docs/home/releases/approval-reviews | Supports approval dashboard, pending changes, and review-detail patterns. |

## Construction Product Settings Patterns

| Source | URL | Implementation Relevance |
| --- | --- | --- |
| Procore Configure Settings: Project Admin | https://support.procore.com/products/online/user-guide/project-level/admin/tutorials/configure-settings-project-admin | Shows project settings, tool configuration, permissions, and change history patterns. |
| Autodesk Construction Cloud Project Administration | https://help.autodesk.com/view/DOCS/ENU/?guid=Project_Administration | Supports project administrator role, project settings, member/product access, and permissions patterns. |
| Autodesk Manage Members | https://help.autodesk.com/cloudhelp/ENU/Docs-Members/files/Manage_Members_Product.html | Supports member status, access level, product access, and permission visibility patterns. |

## Accessibility

| Source | URL | Implementation Relevance |
| --- | --- | --- |
| WAI-ARIA APG Modal Dialog Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ | Supports drawer/dialog focus trap, Escape close, return focus, and `aria-modal` guidance. |
| WAI-ARIA Authoring Practices Guide | https://www.w3.org/WAI/ARIA/apg/ | Supports accessible widgets, keyboard support, and semantic patterns. |

## Dependency / Testing Pattern Notes

- Prefer existing repo dependencies and PCC patterns before adding libraries.
- `@hbc/models` and backend already include `zod`; use only if current package conventions support it.
- SPFx PCC app currently has React, `@hbc/models`, `@hbc/ui-kit`, Testing Library, Vite, and Vitest support.
- TanStack Table / Virtual, XState, AJV, or Playwright should remain optional future enhancements unless explicitly approved.
