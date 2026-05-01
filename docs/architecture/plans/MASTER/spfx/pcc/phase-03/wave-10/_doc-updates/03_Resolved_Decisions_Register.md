# Resolved Decisions Register

Generated: 2026-05-01

## Product Decisions

| ID | Decision | Resolution | Rationale |
|---|---|---|---|
| W10-D001 | Unified surface or two submodules | One unified `Permit & Inspection Control Center` surface with internal permit and inspection lanes. | Best UX because permits and inspections are operationally linked and users need one risk/readiness view. |
| W10-D002 | Source of truth | PCC is the internal workflow/accountability/readiness/audit source of truth. AHJ remains the legal/external authority. | Prevents ambiguity while preserving AHJ authority. |
| W10-D003 | AHJ interaction | Launcher links only. | Avoids brittle or unsafe integrations while still improving navigation and process visibility. |
| W10-D004 | Procore posture | Launcher/reference only unless later authorized. | Avoids source-of-truth confusion and direct integration scope creep. |
| W10-D005 | Status override authority | PCC Admin, Project Executive, Project Manager, Manager of Operational Excellence. Executive Oversight remains read-only unless explicitly assigned escalation authority. | Keeps overrides accountable and rare. |
| W10-D006 | Closeout evidence | Permit or inspection closure requires evidence by default, or an authorized override with reason. | Improves data trust and closeout readiness. |
| W10-D007 | Failed inspection handling | Failed inspections create a structured Correction / Reinspection workflow. | Turns failure into action, not passive status. |
| W10-D008 | Reinspection lineage | Model parent inspection, child reinspection, carried-forward failed items, retained passed items, reinspection fee, and final result. | Preserves history and prevents duplicate manual tracking. |
| W10-D009 | Fees | Track fee visibility/risk fields in Wave 10. Defer accounting/payment execution. | Gives PM/PX/accounting visibility without over-scoping. |
| W10-D010 | Status configuration | Use company baseline statuses with controlled admin configuration by AHJ/project type. | Balances consistency with real-world jurisdiction variation. |
| W10-D011 | Inspection scheduling | Track requested/scheduled/window manually. Do not schedule directly through AHJ systems. | Supports operational visibility while preserving external boundary. |
| W10-D012 | Primary UX | Exception-first command center with tables as secondary detail views. | Best UX for users who need to know what requires action now. |

## Required Field Decisions

Permit records must include:

- `revision`
- `applicationValue`
- `permitFee`

Inspection records must include:

- `reInspectionFee`

## Guardrail Decisions

- No AHJ scraping/API integration.
- No external portal automation.
- No external credential storage.
- No automated permit submission.
- No automated inspection scheduling.
- No external writeback.
- No hidden AHJ/Procore/Microsoft/Adobe/Document Crunch/Sage/Compass integration.
- No Procore source-of-truth assumption.
- No evidence-free closeout unless explicit override is captured.
