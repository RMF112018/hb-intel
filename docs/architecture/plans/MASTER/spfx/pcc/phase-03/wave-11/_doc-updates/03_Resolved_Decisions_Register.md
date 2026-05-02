# Resolved Decisions Register

Generated: 2026-05-02

## Product Decisions

| ID | Decision | Resolution | Rationale |
|---|---|---|---|
| W11-D001 | Module name | `Responsibility Matrix` | Matches repo Wave 11 naming and user-facing clarity. |
| W11-D002 | Subtitle | `RACI + Owner-Contract Responsibility Control Center` | Communicates the unified scope without renaming the official module. |
| W11-D003 | Module model | Template-driven, project-instance-based control system | Prevents spreadsheet cloning and supports versioning, activation, audit, and project-specific assignments. |
| W11-D004 | Workbook source posture | Workbooks are source references, not UX guardrails | Preserves traceability while enabling a flagship module. |
| W11-D005 | General workbook use | PM and Field workbook rows seed default responsibility items | Prior extraction found 109 default items. |
| W11-D006 | Owner-contract workbook use | Owner-contract workbook seeds structure, party-code posture, and mapping fields; not populated default obligations | Prior extraction found placeholder rows rather than populated obligation descriptions. |
| W11-D007 | RACI posture | RACI is the normalized baseline | RAM/RACI is the best baseline for internal role clarity. |
| W11-D008 | Accountable rule | Active operational items should have exactly one Accountable unless an explicit shared-accountability exception is recorded | Prevents ownership ambiguity. |
| W11-D009 | Contract-party model | Store contract-party responsibility separately from RACI | Prevents conflict between Contractor and Consulted. |
| W11-D010 | Decision-heavy items | Add decision-rights overlay for decisions, approvals, exceptions, sign-offs, and commercial/contract items | RACI alone is insufficient for decision governance. |
| W11-D011 | Template governance | Add template versioning, approval, effective dates, retirement, and migration policies | Prevents stale defaults and uncontrolled template drift. |
| W11-D012 | Project instance governance | Create project-specific responsibility records from templates | Preserves historical template version and supports project-specific assignments. |
| W11-D013 | Import workflow | Workbook rows require classification and human review before active default status | Prevents accidental activation of headers, placeholders, ambiguous rows, or formatting-only rows. |
| W11-D014 | Team & Access integration | Role assignments resolve through Team & Access project roster | Keeps person assignments current and flags inactive users/vacant roles. |
| W11-D015 | Current action owner | Add ball-in-court/current action owner fields | Makes the module operational, not just informational. |
| W11-D016 | Workflow steps | Required for review, approval, decision, sign-off, and contractual-obligation items | Supports multi-step review/approval patterns. |
| W11-D017 | Evidence | Store evidence links and metadata, not binary documents | HB Document Control Center remains evidence/file authority. |
| W11-D018 | Priority Actions | Generate Priority Actions from critical exceptions and overdue current actions | Ensures actionable gaps surface outside the matrix. |
| W11-D019 | Project Readiness | Critical gaps contribute blockers to Project Readiness | Aligns Wave 11 with Wave 8 framework. |
| W11-D020 | Approvals | Responsibility Matrix requests approvals; Wave 14 owns approval execution | Preserves module boundaries. |
| W11-D021 | Export/snapshots | Governed snapshots are target-state records, not contract amendments | Supports owner meetings and audit posture without legal overreach. |
| W11-D022 | Legal posture | No legal advice, no automatic contract interpretation, no creation of legal obligations | Required for risk control. |
| W11-D023 | External systems | Launcher/reference-only; no runtime writeback or sync | Preserves MVP and safety boundaries. |
| W11-D024 | UX lanes | Use eight lanes: Overview, Matrix, Register, Owner-Contract Mapping, My Responsibilities, Gaps & Conflicts, Handoffs, Template/Admin | Provides complete workflow coverage. |
| W11-D025 | Health score | Add blocker-first Matrix Health Score | Prevents blended metrics from hiding critical gaps. |
| W11-D026 | Notifications | Define notification/escalation policy as target architecture even if runtime is later | Required for full module development. |
| W11-D027 | Audit | All changes to assignments, contract-party responsibility, evidence, exceptions, templates, and snapshots must be audit logged | Provides accountability and traceability. |

## No Remaining Open Product Decisions

This package resolves the product-level architecture for Wave 11. Local implementation prompts should validate repo truth and execute documentation updates; they should not reopen the module concept unless repo truth creates a contradiction.
