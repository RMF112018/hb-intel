# HB Kudos — Permissions Guide

This guide explains how access to the HB Kudos Approval Companion is controlled and how to update it when personnel changes are needed.

## How permissions work

Access to the HB Kudos Approval Companion app is controlled by membership in two Microsoft Entra ID security groups. The app checks group membership automatically when a user opens the companion — no page or webpart configuration is involved.

**Editing webpart settings or page properties does not change who has access.** Only group membership changes affect permissions.

## The two permission groups

### HB Kudos Admins

Members of this group have full governance authority over HB Kudos. Admins can:

- Approve, reject, or request revision on submissions
- Flag items for admin review and clear admin review flags
- Pin, unpin, feature, and unfeature published kudos
- Schedule future publishing
- Remove published kudos from public view
- Restore previously removed kudos
- Edit published kudos content
- Claim and reassign queue items
- Bulk approve submissions

### HB Kudos Reviewers

Members of this group can perform day-to-day review and approval actions. Reviewers can:

- Approve, reject, or request revision on submissions
- Flag items for admin review and clear admin review flags
- Claim and reassign queue items
- Bulk approve submissions

Reviewers **cannot** pin, feature, schedule, remove, restore, or edit published kudos — those actions are reserved for admins.

### Everyone else

Users who are not in either group see the standard employee HB Kudos experience on the homepage. They can submit kudos and celebrate published entries, but they cannot access the governance companion.

## How to update group membership

When someone joins or leaves a role that requires admin or reviewer access, an authorized tenant administrator should update group membership in Microsoft Entra ID:

1. Sign in to the [Microsoft Entra admin center](https://entra.microsoft.com)
2. Go to **Identity** → **Groups** → **All groups**
3. Search for and open **HB Kudos Admins** or **HB Kudos Reviewers**
4. Select **Members**
5. Add or remove users as needed
6. Changes take effect after a brief propagation delay — the user should refresh the SharePoint page to pick up updated permissions

## Important notes

- **Do not** attempt to manage companion permissions through the webpart property pane or page settings — those controls do not affect access.
- Both groups are Entra ID security groups, not SharePoint groups. Membership is managed in the Entra admin center, not in SharePoint site settings.
- If a user is a member of both groups, they receive admin-level access (the higher privilege applies).
- If group membership cannot be resolved (due to a network error or misconfiguration), the app fails closed — the user is treated as a standard viewer with no governance access.
