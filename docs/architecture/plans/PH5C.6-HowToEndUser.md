# Phase 5 Development Plan – Authentication & Shell Foundation Task 5C.6: End-User Access Request How-To Guide

**Version:** 2.0 (End-user how-to: requesting elevated access)
**Purpose:** This document defines the implementation steps to create a comprehensive how-to guide for end users requesting access to features they don't currently have permission for, using clear language and visual descriptions.
**Audience:** Implementation agent(s), technical writers, UX designers
**Implementation Objective:** Deliver a 1–2 page end-user-focused guide that explains how to identify missing permissions, navigate to the access request interface, submit requests, and understand the approval workflow.

---

## 5.C.6 End-User Access Request How-To Guide

1. **Create `docs/how-to/user/request-elevated-access.md`** (D-PH5C-07)
   - Write for non-technical audience: clear, friendly, visual
   - Include screenshots or visual descriptions of UI elements
   - Use simple terminology (avoid technical jargon)
   - Structured as step-by-step workflow
   - Include expected outcomes and what to do next

2. **Structure guide** (D-PH5C-07)
   - Introduction: What is access request and why you might need it
   - When to request access: scenarios where users need elevated permissions
   - Step 1: Identify that you need elevated access (feature unavailable, button disabled)
   - Step 2: Navigate to access request interface
   - Step 3: Select the feature or module you need access to
   - Step 4: Provide business justification (optional or required)
   - Step 5: Submit request
   - Step 6: Receive confirmation
   - Step 7: Wait for administrator approval
   - Step 8: Receive approval/denial notification
   - What happens next: Testing your new permissions
   - Troubleshooting: Common questions

3. **Include visual descriptions** (D-PH5C-07)
   - Where to find "Request Access" button or link
   - What to expect when navigating to request form
   - Confirmation screen appearance
   - Email notification format (if applicable)

4. **Document timeline and approval process** (D-PH5C-07)
   - Typical approval time (e.g., "usually 1–2 business days")
   - Who approves requests (e.g., "Your department manager or system administrator")
   - What to do if request is denied
   - How to escalate if urgent

5. **Include FAQ section** (D-PH5C-07)
   - "How long does approval take?" — typical timeline
   - "Who decides to approve or deny my request?" — approval chain
   - "Can I request multiple permissions at once?" — yes, all features in one request
   - "What if my request is denied?" — appeal process or contact administrator
   - "How do I know my request was submitted?" — confirmation email/screen

---

## Production-Ready Code: `docs/how-to/user/request-elevated-access.md`

```markdown
# How to Request Elevated Access to Features

## What is Elevated Access?

Some features in HB Intel are restricted to certain roles or departments. If you need to use a feature that isn't available to you, you can submit a request to your administrator for access.

Examples of features that might require elevated access:
- Viewing financial reports (Accounting module)
- Creating project estimates (Estimating module)
- Approving invoices (Finance approval workflow)
- Managing user accounts (System administration)

---

## When Do You Need to Request Access?

You will know you need elevated access when:

1. **You see a "Access Denied" message** when trying to use a feature
2. **A button is grayed out or disabled** when you want to use it
3. **You see a message like "Contact your administrator to request access"**

---

## Step-by-Step: Requesting Access

### Step 1: Identify the Feature You Need

When you encounter a feature you can't access, note:
- The feature name (e.g., "Invoice Management", "Project Estimates")
- What you need to do with it (view, edit, approve, etc.)
- Why you need access (your job role, project assignment, etc.)

Example:
> You're assigned to the "Q1 Marketing Project" but can't view project tasks. You need to request "Project Hub" access.

### Step 2: Navigate to the Access Request Interface

1. Look for the "Access Denied" message or disabled feature
2. Click the **"Request Access"** button or link
3. This will open the Access Request form

**What you'll see:**
- A form titled "Request Feature Access"
- Your name and email (pre-filled)
- A dropdown to select the feature you need
- An optional text field for your request reason

### Step 3: Select the Feature or Module

1. Click the **"Select Feature"** dropdown
2. Choose the feature you need access to from the list
3. You'll see a brief description of what the feature includes

Common features:
- **Accounting - Invoices**: View, create, and manage invoices
- **Accounting - Reports**: Access financial reports and dashboards
- **Estimating - Quotes**: Create and manage project quotes and estimates
- **Projects - Hub**: View and manage assigned projects
- **Projects - Tracking**: Update task progress and timelines
- **Admin Panel**: System administration and user management

### Step 4: Provide Your Business Justification (Optional)

1. Click in the **"Why do you need this access?"** text field
2. Briefly explain:
   - Your role or project assignment
   - What you'll use the feature for
   - Any relevant deadlines

Example text:
> "I'm the new lead for the Q1 Marketing Project and need to track project tasks and timeline with the team."

**Note:** While this field is optional, providing context helps your administrator approve requests faster.

### Step 5: Submit Your Request

1. Review that you've selected the correct feature
2. Click the blue **"Submit Request"** button
3. Your request is now submitted

---

## Step 6: Confirmation

After submitting, you'll see:

**On-screen confirmation:**
> "Your request has been submitted successfully."
>
> "Request ID: REQ-2024-0847"
>
> "You'll receive a response within 1–2 business days."

**Email confirmation:**
You'll receive an email at your registered email address confirming:
- Your request ID
- The feature you requested
- Estimated response time
- A link to check your request status

---

## Step 7: Wait for Administrator Approval

Your request is now in your department's approval queue.

**Typical timeline:**
- **24 hours**: Most requests reviewed
- **2 business days**: Standard approval window
- **5 business days**: Maximum review time

Your administrator will review your request and decide to:
1. **Approve** — You'll receive access immediately
2. **Deny** — You'll receive explanation and next steps
3. **Ask for more information** — They may ask clarifying questions

---

## Step 8: Receive Approval or Denial Notification

### If Your Request is Approved ✓

You'll receive an email with:
- Subject: "Your Access Request Has Been Approved"
- The feature name
- Instructions to access the feature (or just a note that it's now available)

**Next step:** Go to the feature and you should now be able to use it. If it's still disabled after 5 minutes, try:
1. Refreshing the page (F5 or Cmd+R)
2. Logging out and logging back in
3. Clearing your browser cache
4. Contacting your administrator if it's still not working

### If Your Request is Denied ✗

You'll receive an email with:
- Subject: "Your Access Request Has Been Reviewed"
- Reason for denial (e.g., "requires department manager approval", "no business need identified")
- Next steps or contact information

**If denied:**
1. **Understand the reason** — Read the explanation carefully
2. **Follow next steps** — The email will say what to do next (e.g., "ask your manager to approve", "contact finance@company.com")
3. **Resubmit if appropriate** — After addressing the reason, you can submit another request

---

## Testing Your New Permissions

Once your request is approved:

1. **Navigate to the feature** you requested access for
2. **The access denied message should disappear**
3. **Buttons should now be enabled** (no longer grayed out)
4. **You can now use the feature** normally

If you're still seeing "Access Denied" after approval:
- The system may not have updated yet (wait 5–10 minutes)
- Try logging out and logging back in
- Try a different browser
- Contact your administrator

---

## Frequently Asked Questions

### "How long does approval usually take?"

Most requests are reviewed within 1 business day. Maximum time is 5 business days. If your request is urgent, you can ask your manager to escalate it.

### "Who decides whether to approve or deny my request?"

Your request goes to:
1. Your direct manager (for most features)
2. Department manager (for financial or admin features)
3. System administrator (for admin panel access)

### "Can I request multiple features at once?"

Yes. You can use the form to request multiple features in a single request. Just resubmit the form for each feature you need, or ask your administrator if they can handle multiple requests at once.

### "What if my request is denied?"

The email will explain why. Common reasons:
- **Business need not clear**: Provide more detail in a new request
- **Requires manager approval**: Ask your manager to approve first
- **Security concern**: Contact your administrator to discuss

You can always submit a new request with additional information.

### "How do I know my request was actually submitted?"

You should receive:
1. An on-screen confirmation message
2. An email confirmation to your company email address
3. A request ID (e.g., REQ-2024-0847) to track your request

If you don't receive the email within 5 minutes, contact your IT department.

### "What if I need access urgently?"

1. Submit your request with a clear explanation of urgency
2. Contact your direct manager to escalate
3. Ask your manager to reach out to the approver directly
4. In emergencies, contact your IT department or system administrator

### "Can I see the status of my request after submitting it?"

Yes. You can:
1. Check the confirmation email for a status link
2. Visit the Access Requests section (if available in your user menu)
3. Contact your administrator for status

---

## Troubleshooting

### I don't see the "Request Access" button

**Solution:**
1. Make sure you're logged in
2. Refresh the page
3. Try a different browser
4. Contact your IT support

### I submitted a request but didn't receive confirmation

**Solution:**
1. Check your spam/junk email folder
2. Wait 5–10 minutes (the system might still be processing)
3. Contact your IT department — they can confirm your submission

### My request was approved but I still can't see the feature

**Solution:**
1. Refresh the page (F5 or Cmd+R)
2. Log out and log back in
3. Clear your browser cache and cookies
4. Try a different browser
5. If still not working, contact your IT department

### I think my request was lost

**Solution:**
1. Check your email for confirmation (including spam folder)
2. Ask your manager to check if they received the approval request
3. Contact your IT department or administrator with your email and the feature name

---

## What Happens Next?

Once you have access to your new features:

1. **Explore the feature** and get familiar with how it works
2. **Ask your manager for training** if needed
3. **Report any problems** to your IT department
4. **If you need more access later**, you can submit another request

---

## Need More Help?

- **For access requests**: Contact your department manager or IT department
- **For feature questions**: Contact your team lead or department manager
- **For technical issues**: Contact IT support
- **For urgent needs**: Escalate to your manager or IT director

---

**End of End-User How-To Guide**
```

---

## Recommended Implementation Sequence

1. PH5C.1 – Vitest Fix
2. PH5C.2 – MockAuthAdapter Upgrade
3. PH5C.3 – PersonaRegistry
4. PH5C.4 – DevToolbar
5. PH5C.5 – Developer How-To Guide
6. PH5C.6 – End-User How-To Guide (this task)
7. PH5C.7 – Administrator How-To Guide
8. PH5C.8 – Alignment Markers
9. PH5C.9 – ADR Updates
10. PH5C.10 – Final Verification

---

## Final Phase 5C Definition of Done

Phase 5C is complete when:
1. All 10 granular task files (PH5C.1 through PH5C.10) are executed in sequence.
2. Phase 5 audit coverage reaches **100%** across all seven categories (security, code quality, documentation, testability, maintainability, completeness, architecture alignment).
3. `pnpm turbo run build --filter=@hbc/auth --filter=@hbc/shell` succeeds with zero warnings.
4. `pnpm turbo run test --filter=@hbc/auth --filter=@hbc/shell` executes and reports ≥95% coverage.
5. All documentation files exist in correct `docs/` subfolders and follow Diátaxis structure (how-to, reference, explanation).
6. All alignment markers are in place; `pnpm lint` detects no violations.
7. Production bundle contains zero byte references to dev-mode code (verified via string search).
8. Final sign-off table is completed with all roles approved.

---

## 5.C.6 Success Criteria Checklist (Task 5C.6)

- [ ] 5.C.6.1 `docs/how-to/user/request-elevated-access.md` created
- [ ] 5.C.6.2 Guide uses non-technical, end-user-friendly language
- [ ] 5.C.6.3 Guide includes 8+ numbered steps covering full request workflow
- [ ] 5.C.6.4 Guide explains what happens at each step (on-screen feedback, emails)
- [ ] 5.C.6.5 Guide covers approval timeline and typical response times
- [ ] 5.C.6.6 Guide includes FAQ section with 6+ common questions
- [ ] 5.C.6.7 Guide includes troubleshooting section for common issues
- [ ] 5.C.6.8 Document follows Diátaxis how-to format and is goal-oriented
- [ ] 5.C.6.9 File includes visual descriptions (or references screenshots)
- [ ] 5.C.6.10 Document is accessible and readable for diverse users

---

## Phase 5.C.6 Progress Notes

- 5.C.6.1 [PENDING] — Guide creation with workflow steps
- 5.C.6.2 [PENDING] — FAQ and troubleshooting sections
- 5.C.6.3 [PENDING] — Visual descriptions and clarity review

### Verification Evidence

- `docs/how-to/user/request-elevated-access.md` exists and is complete - [PENDING]
- Guide includes FAQ section (6+ questions) - [PENDING]
- Guide uses non-technical language (readable for end users) - [PENDING]
- File follows Diátaxis how-to structure - [PENDING]

---

**End of Task PH5C.6**

<!-- IMPLEMENTATION PROGRESS & NOTES
Task PH5C.6 created: 2026-03-07
End-user access request how-to guide specification complete.
Next: PH5C.7 (Administrator How-To Guide)
-->
