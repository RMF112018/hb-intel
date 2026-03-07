# How to Create the Required SharePoint Lists

**Traceability:** D-PH6-16

Phase 6 requires two SharePoint lists to be manually created in the tenant before provisioning can run.

## List 1: Projects (root site collection)

Create this list at the root of the HB Intel hub site collection.

1. Navigate to `https://hbconstruction.sharepoint.com/sites/hb-intel`.
2. Click the gear icon → **Add an app** → **Custom List**.
3. Name the list **Projects**.
4. After creation, go to **List Settings** → **Create Column** and add the following columns:

| Column Name | Type | Required | Notes |
|---|---|---|---|
| ProjectId | Single line of text | Yes | UUID v4, no spaces |
| ProjectNumber | Single line of text | No | Format: ##-###-## |
| ProjectName | Single line of text | Yes | |
| ProjectLocation | Single line of text | No | |
| ProjectType | Single line of text | No | |
| ProjectStage | Choice | Yes | Options: Pursuit, Active |
| RequestState | Single line of text | Yes | See state machine |
| SubmittedBy | Single line of text | Yes | UPN |
| SubmittedAt | Date and Time | Yes | ISO format |
| GroupMembers | Multiple lines of text | No | JSON array of UPNs |
| ProjectNumber | Single line of text | No | ##-###-## |
| ClarificationNote | Multiple lines of text | No | |
| CompletedBy | Single line of text | No | UPN |
| CompletedAt | Date and Time | No | |
| ProvisioningStatus | Single line of text | No | |
| SiteUrl | Single line of text | No | |

## List 2: ProvisioningAuditLog (root site collection)

1. Navigate to `https://hbconstruction.sharepoint.com/sites/hb-intel`.
2. Click the gear icon → **Add an app** → **Custom List**.
3. Name the list **ProvisioningAuditLog**.
4. Add the following columns:

| Column Name | Type | Required |
|---|---|---|
| ProjectId | Single line of text | Yes |
| ProjectNumber | Single line of text | No |
| ProjectName | Single line of text | Yes |
| CorrelationId | Single line of text | Yes |
| Event | Choice | Yes | Options: Started, Completed, Failed |
| TriggeredBy | Single line of text | Yes |
| SubmittedBy | Single line of text | Yes |
| Timestamp | Date and Time | Yes |
| SiteUrl | Single line of text | No |
| ErrorSummary | Multiple lines of text | No |

## Permissions
Both lists should inherit permissions from the site collection. The Managed Identity used by the Function App must have **Full Control** on the site collection (granted via Microsoft Graph `Sites.FullControl.All` — see PH6.2).
