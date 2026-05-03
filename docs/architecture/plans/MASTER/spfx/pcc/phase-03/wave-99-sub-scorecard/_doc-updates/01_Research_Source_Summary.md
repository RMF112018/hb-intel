# 01 — Research Source Summary

Generated: 2026-05-03

## Research Purpose

The Subcontractor Scorecard architecture uses external sources only to strengthen target design patterns. These sources do not override repo truth, PCC system-of-record doctrine, or Hedrick Brothers governance decisions.

### SRC-PROCORE-VPR — Procore Vendor Performance Report

- URL: https://support.procore.com/products/online/user-guide/company-level/analytics/reports-subpage/vendor-performance-report
- Architecture use: Confirms vendor/subcontractor performance analytics can leverage Commitments, Submittals, Punch List, and RFIs as source context while preserving Procore ownership.

### SRC-PROCORE-PREQ-REVIEW — Procore Review a Submitted Prequalification Form

- URL: https://support.procore.com/products/online/user-guide/company-level/prequalifications/tutorials/review-a-submitted-prequalification-form
- Architecture use: Supports reviewer/comment/status patterns and financial-category visibility separation.

### SRC-PROCORE-PREQ-PERMS — Procore Prequalifications Permissions

- URL: https://support.procore.com/products/online/user-guide/company-level/prequalifications/permissions
- Architecture use: Supports explicit permission/action matrix for sensitive subcontractor risk data.

### SRC-AUTODESK-PREQ — Autodesk Subcontractor Qualification Best Practices

- URL: https://www.autodesk.com/blogs/construction/subcontractor-prequalification-best-practices/
- Architecture use: Supports project-based, comprehensive, practical, yes-but risk-control posture instead of absolute blacklist outputs.

### SRC-MS-GRAPH-LISTITEM — Microsoft Graph listItem resource

- URL: https://learn.microsoft.com/en-us/graph/api/resources/listitem?view=graph-rest-1.0
- Architecture use: Supports SharePoint list-backed target record planning, fieldValueSet mapping, list item versions, and delta posture.

### SRC-MS-SP-APPROVALS — Require approval of items in a list or library

- URL: https://support.microsoft.com/en-us/office/require-approval-of-items-in-a-list-or-library-cd0761c4-8c3f-4ea2-9435-13c28aa23d08
- Architecture use: Supports draft visibility, approval status, and versioning concepts for sensitive scorecard publication rules.

### SRC-OWASP-ASVS — OWASP Application Security Verification Standard

- URL: https://devguide.owasp.org/en/11-security-gap-analysis/01-guides/02-asvs/
- Architecture use: Supports explicit verification requirements for access control, validation, logging, API security, and sensitive data protection.

### SRC-WCAG22 — WCAG 2.2 New Guidelines

- URL: https://accessibility.psu.edu/guidelines/wcag2update/
- Architecture use: Supports keyboard/focus/target-size/redundant-entry acceptance requirements for scorecard forms and detail drawers.


## Design Principles Derived From Research

1. Vendor performance should be evidence-backed and contextual, not a bare opinion score.
2. Procore-native objects should be treated as source facts or evidence links, not copied into PCC as silent duplicates.
3. Prequalification and future-work decisions should be practical and conditional, not absolute yes/no automation.
4. Permission-sensitive financial, prequalification, and reviewer-comment data must be gated by role.
5. Approval and publication should protect draft content and only surface official versions to broad audiences.
6. Security verification, access control, validation, audit logging, API boundaries, and sensitive-data handling should be explicit implementation requirements.
7. Scorecard forms and workflows must meet accessibility standards for keyboard, focus, target size, consistent help, and reduced redundant entry.
