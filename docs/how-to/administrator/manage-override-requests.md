# How to Manage Access Override Requests

## Overview

As an administrator, you are responsible for reviewing and approving user requests for elevated access to HB Intel features. This guide covers the complete workflow for managing access requests, from initial review through expiration and audit tracking.

---

## Access Control Hierarchy

**Request Flow:**
1. User submits access request → Dashboard shows as "Pending"
2. Administrator reviews request → Approves or Denies
3. If approved → User gains access immediately, request shows as "Active"
4. Access active until expiration date → Can be renewed or revoked
5. Audit log tracks all changes for compliance

**Your Role:**
- Review and approve/deny requests
- Set appropriate expiration dates (for temporary access)
- Manage active overrides and handle expiration
- Maintain audit trail for compliance
- Escalate security concerns

---

## Step 1: Access the Access Request Dashboard

1. Log in to HB Intel with Administrator role
2. Navigate to **Admin Panel** → **Access Control**
3. You'll see tabs: **Pending** / **Active** / **Denied** / **Expired**

**Dashboard layout:**
- **Pending Requests** (top of page): New requests awaiting review
- **Active Overrides**: Currently granted access
- **Request History**: All past requests and decisions
- **Audit Logs**: Complete access change history

---

## Step 2: Review Pending Requests

Requests are displayed in a list with:
- **User Name**: Who is requesting access
- **Department**: User's department
- **Feature**: What they're requesting access to
- **Submitted Date**: When request was submitted
- **Justification**: Their reason for needing access
- **Manager Approval**: Whether their manager has approved

### Review each request for:

1. **User Verification**
   - Confirm user exists in system
   - Verify their current role/department
   - Check their employment status (active employee?)

2. **Feature Appropriateness**
   - Is the requested feature appropriate for their role?
   - Do they actually need it for their job?
   - Are there restrictions on who can have this access?

3. **Business Need**
   - Is the justification clear and legitimate?
   - Does the request align with their project assignment?
   - Is there an actual business purpose?

4. **Manager Approval**
   - Has their direct manager approved the request?
   - For admin/security features, does department manager approve?
   - For cross-department features, any conflicts?

5. **Security Considerations**
   - Is the access level appropriate for their role?
   - Could this create security risks?
   - Should access be temporary or permanent?

---

## Step 3: Evaluate Request Legitimacy

### Approval Criteria (Approve if all are true)

✓ User is an active employee
✓ Feature matches user's current role
✓ Manager has approved (or pre-approved)
✓ Business need is clearly stated
✓ No security concerns
✓ Access scope is appropriate

### Denial Reasons (Deny if any apply)

✗ User is not active or no longer in role
✗ No legitimate business need stated
✗ Manager has not approved
✗ Access scope too broad for user's role
✗ Feature restricted to specific departments
✗ Security or compliance concern

**Example:**
> User: Sarah Chen (Accounting)
> Request: Approve invoices (Accounting module)
> Justification: "New invoice approver for Q1 projects"
> Manager Approval: ✓ Yes
> Decision: **APPROVE** — Clear business need, manager approved

**Example:**
> User: John Smith (Marketing)
> Request: Admin Panel access
> Justification: "Need to manage users" (no clear reason)
> Manager Approval: ✗ No
> Decision: **DENY** — Not appropriate for Marketing role, no manager approval

---

## Step 4: Approve Request and Set Expiration

### To Approve a Request:

1. Click the **"Review"** button on the pending request
2. Read the full request details
3. Verify manager approval (usually pre-approved)
4. Click **"Approve"** button
5. Select expiration date/time:
   - **No Expiration** — Permanent access (recommended only for role changes)
   - **30 Days** — Standard temporary access
   - **90 Days** — Extended project access
   - **Custom Date** — Specific date/time
6. Optional: Add approval notes
7. Click **"Confirm Approval"**

**Expiration Date Guidelines:**

| Duration | Use Case |
|----------|----------|
| No expiration | Permanent role change, promotion, transferred to department |
| 30 days | Temporary project assignment, training period |
| 90 days | Extended project, coverage period, trial access |
| 6 months | Long-term contract/temporary staff |
| Custom | Specific business need or deadline |

**Best Practice:** Always set an expiration for temporary access. Users can request renewal if needed.

**Approval Confirmation:**
You'll see: "Access approved. Sarah Chen now has access to Approve Invoices until [DATE]"

User will receive email: "Your access request has been approved. You now have access to [Feature] until [DATE]."

---

## Step 5: Deny Request with Reason Documentation

### To Deny a Request:

1. Click **"Review"** button on pending request
2. Read full request details
3. Click **"Deny"** button
4. Select reason (or write custom reason):
   - "Business need not clear"
   - "Manager approval required first"
   - "Not appropriate for user's role"
   - "Feature restricted to specific department"
   - "Security concern"
   - "User employment status issue"
   - "Custom reason: [explain]"
5. Add optional notes to help user understand next steps
6. Example note: "Please have your manager submit this request on your behalf."
7. Click **"Confirm Denial"**

**Denial Confirmation:**
You'll see: "Request denied. Denial reason documented."

User will receive email:
> "Your access request has been reviewed and denied."
> "Reason: Business need not clear"
> "Next steps: Please provide more detail about how you'll use this feature and resubmit."

**Note:** Denials are logged and auditable. Be clear so users understand and don't repeatedly request without addressing the issue.

---

## Step 6: Monitor Active Overrides

The **"Active Overrides"** tab shows all currently granted access.

**For each active override, you can see:**
- User name and department
- Feature they have access to
- Date access was granted
- Expiration date (or "No expiration")
- Days remaining until expiration
- Status: "Active" / "Expiring Soon" / "Needs Review"

### Actions for Active Overrides:

1. **Revoke Access** — Immediately remove access (if user left, role changed, security issue)
2. **Renew Access** — Extend expiration date if user requests renewal
3. **View Details** — See the original approval, notes, and audit history
4. **View Audit Trail** — See when access was used

### Best Practices:

- **Weekly review**: Check for overrides expiring soon
- **Monthly review**: Review all active overrides for continued need
- **Quarterly review**: Generate report of all active access
- **On employment change**: Revoke access when user leaves or changes roles
- **After security incident**: Revoke unnecessary access immediately

---

## Step 7: Handle Expiring and Expired Overrides

### Expiring Soon (7 days before expiration)

The system will:
1. Highlight these in yellow/warning color
2. Send you a reminder email
3. Send user a notification ("Your access expires in 7 days")

**Your options:**
- **Renew**: User wants to keep access, extend expiration date
- **Revoke**: Access should end, no renewal
- **Document**: Add note if renewal is pending

### Expired (after expiration date)

Access automatically ends:
1. User loses feature access
2. Request moves to "Expired" tab
3. System logs the expiration
4. User receives notification: "Your access has expired"

**User can:**
- Submit a new request for renewed access
- Contact manager to resubmit

**You should:**
- Archive expired requests periodically
- Review audit logs for access history
- Document any unusual access patterns

---

## Step 8: Audit Access Changes

The **"Audit Logs"** tab tracks every access change for compliance.

### Audit Log Shows:

- **Date/Time**: When change occurred
- **User**: Who the access change was for
- **Action**: Approved / Denied / Revoked / Expired / Renewed
- **Feature**: What feature was affected
- **Administrator**: Who made the decision
- **Reason**: Why the decision was made
- **Details**: Additional notes

### Compliance Tasks:

1. **Generate Monthly Report**
   - Filter by date range: "Last 30 days"
   - Export CSV for records retention
   - File with compliance documentation

2. **Search Specific Users**
   - Filter by user name
   - See all access changes for that user
   - Useful for investigating access issues

3. **Search Specific Features**
   - Filter by feature
   - See who has access and approval dates
   - Useful for feature security audits

4. **Detect Unusual Patterns**
   - Look for users with many temporary accesses
   - Watch for repeated denials then reapprovals
   - Check for same-day approval of sensitive features

**Example Report:**
