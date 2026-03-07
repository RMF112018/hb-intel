# Provisioning Roles and Permissions Reference

**Traceability:** D-PH6-16

## Role Definitions

| Role | SharePoint Access | Receives Notifications | Sees Full Checklist |
|---|---|---|---|
| **Admin** | Read-only to all sites | Yes — all projects | Yes — all projects |
| **Leadership** | Read-only to all sites | No | No |
| **Shared Services** | Read + limited write on all sites | No | No |
| **OpEx** | Full read/write on all sites | Yes — start/finish only | No |
| **Pursuit Team** | Full read/write on designated site | Yes — start/finish only | No |
| **Project Team** | Full read/write on designated site | Yes — start/finish only | No |

## Who Sees the Full 7-Step Checklist
Only two groups see the full provisioning checklist:
1. **Admin role users** — for any project, always.
2. **The Estimating Coordinator who submitted the request** — for their own request only (submitter-based, not role-based).

All other users with notification entitlement receive only "Provisioning started" and "Provisioning complete / site is ready" banners.

## Notification Text Strings

**Provisioning started:**
> "Your SharePoint site for [projectName] has started being created."

**Provisioning complete:**
> "Your SharePoint site for [projectName] is ready."

**Provisioning failed:**
> "There was a problem setting up the SharePoint site for [projectName]. Your administrator has been notified."

## OpEx Manager Default Inclusion
The OpEx Manager UPN is always included in `groupMembers` at the time the Estimating Coordinator submits the request. This is enforced in the `NewRequestPage` component and in the `submitProjectSetupRequest` API handler.
