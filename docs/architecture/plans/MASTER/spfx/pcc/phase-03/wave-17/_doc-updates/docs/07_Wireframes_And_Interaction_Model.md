# 07 — Wireframes and Interaction Model

## Screen Inventory

- `01_Site_Health_Home.md` — Site Health Home: Landing view showing overall site health, top findings, stale sources, and repair-readiness status.
- `02_Health_Overview_Dashboard.md` — Health Overview Dashboard: KPI and trend view grouped by category, severity, and source status.
- `03_Health_Findings_Queue.md` — Health Findings Queue: Filtered queue of unresolved findings with category, severity, status, owner, and action mode.
- `04_Health_Finding_Detail_Drawer.md` — Health Finding Detail Drawer: Drawer showing finding detail, evidence, desired/observed diff, action eligibility, and HBI explanation.
- `05_Template_Compliance_View.md` — Template Compliance View: View comparing required Standard Project Site Template objects with observed objects.
- `06_Provisioning_Status_View.md` — Provisioning Status View: Provisioning phase, last run, blocked steps, and repair-readiness status.
- `07_List_And_Library_Compliance_View.md` — List and Library Compliance View: Compliance matrix for required lists, libraries, fields, indexes, and views.
- `08_Permission_And_Access_Posture_View.md` — Permission and Access Posture View: Role/access alignment and permission inheritance summary with redaction.
- `09_Settings_Health_Integration_View.md` — Settings Health Integration View: Wave 16 settings health snapshots and validation references.
- `10_External_Source_Health_View.md` — External Source Health View: Wave 15 external source health, stale status, mapping completeness, and lineage.
- `11_Admin_Verification_Queue.md` — Admin Verification Queue: Authorized admin review queue for evidence sufficiency and repair-readiness.
- `12_Repair_Request_Drawer.md` — Repair Request Drawer: Future-gated repair request drawer with disabled reasons and no execution.
- `13_Evidence_And_Traceability_Panel.md` — Evidence and Traceability Panel: Evidence records, timestamps, confidence, source systems, and redaction details.
- `14_Audit_And_Health_History.md` — Audit and Health History: Business audit events, finding lifecycle history, and source-read history.
- `15_HBI_Health_Explanation_Panel.md` — HBI Health Explanation Panel: Grounded HBI explanation, citations, uncertainty, and refusal boundaries.
- `16_Mobile_Responsive_Health_View.md` — Mobile Responsive Health View: Mobile-friendly stacked view preserving summary, findings, and drawer access.

## Core Interaction Model

1. User opens Site Health from PCC navigation.
2. Site Health loads composite read model.
3. Overview cards show overall status, worst severity, stale sources, and unresolved findings.
4. User filters by category, severity, status, and source status.
5. User opens a finding drawer.
6. Drawer shows summary, evidence, desired/observed diff, affected module, source status, role-based action availability, and disabled reasons.
7. Authorized users may request review where allowed.
8. Repair actions remain disabled/future-gated in Wave 17 documentation.
9. Admin verification queue displays only to authorized admin personas.
10. HBI panel explains observed evidence and refuses mutation or unsupported decisions.

## Detail Drawer Behavior

- Opens from queue row, card, or deep link.
- Focus moves to drawer title or first meaningful static content.
- Escape closes drawer.
- Focus returns to trigger.
- Drawer includes:
  - finding summary;
  - status and severity;
  - affected object;
  - evidence panel;
  - desired/observed diff;
  - source status;
  - action eligibility;
  - disabled reasons;
  - HBI explanation.

## Repair Request Drawer Behavior

- Future-gated in Wave 17.
- Visible only when actor can request review or future repair.
- Must show:
  - no automatic repair statement;
  - approval/checkpoint requirement;
  - admin verification requirement;
  - blocked reasons;
  - evidence bundle references;
  - no-tenant-mutation attestation.

## Admin Verification Queue Behavior

- Admin-only or IT/PCC-admin only.
- Shows evidence sufficiency, confidence, stale state, and repair-readiness outcome.
- Does not expose command execution.
- Does not expose secrets, tokens, or raw sensitive tenant details.
